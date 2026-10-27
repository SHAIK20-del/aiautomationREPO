module.exports = ({ env }) => ({
  "users-permissions": {
    config: { jwtSecret: env("JWT_SECRET"), register: { allowedFields: [] } },
  },
  upload: { config: { sizeLimit: 100 * 1024 * 1024 } },
  imagekit: {
    enabled: true,
    config: {
      publicKey: env("IMAGEKIT_PUBLIC_KEY"),
      privateKey: env("IMAGEKIT_PRIVATE_KEY"),
      urlEndpoint: env("IMAGEKIT_URL_ENDPOINT"),
      enabled: true,
      useTransformUrls: true,
      useSignedUrls: false,
      uploadEnabled: true,
      uploadOptions: {
        folder: "/studio/",
        tags: ["studio"],
        overwriteTags: false,
        checks: '"file.size" <= "100MB"',
        isPrivateFile: false,
      },
    },
  },
});
