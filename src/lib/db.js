// File: src/lib/db.js
const mongoose = require('mongoose');

const dbConnect = async () => {
  try {
    if (mongoose.connections[0].readyState) {
      console.log("Already connected to MongoDB");
      return;
    }

    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error("MONGODB_URI is not defined in the environment variables");
    }

    if (!mongoURI.startsWith("mongodb://") && !mongoURI.startsWith("mongodb+srv://")) {
      throw new Error("Invalid MongoDB connection string");
    }

    await mongoose.connect(mongoURI);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);  // Exit the process if we can't connect to the database
  }
};

module.exports = dbConnect;
