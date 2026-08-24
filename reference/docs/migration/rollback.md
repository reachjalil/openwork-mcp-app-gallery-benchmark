# Rollback

## Git

Local bundles remain at
`/Users/jalillaaraichi/openwork-mcp-app-gallery-migration-backup-2026-08-21`.

| Bundle | SHA-256 |
| --- | --- |
| `sol.bundle` | `807dbb8c344e12e7533b19b3f82bc5c0ebd3babae3c4a1ae57d68a1fb25741b2` |
| `fable.bundle` | `cf17f07ad3657669b581bd6120127baced346cbac4ac610c0ffa4caae73ba71b` |
| `grok.bundle` | `8b452fd8a211108a5fe04d4afcdf4c54a43859ed054a8c470bf0a8845a65acc1` |

Do not delete transferred GitHub repositories or these bundles as cleanup.

If a subtree import is wrong before it is pushed, delete only the unpushed
migration branch. Do not rewrite the source archives.

## Vercel

Capture the current production deployment of each project before Git
relinking. If one Production fails after `main` cutover, roll back only that
project:

```bash
vercel rollback <previous-deployment-url-or-id> --yes --scope jalil-7198s-projects
```

Do not roll back the two healthy projects unless a cross-project
compatibility requirement is proven.

If Git reconnection fails, keep the existing production deployment. Restore
the previous Git connection only when that repository is still accessible
and the action is documented.

## GitHub

Do not recreate `different-ai/openwork-mcp-app-gallery-*`. Recreating those
names would destroy redirects.
