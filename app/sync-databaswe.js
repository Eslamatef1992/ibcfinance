require("dotenv").config();
const db = require("./models");

async function syncDatabase() {
  try {
    console.log("Starting database synchronization...");

    // Force: true will drop tables and recreate them
    // Use with caution in production!
    await db.sequelize.sync({ force: true });

    console.log("All database tables have been successfully created!");
    process.exit(0);
  } catch (error) {
    console.error("Failed to sync database:", error);
    process.exit(1);
  }
}

syncDatabase();
