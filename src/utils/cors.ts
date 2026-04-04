import type { CorsOptions } from "cors";

const corsOptions: CorsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

function buildCorsHeaders(req: Request): Record<string, string> {
  const headers: Record<string, string> = {};

  const methods = corsOptions.methods;
  headers["Access-Control-Allow-Methods"] = Array.isArray(methods)
    ? methods.join(", ")
    : (methods ?? "GET,POST,PUT,DELETE,OPTIONS");

  const allowed = corsOptions.allowedHeaders;
  if (allowed) {
    headers["Access-Control-Allow-Headers"] = Array.isArray(allowed)
      ? allowed.join(", ")
      : allowed;
  }

  const originOpt = corsOptions.origin;
  if (originOpt === true) {
    const origin = req.headers.get("Origin");
    if (origin) {
      headers["Access-Control-Allow-Origin"] = origin;
      headers.Vary = "Origin";
    }
  } else if (typeof originOpt === "string") {
    headers["Access-Control-Allow-Origin"] = originOpt;
  } else if (Array.isArray(originOpt)) {
    const origin = req.headers.get("Origin");
    if (origin && originOpt.includes(origin)) {
      headers["Access-Control-Allow-Origin"] = origin;
      headers.Vary = "Origin";
    }
  }

  if (corsOptions.credentials) {
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  const exposed = corsOptions.exposedHeaders;
  if (exposed) {
    headers["Access-Control-Expose-Headers"] = Array.isArray(exposed)
      ? exposed.join(", ")
      : exposed;
  }

  if (corsOptions.maxAge != null) {
    headers["Access-Control-Max-Age"] = String(corsOptions.maxAge);
  }

  return headers;
}

function withCors(req: Request, res: Response): Response {
  const corsHeaders = buildCorsHeaders(req);
  const merged = new Headers(res.headers);
  for (const [key, value] of Object.entries(corsHeaders)) {
    merged.set(key, value);
  }
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: merged,
  });
}

export { buildCorsHeaders, withCors };

