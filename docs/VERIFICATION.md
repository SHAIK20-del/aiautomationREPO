# Verification evidence

These results describe the current cloud checkout and local tests. They do not establish a production deployment, a published environment snapshot, or successful connections to hosted Neon, Strapi, or ImageKit accounts.

| Check                                                       | Executed result                                                            |
| ----------------------------------------------------------- | -------------------------------------------------------------------------- |
| Root `npm ci` from the regenerated lockfile                 | Passed; clean install completed                                            |
| `npm ci --prefix tools/migrations`                          | Passed                                                                     |
| `npm run typecheck`                                         | Passed                                                                     |
| `npm test` — validation, sessions, origins, bounded bodies  | 7 passed                                                                   |
| `npm test` — migration and production inquiry SQL on PGlite | 5 passed                                                                   |
| `npm run db:generate` after checking in the migration       | Passed; no schema changes                                                  |
| `npm run build`                                             | Passed; actual optimized Next.js build and route generation                |
| `npm run build:cms`                                         | Passed; native Strapi administration assets built                          |
| `npm run test:cms-contract`                                 | 4 scenarios passed, plus the enclosing test (5 Node runner passes)         |
| Browser checks in Chromium, desktop and mobile              | 19 distinct checks passed; 1 intentional desktop skip                      |
| Production dependency audit                                 | 0 critical, 17 high, 14 moderate package entries remain; launch gate fails |

## What the checks exercise

The database tests apply the actual checked-in PostgreSQL migration, compile the production Drizzle inquiry statement, and execute it on an embedded PostgreSQL engine. They verify inquiry persistence, atomic activity/audit creation, five-per-hour rate limiting, bucket expiry, constraints, and parameterized hostile input. This is stronger than a mocked query assertion, but it is **not a live Neon connectivity test**.

The CMS contract suite starts a separate Next.js process and an explicit local HTTP fixture. It verifies published-only requests and media URL handling, private draft previews, authenticated unpublication/cache invalidation with a genuine HTTP 404, and graceful CMS outages. It **does not log into or publish through an actual Strapi instance**.

Browser checks cover the readable homepage, sculpture or fallback, desktop/mobile headline bounds, expertise keyboard navigation and detail links, human review in the conceptual workflow, project filtering and missing-project 404s, contact validation and failed-persistence messaging, unauthenticated private endpoints, mobile dialog navigation/Escape, reduced motion, one reused WebGL canvas at the final reveal, and a forced WebGL failure fallback.

The final full browser run initially recorded 17 passes, two failures, and one skip. Both failures were an ambiguous test locator after adding the final sculpture's accessible label. The selector was narrowed to the hero's label and those two checks were rerun successfully. Thus 19 distinct checks have passed; this is not described as an untouched all-green initial run. The intentional skip is the mobile-menu test under the desktop viewport, where that control is deliberately absent.

Desktop visual inspection confirmed one actual WebGL canvas, no uncaught page errors, and no horizontal page overflow. Mobile visual inspection exposed and corrected a clipped heading before the final checks. No Lighthouse score, hardware-wide GPU benchmark, or formal WCAG conformance audit is claimed.

## Live checks not executed

The cloud environment did not supply the hosted service credentials. These remain unverified:

- Connection and application of migrations against a real Neon `studio_app` database.
- Strapi boot against a separate real Neon `studio_cms` database.
- First administrator provisioning, login, and actual role/token permission checks.
- Native CMS create/edit/draft/publish/unpublish/delete operations.
- ImageKit image/video uploads, direct large-video completion, media playback, and shared-media deletion protection against the live CMS.
- Real contact persistence and authenticated inquiry management through the deployed interface.
- Real webhook delivery from Strapi and production cache consistency.
- Import of the user's legacy portfolio and verified biography/media.
- Deployment to Vercel/Railway/Render, real-domain SEO validation, environment publication, and restoration in a fresh cloud task.
- The GitHub Actions workflow itself; it was added as source but has not run remotely. Its security job intentionally fails while the documented high advisories remain.

See [deployment](DEPLOYMENT.md) for the exact setup path and [security status](SECURITY.md) for unresolved dependency findings. Review actual legal/contact details and retention policy before publication.

## Reusable cloud configuration

Saved draft fields: `install_script`, `start_skill`, public URL variable requirements, and custom network additions for ImageKit and Neon. The existing reference-site domain rules were preserved. The new service domains are `api.imagekit.io`, `upload.imagekit.io`, `ik.imagekit.io`, `eml.imagekit.io`, and `*.neon.tech`. Add the actual remotely hosted Strapi hostname when it is known.

Draft persistence was confirmed. This does not run the scripts, apply the network update, supply credentials, or publish the snapshot. Review and save the changes in environment settings, then publish the development environment when desired. Application production launch remains subject to the separate integration and dependency gates above.

Visual evidence: [desktop](screenshots/desktop.png) and [mobile](screenshots/mobile.png). Captured from the development server; the small Next.js development indicator is not part of the production build.
