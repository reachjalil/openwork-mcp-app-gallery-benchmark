# Security policy

## Reporting a vulnerability

Please report suspected vulnerabilities privately through GitHub Security
Advisories for this repository ("Report a vulnerability" under the Security
tab). Do not open a public issue for a security report.

There is no bug bounty. This is a hosted demonstration gallery with no
accounts, no user data, and no SLA.

## Scope and runtime boundary (Wave 1)

- Anonymous public access only; no accounts, cookies, uploads, credentials,
  database, or durable user state.
- No server-side external network access is intended; no subprocess
  execution; no arbitrary package execution; no write tools.
- Request bodies are capped (256 KiB default), results and UI resources are
  capped (512 KiB initial ceiling), tool work has a 15-second application
  deadline under a 30-second platform maximum, and concurrency is bounded.
- Logs never contain tool arguments, tool results, prompts, resource
  contents, authorization headers, cookies, IP addresses, or credentials.

## Supported versions

Only the current production deployment (built from the `forward` branch) is
supported.
