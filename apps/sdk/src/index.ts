import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface AsetClientConfig {
  apiKey: string;
  apiSecret: string;
  endpoint?: string;
}

export interface UploadOptions {
  name?: string;
  folderId?: string;
  contentType?: string;
}

export interface AsetFile {
  id: string;
  name: string;
  url: string;
  sizeMb: number;
  starred: boolean;
  createdAt: string;
}

// Helper to canonicalize objects by sorting keys to prevent JSON mismatches
function canonicalize(obj: any): string {
  if (!obj || typeof obj !== 'object' || Object.keys(obj).length === 0)
    return '';
  const sorted: any = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sorted[key] = obj[key];
    });
  return JSON.stringify(sorted);
}

// Generate the HMAC-SHA256 signature
function generateSignature(
  method: string,
  routePath: string,
  timestampStr: string,
  query: any,
  body: any,
  secretKey: string,
): string {
  const canonicalQuery = canonicalize(query);
  const canonicalBody = method !== 'GET' ? canonicalize(body) : '';
  const canonicalString = [
    method,
    routePath,
    timestampStr,
    canonicalQuery,
    canonicalBody,
  ].join('\n');

  return crypto
    .createHmac('sha256', secretKey)
    .update(canonicalString)
    .digest('hex');
}

export class Aset {
  private apiKey: string;
  private apiSecret: string;
  private endpoint: string;

  constructor(config: AsetClientConfig) {
    if (!config.apiKey || !config.apiSecret) {
      throw new Error('ASET SDK Error: Both apiKey and apiSecret are required');
    }
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    // Strip trailing slash if present
    this.endpoint = (config.endpoint || 'http://localhost:5000').replace(
      /\/$/,
      '',
    );
  }

  /**
   * Internal helper to make signed requests to the ASET API
   */
  private async signedRequest(
    method: string,
    routePath: string,
    query: any = null,
    body: any = null,
  ): Promise<any> {
    const timestampStr = Date.now().toString();
    const signature = generateSignature(
      method,
      routePath,
      timestampStr,
      query,
      body,
      this.apiSecret,
    );

    const headers: Record<string, string> = {
      'x-aset-key': this.apiKey,
      'x-aset-timestamp': timestampStr,
      'x-aset-signature': signature,
    };

    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    // Build URL with query params if any
    let url = `${this.endpoint}${routePath}`;
    if (query && Object.keys(query).length > 0) {
      const searchParams = new URLSearchParams();
      Object.keys(query).forEach((key) => {
        if (query[key] !== undefined && query[key] !== null) {
          searchParams.append(key, String(query[key]));
        }
      });
      url += `?${searchParams.toString()}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => response.statusText);
      throw new Error(
        `ASET API Request Failed (${response.status}): ${errText}`,
      );
    }

    return response.json();
  }

  /**
   * Uploads a file (either via a local file path or a raw Buffer) to ASET
   */
  public async upload(
    fileInput: string | Buffer,
    options: UploadOptions = {},
  ): Promise<AsetFile> {
    let fileBuffer: Buffer;
    let fileName = options.name || '';
    let contentType = options.contentType || '';

    // 1. Resolve local file path or raw buffer
    if (typeof fileInput === 'string') {
      if (!fs.existsSync(fileInput)) {
        throw new Error(
          `ASET SDK Upload Error: File does not exist at path: ${fileInput}`,
        );
      }
      fileBuffer = fs.readFileSync(fileInput);
      if (!fileName) {
        fileName = path.basename(fileInput);
      }
    } else if (Buffer.isBuffer(fileInput)) {
      fileBuffer = fileInput;
      if (!fileName) {
        fileName = `upload-${Date.now()}.bin`;
      }
    } else {
      throw new Error(
        'ASET SDK Upload Error: fileInput must be a string path or a Buffer',
      );
    }

    // Determine size and standard fallbacks
    const sizeMb = fileBuffer.length / (1024 * 1024);
    if (!contentType) {
      // Basic extension helper
      const ext = path.extname(fileName).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.txt': 'text/plain',
        '.json': 'application/json',
      };
      contentType = mimeTypes[ext] || 'application/octet-stream';
    }

    // 2. Request a S3/R2 presigned upload URL from ASET backend
    const presignData = await this.signedRequest(
      'POST',
      '/api/sdk/presign-upload',
      null,
      {
        fileName,
        contentType,
        sizeMb,
        folderId: options.folderId || 'root',
      },
    );

    const { uploadUrl, objectKey } = presignData;

    // 3. Upload file bytes directly to the R2 bucket using the presigned URL
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: fileBuffer as any,
    });

    if (!uploadResponse.ok) {
      throw new Error(
        `ASET SDK Upload Error: Direct-to-R2 upload failed (${uploadResponse.status}): ${uploadResponse.statusText}`,
      );
    }

    // 4. Register the successfully uploaded file in ASET database
    const fileRecord = await this.signedRequest(
      'POST',
      '/api/sdk/register-file',
      null,
      {
        name: fileName,
        objectKey,
        sizeMb,
        folderId: options.folderId || 'root',
      },
    );

    return fileRecord as AsetFile;
  }

  /**
   * Retrieves all files (including images) in a specified folder
   */
  public async listFiles(
    options: { folderId?: string } = {},
  ): Promise<AsetFile[]> {
    const data = await this.signedRequest('GET', '/api/sdk/list-files', {
      folderId: options.folderId || 'root',
    });

    return data.files as AsetFile[];
  }
}
