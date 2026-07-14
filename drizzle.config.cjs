/** @type { import("drizzle-kit").Config } */
module.exports = {
  schema: "./electron/database/schema.cjs",
  out: "./electron/database/migrations",
  dialect: "sqlite"
};
