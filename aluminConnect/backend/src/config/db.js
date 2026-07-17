const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    console.error("DATABASE_URL is not set in environment");
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected:", mongoose.connection.name);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
