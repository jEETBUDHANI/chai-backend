import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import connectDB from "./db/index.js";
import userRoutes from "./routes/user.routes.js"; // Import user routes

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Set up routes
app.use("/api/v1/users", userRoutes);

// Connect to MongoDB and start the server
connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at port: ${process.env.PORT || 8000}`);
        });
    })
    .catch((err) => {
        console.log("MongoDB connection failed!", err);
    });
