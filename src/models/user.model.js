import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Define the user schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    fullname: {
        type: String,
        required: false, // Change this to false to make it optional
    },
    username: {
        type: String,
        required: false, // Change this to false to make it optional
    },
    avatar: {
        type: String,
        required: false, // Change this to false to make it optional
    }
},{ timestamps: true });

//     coverImage: {
//         type: String,
//     },
//     watchHistory: [
//         {
//             type: Schema.Types.ObjectId,
//             ref: "Video"
//         }
//     ],
//     password: {
//         type: String,
//         required: [true, 'Password is required']
//     },
//     refreshToken: {
//         type: String
//     }
// }, 

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10); // await the hash
    next();
});

// Method to compare passwords
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Method to generate access token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullname
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    });
};

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET, // Fix typo: REFERSH should be REFRESH
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY // Fix typo: REFERESH should be REFRESH
        }
    );
};

// Export the User model as default
const User = mongoose.model("User", userSchema);
export default User;
