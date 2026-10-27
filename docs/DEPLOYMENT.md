# Deployment and content operations

## 1. Configure Neon isolation

Create two independent PostgreSQL databases or Neon projects:

- `studio_cms`: Strapi-owned tables and editorial content.
- `studio_app`: Drizzle-owned inquiries, activity, settings, audit records, and rate limits.

Use different, least-privilege credentials. Strapi needs schema-management permission in its own database. The application migration identity needs DDL permission only in `studio_app`; use a narrower application role for runtime where practical. Keep TLS verification enabled. Use Neon connection strings with `sslmode=require` or `sslmode=verify-full`; never use the same database URL in both applications.

Set `apps/cms/.env` → `CMS_DATABASE_URL` to the CMS database and `apps/web/.env` → `DATABASE_URL` to the application database. The web client uses Neon's HTTP driver; Strapi uses PostgreSQL through its supported database layer.

From the repository root, run `npm run db:migrate`. It reads the web `.env` when a connection has not been injected. In production, inject the application URL into the migration job. Do not use `drizzle-kit push` or point this command at the CMS database.

## 2. Start Strapi and provision the administrator

Copy the CMS example or use `node scripts/init-local-env.mjs`. Configure all application keys, salts, and encryption secrets. The helper generates local values without printing them. Keep durable production secrets in your host's secret manager, not in source control.

Run `npm run dev:cms` for development, or `npm run build:cms` followed by `npm run start -w @atelier/cms` for a persistent production Node service. Use Node 22.16+ (22.x), persistent database access, and a writable temporary upload directory. Do not deploy Strapi as a stateless Vercel function.

Open the native Strapi administrator interface and create the first administrator. Restrict admin access at the host/network layer for production. Keep public and authenticated end-user role permissions closed unless deliberately needed. Disable public registration in Users & Permissions settings.

Create a **custom, least-privilege server API token** for Next.js. Allow `find` / `findOne` on projects, project categories, services, homepage, and studio settings. It must not permit create, update, delete, or publish. Set it as `STRAPI_SERVER_API_TOKEN` in the web application.

Create a second **custom API token**, `STRAPI_MEDIA_API_TOKEN`, allowing only project `find` / `findOne` and the custom `studio-media.attach` action. It is used only by owner-authorized server routes; never send it to a browser.

If the custom action is not shown in the host's Strapi token UI, check the startup registration of `api::studio-media.studio-media.attach`; do not work around this by granting a Full Access token.

## 3. Configure the official ImageKit plugin

The installed official package is `strapi-plugin-imagekit` 1.0.2, whose documented peers support Strapi 5 and React 18. Its npm README was inspected for the actual configuration contract. The external ImageKit documentation URL was blocked during implementation.

