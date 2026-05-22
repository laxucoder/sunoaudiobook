const { Sequelize } = require("sequelize");

// Initialize Sequelize with NeonDB URL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false, // Set to console.log to see raw SQL queries
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Required for NeonDB
    },
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL (NeonDB) Connected via Sequelize");
    // In production, use 'migrations' instead of sync({ alter: true })
    await sequelize.sync({ alter: true });
    console.log("DATABASED CONNECTED");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
