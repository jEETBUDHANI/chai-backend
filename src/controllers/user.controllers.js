import User from '../models/user.model.js';
import cloudinary from 'cloudinary';
import fs from 'fs';
import asyncHandler from 'express-async-handler'; // Make sure asyncHandler is imported
import ApiError from '../utils/Apierrors.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { upload } from '../middlewares/multer.middleware.js';
import { subscribe } from 'diagnostics_channel';
import { resolveSoa } from 'dns';

 // Ensure ApiError is defined or imported

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dslucyfvn',
    api_key: '621618253994512',
    api_secret: 'N0SpSxAIcCK_XWWwo_0bCNUsQJo'
});

export const registerUser = async (req, res) => {
    try {
        const { email, password, fullname, username } = req.body;
        let avatarUrl = '';

        if (!email || !password || !username) {
            console.log("Validation failed: Missing required fields");
            return res.status(400).json({ message: "Email, password, and username are required" });
        }

        const existingUserByEmail = await User.findOne({ email });
        const existingUserByUsername = await User.findOne({ username });

        if (existingUserByEmail) {
            console.log("Registration failed: Email already in use");
            return res.status(400).json({ message: "Email already in use" });
        }
        if (existingUserByUsername) {
            console.log("Registration failed: Username already in use");
            return res.status(400).json({ message: "Username already in use" });
        }

        if (req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path);
            avatarUrl = result.secure_url;
            fs.unlinkSync(req.file.path);
        }

        const user = new User({
            email,
            password,
            fullname: fullname || '',
            username,
            avatar: avatarUrl
        });

        await user.save();
        console.log("Registration successful:", user);
        return res.status(201).json({ message: "Registration successful" });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: "Registration failed" });
    }
};

// Helper function to generate access and refresh tokens
const generateAcessAndRefreshTokens = async (user) => {
    try {
        const accessToken = user.generateAcessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error generating access and refresh tokens");
    }
};

// Login user function


export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            throw new ApiError(401, "User not found");
        }

        // Compare provided password with hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new ApiError(401, "Invalid password");
        }

        // Generate JWT token if password matches
        const token = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });

        // Set token in cookie or send it in the response
        res.cookie("accessToken", token, { httpOnly: true, secure: true });
        res.status(200).json({ success: true, message: "Login successful", token });
    } catch (error) {
        next(error);
    }
};


export const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    // Clear the refresh and access tokens from cookies
    res.clearCookie("refreshToken", options);
    res.clearCookie("accessToken", options);

    return res.status(200).json({
        message: "Logout successful",
    });
});


export const changeCurrentPassword =asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body
    const user =await User.findById(req.user?.id)
    const isPasswordCorrect =await user.
    isPasswordcorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid Old Password")
    }
    user.password=new Passwordawait.save({validateBeforeSave:false})
    return res
    .status(200)
    .json({message:"Password changed successfully"})
})


    export const getCurrentUser =asyncHandler(async(req,res)=>{
        return res.status(200)
        .json(200,req.user,"current")
    
})

export const updateAccountDetails =asyncHandler(async(req,res)=>{
    const {fullName,email} =req.body
    if(!fullName || !email){
        throw new ApiError(400,"All fields are required")
    }
   const user= User.findByIdAndUpdate(
    req.user?._id,
    {
        $set:{
            fullName:fullName,
            email:email
        }

    },
    {new:true}
   ).select("-password")
   return res.status(200)
   .json({message:"Account details updated successfully"})
   
})
const updateUserAvatar = asyncHandler(async(req,res)=>{


    const avatarLocalPath =req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"Please upload an avatar")
    }
    const avatar=await uploadonCloudinary
    const user=await User.findByIdAndUpdate(req.user?._id,{avatar:avatar},{new:true}).
    select("-password")
    return res.status(200)
    .json({message:"Avatar updated successfully"})
        })


export const getUserChannelProfile =asyncHandler(async(req,res)=>{
    const {user} =req.params


    if((!username ?.trim())){
        throw new ApiError(400,"Username is required")
    }
      const Channel =await User.aggregate([
        {
            $match:{
                username:user

            }
        },
        {
            $lookup:{
                from :"subscriptions",
                localField :"_id",
                foreignField :"channel",
                as :"subscribers"
            }
        },
        {
            $lookup:{
                from :"subscriptions",
                localField :"_id",
                foreignField :"subscriber",
                as :"subscriberTo"
            }
        },
        {
            $addFields:{
                subscriberCount:{
                    $size:"$subscribers"
                },
                channelSubscribeTOCount:{
                    $size:"$subscribedTo"
                },
                isSubsrcribed :{
                    $cond :{
                        if:{
                            $in:[req.user?._id,"$subscribers.subscriber"],
                            then:true,
                            else:false
                        }
                    }
                }
            }
        },
        {
            $project:{
                fullName:1,
                userName:1,
                subscribersCount:1,
                channelSubscribeTOCount1,
                isSubsrcribed:1,
                avatar:1,
                emial:1
            }
        }
      ])

      if(!Channel ?.length){
        throw new ApiError(404,"channle pdes not ecist" )
      }
      return res .status(200)

      .json(
        new ApiResponse(200,channel[0],"User channel,fetched Succedssfully")

      )

})

export const getWatchHistory =asyncHandler(async(req,res)=>{
    
    const user =await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"Video",
                localFiled:"watchHistory",
                foreignField:_id,
                as:'watchHistory',
                pipeline:[{
                    $lookup:{
                        from:"users",
                        localField:"owner",
                        foreignField:"_id",
                        as:"owner",
                        pipeline:{
                            $project:{
                                fullName:1,
                                userName:1,
                                avatar:1,
                            }
                        },

                    }
                },
                {
                    $addFields:{
                        owner:{
                            $first:"$owner"
                        }
                    }
                }
                ]
            }
        }
    ])
    return res
    .status(200)
    .json( new ApiResponse(
        200,user[0].getWatchHistory ,"watchHistory Fetched successfully"
    ))
})
