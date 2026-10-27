module.exports = {
  routes: [
    {
      method: "POST",
      path: "/studio-media/attach",
      handler: "studio-media.attach",
      config: { auth: { scope: ["api::studio-media.studio-media.attach"] } },
    },
  ],
};
