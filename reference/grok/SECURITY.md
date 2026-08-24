# Security

This gallery is an anonymous, unauthenticated Wave 1 demonstration surface.
It has no accounts, cookies, uploads, credentials, or durable user data.

## Reporting a vulnerability

Report security issues privately through GitHub Security Advisories on this
repository. Do not file public issues that include exploit details, secrets,
or private deployment values.

## Scope

In scope:

- unexpected tool or resource access across example endpoints;
- secret leakage in logs, `/version`, or repository files;
- request-size, timeout, or concurrency bypasses that cause material harm;
- supply-chain issues in locked production dependencies.

Out of scope:

- load that stays within the documented rate and size limits;
- host-side iframe or CSP behavior outside this repository;
- issues that require a paid Vercel or GitHub upgrade to reproduce.

## Logging

Application logs may include the implementation namespace, app slug, MCP
method category, status, duration, byte counts, and safe build identifiers.
They must not include tool arguments, tool results, prompts, App HTML,
authorization headers, cookies, IP addresses, credentials, or user identifiers.

## No SLA

This service is a learning gallery. It is provided as-is, with no availability,
support, or data-retention promise.
