# Design and operational notes

## Visual system

Warm porcelain, espresso plum, deep maroon, blush, sandstone, champagne, and restrained rose share CSS/Tailwind tokens. Instrument Serif and Manrope are self-hosted from font packages; the site does not require Google Fonts at runtime. The studio mark, ribbed Intelligence Core, service studies, and layered architectural mechanism are original procedural/CSS geometry. There are no copied reference assets or fictitious portfolio thumbnails.

The homepage uses one lazily loaded WebGL canvas, tracked between the hero and the final contact sculpture. Its porcelain, glass, and metallic ribs respond to time, pointer position, and a scrubbed GSAP ScrollTrigger. GSAP and Lenis share a ticker and clean up on unmount. Offscreen rendering pauses when neither sculpture destination is visible. Reduced-motion mode removes scroll animation and uses on-demand rendering. The core has a refined CSS fallback when WebGL is unavailable or its error boundary is triggered.

The service artifacts and assembling process study use inexpensive CSS perspective geometry; they are not extra WebGL canvases. The final contact chapter reuses the same WebGL canvas and sculptural geometry, with a second scroll timeline reassembling the separated ribs. It does not instantiate another renderer. Further cinematic art direction can extend that visual system without changing the backend.

The project gallery displays only CMS records. Empty and unavailable collections have deliberate editorial states, not placeholder project cards. The workflow visualization is labeled a concept and sends no integration events or analytics.

## Data ownership and authorization

Strapi is the sole source of project content, using Strapi 5 document IDs. Stable document IDs cross the media workflow; no foreign keys span the CMS and application databases. CMS content is fetched through server-only tokens and validated with Zod.

Contact inquiries, activity, audit, and distributed rate limits share a single PostgreSQL statement. Success is returned only after persistence. User text is parameterized. The rate limit is database-backed, not an in-memory map that resets per serverless process. Honeypot validation and exact Origin checks supplement it.

Vercel's normalized `x-vercel-forwarded-for` is trusted only in a Vercel runtime. Self-hosted traffic shares one anonymous rate bucket by default, so spoofing an arbitrary forwarded header cannot bypass the limit. A self-hosted deployment should replace this with its trusted reverse proxy's verified address mechanism before higher traffic. Keys are HMAC-hashed, and raw IPs are not retained.

The operations interface has one deliberately defined role: the studio owner. It uses a signed, expiring, HttpOnly, SameSite=Strict cookie, secure over production HTTPS. Every private page/action rechecks the owner session. Login is database-rate-limited. Passwords and session secrets are injected server-side; no credential is embedded in a browser bundle. Operations edits log activity/audit events. This is a small owner workflow, not a second project CMS or a multi-user enterprise identity system.

## Maintenance

- Rotate the owner password/session secret to revoke sessions. Rotate CMS and media tokens independently.
- Delete expired `rate_limits` rows on a scheduled maintenance job, e.g. `DELETE FROM rate_limits WHERE expires_at < now() - interval '1 day'`.
- `workflow_demo_events` is defined for future use, but the demonstration does not write it. If enabled later, define consent and retention first.
- Set and document an inquiry-retention policy before launch. Use database backup/recovery appropriate to the selected Neon plan.
- Review orphaned ImageKit files after failed attachment. Never delete media referenced by other content.
- HTTPS, database TLS, scoped service identities, and admin network restrictions are deployment requirements.
- The web CSP currently permits inline Next.js scripts/styles and development `unsafe-eval`. It blocks framing and objects and restricts media/delivery origins. A nonce-based CSP and production-only removal of `unsafe-eval` are sensible next hardening work; do not describe this as a strict nonce-based policy.

## Reproducibility

The root lockfile pins the application graph. The second lockfile pins only the isolated Drizzle CLI and ORM tool pair. Use frozen `npm ci` in both locations. The generated SQL migration and Drizzle metadata are checked in. Application and CMS packages intentionally use different React major versions.

Each cloud task already has an isolated checkout. Reuse `/workspace/aiautomationREPO`; do not create a Git worktree unless explicitly requested.

The CMS requires `CMS_DATABASE_URL`; the web uses `DATABASE_URL`. Distinct names prevent a shared cloud process environment from accidentally routing both applications to the same database.
