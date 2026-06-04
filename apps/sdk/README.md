# ASET Client SDK

The official Node.js SDK for programmatically interacting with the **ASET** Cloud Storage & Media Optimizer.

This library allows backend servers to securely authenticate using HMAC-SHA256 signatures, upload files (directly to Cloudflare R2/S3 storage buckets via presigned URLs), and retrieve file listings.

---

## 📦 Installation

Install the package via NPM or your preferred package manager:

```bash
npm install aset-sdk
# or
pnpm add aset-sdk
# or
yarn add aset-sdk
```

---

## 🚀 Quick Start

### 1. Initialize the Client

Instantiate the SDK using the **Public Key ID** (`keyId`) and **Private Secret Key** (`apiSecret`) generated in your ASET dashboard settings panel.

```typescript
import { Aset } from 'aset-sdk';

const aset = new Aset({
  apiKey: 'ast_pk_...', // Your Public Key ID
  apiSecret: 'ast_sk_...', // Your Private Secret Key (keep this secure!)
  endpoint: 'https://api.aset.space', // Optional: defaults to http://localhost:5000
});
```

---

## 📂 Core Features

### 1. Upload a File

You can upload files either by specifying a **local file path** or by passing a raw **Node.js Buffer**.

#### A. Uploading via Local File Path

The SDK automatically reads the file from disk, resolves its filename, and determines the mimetype.

```typescript
try {
  const file = await aset.upload('./images/banner.png', {
    name: 'optimized-banner.png', // Optional: override filename
    folderId: 'your-folder-uuid-here', // Optional: target subfolder
  });

  console.log('Upload Succeeded!');
  console.log('File ID:', file.id);
  console.log('Public URL:', file.url);
  console.log('Size (MB):', file.sizeMb);
} catch (error) {
  console.error('Upload Failed:', error);
}
```

#### B. Uploading via Buffer

Perfect for in-memory file manipulations, Express multipart uploads (e.g., Multer), or image downloads from third-party APIs.

```typescript
const fileBuffer = Buffer.from('Some text data');

const file = await aset.upload(fileBuffer, {
  name: 'document.txt',
  contentType: 'text/plain', // Recommended when uploading raw Buffers
  folderId: 'your-folder-uuid-here',
});

console.log('Uploaded buffer url:', file.url);
```

---

### 2. List Files

Retrieve metadata and public URLs for all active files inside a folder (or the root directory).

```typescript
try {
  const files = await aset.listFiles({
    folderId: 'your-folder-uuid-here', // Optional: defaults to 'root'
  });

  console.log(`Found ${files.length} files:`);
  files.forEach((file) => {
    console.log(`- ${file.name}: ${file.url} (${file.sizeMb} MB)`);
  });
} catch (error) {
  console.error('Failed to list files:', error);
}
```

---

## 🔒 Security Best Practices

> [!CAUTION]
> **Do not use this SDK in browser-side applications.**
>
> Using this SDK on the frontend (React, Next.js client components, Vue, etc.) exposes your **Private Secret Key** (`apiSecret`) to client-side inspect tools, allowing attackers to hijack your cloud storage and manipulate files.
>
> Always run the SDK on a secure server environment (e.g., Express, Next.js API routes, NestJS) and load credentials using environment variables:
>
> ```typescript
> const aset = new Aset({
>   apiKey: process.env.ASET_API_KEY!,
>   apiSecret: process.env.ASET_API_SECRET!,
> });
> ```
