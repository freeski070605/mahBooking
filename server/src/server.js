const app = require("./app");
const { connectDb } = require("./config/db");
const { env } = require("./config/env");

async function start() {
  await connectDb();

  app.listen(env.port, () => {
    console.log(`MAH Booking API listening on port ${env.port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
