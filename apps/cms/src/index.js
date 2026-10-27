module.exports = {
  register({ strapi }) {
    // Prevent uploads silently falling back to local storage when ImageKit is not configured.
    strapi.server.use(async (ctx, next) => {
      if (
        ctx.method === "POST" &&
        ctx.path === "/upload" &&
        !process.env.IMAGEKIT_PRIVATE_KEY
      )
        return ctx.throw(503, "ImageKit must be configured before uploading.");
      await next();
    });
  },
  async bootstrap({ strapi }) {
    // No project seeds: the CMS is the sole source of published work.
    // Public roles remain closed. Next.js uses a least-privilege server API token.
  },
};
