# Third-party notices

This repository includes a frozen audit snapshot of selected third-party example source. The initial governance-only bootstrap commit did not contain that source; the feature implementation does.

The implementation is authorized to adapt only these packages from [`modelcontextprotocol/ext-apps`](https://github.com/modelcontextprotocol/ext-apps) at exact commit `10195ad91851502134930e9b80ec2c04e277a720`:

- `examples/basic-server-react`
- `examples/budget-allocator-server`
- `examples/cohort-heatmap-server`
- `examples/customer-segmentation-server`
- `examples/scenario-modeler-server`
- `examples/transcript-server`

At the frozen revision, each selected package manifest declares the MIT License. Every copied file, original path, digest, byte count, effective license, notice, and local-modification statement is recorded in `upstream/manifest.json`.

The frozen files under `upstream/` remain byte-for-byte copies. Size-bounded gallery-owned adaptations for Get Time, Cohort Heatmap, and Scenario Modeler live under `ui-adaptations/`; a bounded canvas compatibility layer used by Budget Allocator and Customer Segmentation lives at `src/ui/chart-shim.ts`. Their basis, rationale, file digests, byte counts, and Apache-2.0 ownership are also recorded in `upstream/manifest.json`.

The upstream root states that the project is transitioning from MIT to Apache-2.0: contributions with relicensing consent and new code/specification contributions are Apache-2.0, while contributions without explicit relicensing consent remain MIT. Documentation other than specifications is Creative Commons Attribution 4.0 (CC-BY-4.0). The selected package manifests identify the copied example packages as MIT; no upstream documentation is copied here.

Gallery-owned source is licensed under Apache-2.0. Dependency license details remain available in the generated SBOM and package lock.

## MIT License

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
