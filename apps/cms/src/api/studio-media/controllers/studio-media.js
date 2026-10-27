const crypto = require("node:crypto");
module.exports = {
  async attach(ctx) {
    const { fileId, documentId } = ctx.request.body ?? {};
    if (
      typeof fileId !== "string" ||
      !/^\w{10,80}$/.test(fileId) ||
      typeof documentId !== "string" ||
      !/^\w{10,40}$/.test(documentId)
    )
      return ctx.badRequest("Invalid media reference");
    const key = process.env.IMAGEKIT_PRIVATE_KEY,
      endpoint = process.env.IMAGEKIT_URL_ENDPOINT;
    if (!key || !endpoint) return ctx.throw(503, "ImageKit is not configured");
    const project = await strapi
      .documents("api::project.project")
      .findOne({ documentId, status: "draft", populate: ["projectVideo"] });
    if (!project) return ctx.notFound();
    const res = await fetch(
      `https://api.imagekit.io/v1/files/${encodeURIComponent(fileId)}/details`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(key + ":").toString("base64")}`,
        },
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!res.ok) return ctx.badRequest("Unable to verify ImageKit file");
    const file = await res.json();
    const base = new URL(endpoint),
      url = new URL(file.url);
    const folder = `/studio/projects/${project.slug}/videos/`;
    if (
      !file.filePath?.startsWith(folder) ||
      file.size > 500 * 1024 * 1024 ||
      !["video/mp4", "video/webm"].includes(file.mime) ||
      url.protocol !== "https:" ||
      url.origin !== base.origin ||
      !url.pathname.startsWith(base.pathname.replace(/\/$/, "") + "/")
    )
      return ctx.badRequest("File does not meet project media restrictions");
    // Idempotent attachment; never trust a caller-supplied URL or MIME type.
    let asset = await strapi.db
      .query("plugin::upload.file")
      .findOne({ where: { provider: "imagekit", url: file.url } });
    if (!asset)
      asset = await strapi.db
        .query("plugin::upload.file")
        .create({
          data: {
            name: file.name,
            alternativeText: project.title,
            caption: "",
            hash: crypto.randomUUID().replaceAll("-", ""),
            ext: file.mime === "video/mp4" ? ".mp4" : ".webm",
            mime: file.mime,
            size: file.size / 1000,
            url: file.url,
            provider: "imagekit",
            provider_metadata: { fileId },
            folderPath: "/",
          },
        });
    await strapi
      .documents("api::project.project")
      .update({
        documentId,
        status: "draft",
        data: { projectVideo: asset.id },
      });
    ctx.body = { attached: true, documentId, draft: true };
  },
};
