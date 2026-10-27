module.exports = ({ env }) => ({
  connection: {
    client: "postgres",
    connection: {
      connectionString: env("CMS_DATABASE_URL"),
      ssl: { rejectUnauthorized: true },
    },
    pool: { min: 0, max: 5 },
    acquireConnectionTimeout: 60000,
  },
});
