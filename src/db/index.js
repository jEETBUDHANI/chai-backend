import mongoose from "mongoose";
import { DB_NAME } from "../constants.js"; // Adjust the path if necessary


console.log("MONGODB_URL:", process.env.MONGODB_URL);  // Check if the URL is loaded

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`\n MongoDB connected! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection error", error);
        process.exit(1);
    }
}; 

export default connectDB;
