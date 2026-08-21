# Third-party notices

This repository redistributes and adapts source code and assets from the
following third-party project. Copied files keep their original licensing;
gallery-owned code is separately licensed under Apache-2.0 (see `LICENSE`).

## modelcontextprotocol/ext-apps

- Repository: <https://github.com/modelcontextprotocol/ext-apps>
- Exact pinned commit: `10195ad91851502134930e9b80ec2c04e277a720`
- Upstream package version at that commit: `1.7.5`
- Copied paths: recorded per file, with content digests and local
  modifications, in [`upstream/manifest.json`](upstream/manifest.json).

### Upstream license status at the pinned commit

The upstream `LICENSE` file at the pinned commit states that the MCP project is
undergoing a licensing transition from the MIT License to the Apache License,
Version 2.0:

> The MCP project is undergoing a licensing transition from the MIT License to
> the Apache License, Version 2.0 ("Apache-2.0"). All new code and
> specification contributions to the project are licensed under Apache-2.0.
> Documentation contributions (excluding specifications) are licensed under
> CC-BY-4.0.
>
> Contributions for which relicensing consent has been obtained are licensed
> under Apache-2.0. Contributions made by authors who originally licensed
> their work under the MIT License and who have not yet granted explicit
> permission to relicense remain licensed under the MIT License.
>
> No rights beyond those granted by the applicable original license are
> conveyed for such contributions.

The upstream root `package.json` and each copied example's `package.json`
declare `"license": "MIT"` at the pinned commit. This repository therefore
treats every copied example file as available under the MIT License, with the
Apache-2.0 transition status noted above, and preserves the complete upstream
license text below.

The complete upstream `LICENSE` file (transition statement, Apache-2.0 text,
and MIT text) is preserved verbatim at
[`upstream/ext-apps/LICENSE`](upstream/ext-apps/LICENSE).

### MIT License (as applicable to copied upstream files)

MIT License

Copyright (c) 2024-2025 Model Context Protocol a Series of LF Projects, LLC.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

### Local modifications

Local modifications to copied files (import path changes and the SDK v1 to
SDK v2 registration adaptation) are recorded per file in
`upstream/manifest.json` and verified by `scripts/verify-notices.mjs`.

## Runtime dependencies

Runtime and build dependencies are installed from npm under their own
licenses and are recorded with exact versions in `pnpm-lock.yaml`. The
generated SBOM in CI lists their license identifiers.
