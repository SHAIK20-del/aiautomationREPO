module.exports = ({ env }) => [
  "strapi::logger",
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": [
            "'self'",
            "https://upload.imagekit.io",
            "https://api.imagekit.io",
          ],
          "img-src": ["'self'", "data:", "blob:", "https://ik.imagekit.io"],
          "media-src": ["'self'", "blob:", "https://ik.imagekit.io"],
          "frame-src": ["'self'", "https://eml.imagekit.io"],
        },
      },
    },
  },
  {
    name: "strapi::cors",
    config: {
      origin: [env("WEB_APP_URL", "http://localhost:3000")],
      credentials: true,
    },
  },
  "strapi::poweredBy",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "global::media-guard",
  "strapi::favicon",
  "strapi::public",
];
