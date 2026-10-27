# The Living Atelier

An independent AI automation and creative technology studio, built around an original porcelain-and-burgundy WebGL sculpture.

Next.js 16 / React 19 / TypeScript / Tailwind 4 / React Three Fiber / GSAP / Lenis / Strapi 5 / Neon PostgreSQL / Drizzle / ImageKit.

## Run the public site

Use **Node 22.16+ in the 22.x series** (`nvm use`). Strapi's ImageKit plugin tooling currently requires Node ≤22; the frontend supports this runtime too. The CMS has its own React 18 dependency, separate from the React 19 frontend.

```sh
npm ci
npm ci --prefix tools/migrations
npm run dev
```

The frontend runs on port 3000. Without hosted-service configuration it renders the studio, services, interactive concepts, and an honest portfolio empty state. Contact submissions return a failure, never a simulated success. Project records are never hardcoded into production UI.

```sh
node scripts/init-local-env.mjs
```

This creates ignored, owner-readable `.env` files with cryptographically generated **local application secrets**. It preserves existing files and leaves third-party credentials empty. Complete the hosted-service fields using [the deployment guide](docs/DEPLOYMENT.md). Never paste secret values into chat or commit `.env` files.

```sh
npm run db:migrate  # studio_app only; reads apps/web/.env if no injected DATABASE_URL
npm run dev:cms    # separate terminal; requires CMS_DATABASE_URL for studio_cms
```

Strapi serves its native admin on port 1337. Project editing and publishing live there. `/operations` is a separate, owner-authenticated inquiry workflow, including direct video upload to an existing project's draft. `/admin` redirects to the configured Strapi admin URL.

## Architecture

```text
apps/web                 Next.js public site, inquiry API, private operations
apps/cms                 Strapi models, native admin, ImageKit plugin, media guards
packages/database        Application schema, checked-in migrations, Neon client
packages/shared          Validation, conceptual workflow, starter service copy
tools/migrations         Isolated, locked Drizzle CLI + ORM toolchain
tests                    Browser, security, and HTTP contract checks
```

**Content:** Next.js → server-only Strapi token → published Strapi documents → `studio_cms`.

**Inquiries:** Next.js → Drizzle / Neon HTTP → `studio_app`. Inquiry, activity, audit, and the shared database rate limit are committed in one SQL statement.

**Media:** native Strapi upload → official ImageKit plugin → ImageKit. Large videos use an owner-authorized browser-to-ImageKit upload, then a scoped server call verifies ImageKit metadata, imports the asset into Strapi's media library, and attaches it to a **draft**. Publishing is always separate.

Strapi owns its tables. Drizzle never manages the CMS database. The isolated migration tools avoid npm hoisting the CLI away from its ORM, and avoid optional React Native peer conflicts with the CMS.

## Validate

```sh
npm run typecheck
npm test                    # security + actual migration/inquiry SQL on embedded PostgreSQL
npm run test:cms-contract    # Next.js ↔ local HTTP fixture; not a live Strapi test
npm run build
npm run build:cms
npm run dev                 # keep running for the browser suite
npm run test:e2e
```

The browser suite uses `/usr/bin/chromium` in this cloud environment. Elsewhere, install Chromium with Playwright and set `CHROMIUM_PATH` to that executable. Set `TEST_BASE_URL` if the server runs on a different address. Contract tests use a separate build directory and port 3001.

See [test evidence and remaining integration checks](docs/VERIFICATION.md), [deployment and CMS configuration](docs/DEPLOYMENT.md), and [design and operational notes](docs/ARCHITECTURE.md).

## Current integration boundary

The application source and local workflows are implemented. Real Neon connectivity, Strapi administrator login and publication, and ImageKit upload/playback require your service instances and credentials. No project titles, owner biography, client relationships, or media were imported from the old portfolio because access to the reference site was denied by the environment's egress policy. The supplied candidate project titles have not been published.

The [dependency security report](docs/SECURITY.md) records compatible patches and unresolved upstream advisories. The application is not cleared for production launch until those findings and live integration checks are resolved.
