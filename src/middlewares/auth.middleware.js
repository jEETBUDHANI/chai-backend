import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/Apierrors.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const user = asyncHandler(async (req, _3, next) => {
    const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken.id);

        if (!user) {
            throw new ApiError(401, "User not found");
        }

        req.user = user;  // Store the user in the request for downstream use
        next();           // Call the next middleware
    } catch (error) {
        throw new ApiError(401, "Invalid or expired token");
    }
});
