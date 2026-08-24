# Security policy

## Scope and support posture

This project is an anonymous demonstration gallery with no SLA. The supported surface is the latest deployed commit on the protected `forward` branch when a production deployment is identified in `BENCHMARK_REPORT.md`. Preview deployments, older commits, forks, and local test hosts are not supported services.

Please report suspected vulnerabilities privately through GitHub's security advisory interface for `different-ai/openwork-mcp-app-gallery-sol`. Do not include credentials, personal data, private deployment bypass values, or unrelated third-party information in an issue. Public issues are appropriate only after a report has been triaged and disclosure coordinated.

## Threat model

The gallery is designed to process only bounded MCP JSON-RPC and deterministic synthetic inputs. It must not accept or introduce:

- authentication credentials, accounts, cookies, or user identifiers;
- file uploads, arbitrary URLs, or server-side network destinations;
- subprocesses, package execution, runtime installs, or dynamic code evaluation;
- durable state, mutable runtime source, write tools, purchases, or external side effects;
- cross-app tool/resource authority;
- logs containing arguments, results, prompts, resource HTML, IP addresses, authorization data, credentials, or private URLs.

Transcript microphone audio remains in the browser and is never sent to this server. The App metadata asks the host for explicit microphone and clipboard permissions only for that resource. The gallery page itself denies microphone, camera, geolocation, payment, USB, and browsing-topics permissions.

## Defensive controls

The gateway validates the exact app slug, canonical host, and optional browser origin; caps request, result, and resource bytes; enforces application deadlines and instance-local concurrency; propagates abort signals; disables server-side sessions; and returns bounded errors. Resource identity, MIME type, source pin, bytes, and SHA-256 are validated before readiness.

Static page responses use a restrictive CSP, `base-uri 'none'`, `object-src 'none'`, `frame-ancestors 'none'`, `form-action 'none'`, `connect-src 'self'`, same-origin opener/resource policies, `Referrer-Policy: no-referrer`, `nosniff`, and `DENY` framing. MCP App HTML travels inside protocol resource contents with separately audited MCP UI CSP/permission metadata so page framing headers do not become App authority.

CI runs strict checks, dual-era protocol contracts, real-browser App bridge tests, source and secret scans, notice/provenance verification, a production dependency audit, CodeQL, an SBOM build, and dependency review or its locked-audit fallback.

## Operational response

Every app can be disabled independently through `DISABLED_APP_SLUGS`. A suspected app-specific incident should disable only the affected slug when safe, preserve public non-sensitive evidence, and verify `/readyz`, `/version`, `/apps.json`, and all remaining endpoints. Rollback and redeployment must target an exact known-good commit and remain separate from repository history changes.

Never post tokens, raw provider logs, private Preview URLs, bypass values, or user material in repository evidence or issue discussion.
