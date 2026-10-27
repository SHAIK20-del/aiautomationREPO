# Dependency security status

A production-only npm audit was executed after a clean frozen install during implementation. It reports **0 critical, 17 high, and 14 moderate affected package entries**. These are npm's package-level counts, including propagated framework findings, not 31 independent CVEs.

This is a **launch blocker requiring dependency review**, alongside the missing live-service verification. A successful application or admin build does not establish production security.

## Compatible patches applied and verified

The root manifest documents narrow transitive overrides, and the regenerated lockfile/frozen install actually resolves:

| Package        | Patched version |
| -------------- | --------------- |
| DOMPurify      | 3.4.17          |
| Markdown-it 14 | 14.3.3          |
| Undici 8       | 8.12.3          |
| Vite 6         | 6.4.5           |
| Zod 4          | 4.6.7           |

The ordinary automatic audit fix changed no packages. npm reused a stale workspace tree when overrides were first added, so the lock was resolved from clean temporary manifests and then installed with `npm ci`. The frontend, CMS admin, and tests were revalidated after that installation.

## Remaining upstream dependency families

| Family                                      | Reason it was not forcibly replaced                                                                                                                                                |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zod 3                                       | The official ImageKit plugin and some Strapi dependencies require the previous major. Replacing it globally with Zod 4 requires compatibility verification.                        |
| React Router 6                              | Strapi's native administrator requires this major; reported patches require a later major.                                                                                         |
| Nodemailer 9                                | Affected transitive email transport; fixed versions require a major update. No custom inquiry email notification is enabled.                                                       |
| Stream-json 1                               | Internal Strapi transfer tooling; a major update needs upstream compatibility work.                                                                                                |
| UUID 8                                      | Older transitive APIs; a major replacement can change module/runtime compatibility.                                                                                                |
| Vite 4/5, esbuild, webpack-dev-middleware 6 | Primarily CMS/plugin development tooling. Serve built CMS assets in production; do not publicly expose development servers. These remain audit findings until reviewed or patched. |

Review the current advisories with `npm audit --omit=dev` and assess affected runtime paths with the hosting configuration. Track compatible upstream Strapi and official ImageKit releases. Do not run `npm audit fix --force`: its suggested changes include framework downgrades that violate this application's Strapi 5 contract.

Application controls include server-only credentials, closed public CMS roles by default, owner sessions, same-origin writes, bounded request bodies, database-backed rate limits, parameterized SQL, restricted media URLs/types, and authenticated upload completion. They reduce particular risks but are not a claim that all dependency advisories are mitigated.
