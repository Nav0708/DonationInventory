const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error! Couldn't connect to MongoDB:", error.message);
    process.exit(1); // exit process if DB connection fails
  }
};

module.exports = connectDB;
