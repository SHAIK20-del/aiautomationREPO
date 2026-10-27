module.exports =
  (_config, { strapi }) =>
  async (ctx, next) => {
    // The official plugin includes an unauthenticated import webhook. This deployment uses authenticated completion instead.
    if (/^\/(?:api\/)?imagekit\/webhook/.test(ctx.path)) return ctx.throw(404);
    if (
      ctx.method === "POST" &&
      /^\/(?:api\/)?upload(?:\/files(?:\/\d+\/replace)?)?\/?$/.test(ctx.path)
    ) {
      if (!process.env.IMAGEKIT_PRIVATE_KEY)
        return ctx.throw(503, "Configure ImageKit before uploading");
      const settings = await strapi
        .plugin("imagekit")
        .service("settings")
        .getSettings();
      if (!settings?.enabled || !settings?.uploadEnabled)
        return ctx.throw(
          503,
          "Enable ImageKit delivery and uploads in Settings before uploading",
        );
      const files = Object.values(ctx.request.files ?? {}).flat();
      const allowed = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/avif",
        "video/mp4",
        "video/webm",
      ];
      for (const file of files)
        if (!allowed.includes(file.mimetype))
          return ctx.throw(400, "Unsupported media type");
    }
    // Require explicit detachment and individual deletion; bulk folder operations can hide referenced assets.
    if (
      ctx.method === "POST" &&
      /^\/(?:api\/)?upload\/actions\/bulk-delete$/.test(ctx.path)
    )
      return ctx.throw(
        409,
        "Delete detached media individually so references can be checked",
      );
    const match = ctx.path.match(/^\/(?:api\/)?upload\/files\/(\d+)$/);
    if (ctx.method === "DELETE" && match) {
      const file = await strapi.db
        .query("plugin::upload.file")
        .findOne({ where: { id: Number(match[1]) }, populate: ["related"] });
      if (file?.related?.length)
        return ctx.throw(
          409,
          "Detach this media from all content before deleting it",
        );
    }
    await next();
  };
