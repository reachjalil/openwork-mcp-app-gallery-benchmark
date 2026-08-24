export const GALLERY_SECURITY_HEADERS: Record<string, string> = {
  "content-security-policy":
    "default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; media-src 'none'; worker-src 'none'; upgrade-insecure-requests",
  "cross-origin-opener-policy": "same-origin",
  "cross-origin-resource-policy": "same-origin",
  "permissions-policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
};

export function applySecurityHeaders(headers: Headers): void {
  for (const [key, value] of Object.entries(GALLERY_SECURITY_HEADERS)) {
    if (!headers.has(key)) headers.set(key, value);
  }
}