Set `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, and `IMAGEKIT_URL_ENDPOINT` in the CMS. After the admin build, go to **Settings → ImageKit Plugin → Configuration**. The plugin copies code defaults only on first initialization; environment variables do not override settings already saved in the database.

Confirm:

- The integration and uploads are both enabled.
- The public key, private key, and delivery endpoint are correct.
- The base upload folder is `/studio/`.
- Transform URLs are enabled; public portfolio media uses public delivery URLs.
- File-size checks are configured. Standard CMS uploads are limited to 100 MB.
- Upload types are restricted to JPEG, PNG, WebP, AVIF, MP4, and WebM by the server middleware.

Standard CMS uploads use the plugin's configured base folder. **Per-project directories are implemented only for the custom direct-video workflow**, which uses `/studio/projects/{slug}/videos/`. The standard plugin does not dynamically create every folder in the proposed brief.

The custom media guard rejects local-storage fallback, blocks the plugin's unauthenticated import webhook, and prevents deleting media with existing content references. Detach media from all content before deletion. Verify the guard with your real Strapi instance before launch, including unpublished content references and bulk deletion behavior. Bulk deletion is deliberately blocked so each detached asset can be checked individually.

Set the same ImageKit endpoint in Next.js. `mediaUrl()` permits only HTTPS URLs under that endpoint. Custom CDN domains must also be configured in the CMS CSP; the web CSP derives its media origin from the environment at build time.

## 4. Configure large-video uploads

The web application also requires the ImageKit public/private keys and the scoped CMS media token. Configure `OPERATIONS_PASSWORD` (at least 20 characters), `OPERATIONS_SESSION_SECRET` and `RATE_LIMIT_SALT` (at least 32 characters each). The generated local password is in the ignored web `.env`; use a new strong production password from your secret manager.

Log in at `/operations`, then:

1. Create or open a project in Strapi and copy its **document ID**, not a numeric database row ID.
2. Choose an MP4/WebM file up to 500 MB in the private operations uploader.
3. The server authorizes the owner, checks the draft project, and signs a single-use ImageKit upload token valid for ten minutes.
4. The browser sends the payload directly to ImageKit, with progress reporting. No video payload passes through Next.js.
5. On completion, Strapi obtains trusted file details from ImageKit, checks folder, MIME, size, and delivery origin, registers the media, and attaches it to the draft.
6. Review the draft and publish through the native CMS. Uploading never publishes it.

If upload succeeds but attachment fails, use **Retry attachment**. A failed upload can be retried; it is not resumable. Failed attachments may leave an unreferenced ImageKit asset that an administrator should review and clean up. The custom completion path is authenticated; the official plugin import webhook remains disabled.

## 5. Editorial content

Create the six services and publish them in Strapi to replace the frontend's generic starter service descriptions. Create Homepage and Studio Settings single-type entries and publish them. These control hero copy, local CTA destinations, section headings, studio biography, brand description, contact email, social metadata, and footer content. Source code provides restrained defaults while the CMS is empty.

Create project categories, then project drafts. Add a title, unique slug, description, media, technologies, date, type, featured status, and order. Only publish verified work with real media. No projects were seeded. Verify the legacy portfolio manually before importing its records; candidate titles from the brief are not verified accomplishments.

## 6. Preview and revalidation

Use the same strong `STRAPI_PREVIEW_SECRET` in CMS and web. Set `WEB_APP_URL` in the CMS and `NEXT_PUBLIC_SITE_URL` in the web application to their real HTTPS origins. Strapi preview creates an authenticated draft-mode session for `/projects/{slug}`. The normal API adapter always requests `status=published`; draft requests are server-only and uncached.

In Strapi, create a webhook to `https://YOUR_WEB_HOST/api/revalidate`. Configure:

```text
Authorization: Bearer <STRAPI_REVALIDATION_SECRET>
Content-Type: application/json
```

Enable create, update, publish, unpublish, and delete events for the relevant content. This uses Strapi's supported custom-header shared-secret authentication over TLS; it does not claim a native Strapi HMAC signature. Use a secret of at least 32 characters, rotate it when needed, and keep it out of logs.

The handler accepts known models/events, immediately expires the `cms` cache tag, and invalidates homepage, indexes, detail paths, and sitemap. Missing/unpublished projects return HTTP 404. The project detail route deliberately has no streaming loading boundary, and metadata is blocking, so a missing document cannot first flush HTTP 200.

## 7. Hosting

**Vercel:** import the repository, use `apps/web` as the Next.js project root, enable dependencies outside that directory, and install workspace dependencies from the repository root. Build with `npm run build -w @atelier/web` from the root (or `npm run build` inside the web app). Use Node 22.x. Supply all web environment variables before building because content and the CSP may be prerendered. Apply database migrations in a separate controlled deployment job, not on every request.

**Railway/Render:** use repository root, Node 22.x, install with `npm ci`, build with `npm run build:cms`, and start with `npm run start -w @atelier/cms`. Set `HOST=0.0.0.0`, the platform port, `CMS_PUBLIC_URL`, web origin, `CMS_DATABASE_URL`, application secrets, and ImageKit settings. Ensure outbound HTTPS to Neon/ImageKit and secure admin access. Persist only database/configuration externally; local media persistence is deliberately not a storage solution.

The optional bundled Node 22 development dependency exists for this cloud image's Node 24 default. On deployment, select Node 22 at the host level rather than relying on that development package when pruning dev dependencies.

## 8. Launch checks still required

Use your real hosted instances to verify administrator login, scoped token permissions, image/video uploads, draft privacy, publish/update/unpublish/delete behavior, revalidation delivery, media sharing/deletion, and real contact persistence. Verify private inquiries are inaccessible without the owner session. Review the privacy notice, retention period, legal identity, contact details, domain, and deployment region before public launch.

This environment has not performed a production deployment or a live Neon/ImageKit verification. Do not mark those checks passed on the strength of fixture or embedded-database tests.

Review [the dependency security report](SECURITY.md) before enabling public production traffic.
