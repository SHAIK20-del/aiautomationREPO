module.exports = ({ env }) => ({
  auth: { secret: env("ADMIN_JWT_SECRET") },
  apiToken: { salt: env("API_TOKEN_SALT") },
  transfer: { token: { salt: env("TRANSFER_TOKEN_SALT") } },
  secrets: { encryptionKey: env("ENCRYPTION_KEY") },
  preview: {
    enabled: true,
    config: {
      allowedOrigins: [env("WEB_APP_URL", "http://localhost:3000")],
      async handler(uid, { documentId, locale, status }) {
        const slug = (
          await strapi.documents(uid).findOne({ documentId, locale, status })
        )?.slug;
        if (uid === "api::project.project" && slug)
          return `${env("WEB_APP_URL")}/api/preview?secret=${encodeURIComponent(env("STRAPI_PREVIEW_SECRET"))}&slug=${encodeURIComponent(slug)}`;
        return null;
      },
    },
  },
});
