import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Jwt from "jsonwebtoken";
import { v2 as cloudinary } from 'cloudinary';
import mongoose from "mongoose";




import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);



// Generate access and refresh tokens
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        console.log("This is Access Token while login:", accessToken);

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Refresh and Access Token");
    }
};

// User registration
const registerUser = asyncHandler(async (req, res) => {
    try {
        console.log("Request Body:", req.body); // Debugging log

        const { email, password } = req.body;
        
console.log("Email",req.body.email)
        if (!email) {
            throw new ApiError(400, "Email is required");
        }
        if (!password.trim()) {
            throw new ApiError(400, "Password is required");
        }

      

        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            throw new ApiError(409, 'Email already exists');
        }

        
        const newUser = await User.create({
           
            email,
            password,
            
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                _id: newUser._id,
                email: newUser.email,
               
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(error.statusCode || 500).json({
            message: error.message || "Registration failed. Please try again later.",
        });
    }
});



// User login
const loginUser = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email) {
            throw new ApiError(400, "Email is required");
        }

        const user = await User.findOne({ email });
        if (!user) {
            throw new ApiError(400, "User does not exist");
        }

        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            throw new ApiError(401, "Password is invalid");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        console.log("Generated Access Token:", accessToken);

        const options = {
            httpOnly: false,
            secure: false,  // ✅ Must be `true` if using on local development
            // secure: true, // ✅ Must be `true` if using on productop
         
        };

        res.cookie('myAccessToken', accessToken, options);
        res.cookie('myRefreshToken', refreshToken, options);

        console.log("Cookies are being set!");

        const isAdmin = loggedInUser.admin === "true";
        console.log("This is Functionality of User", isAdmin);

        res.status(200).json({
            user: loggedInUser,
            accessToken,
            refreshToken,
            isAdmin,
            message: "User Logged In Successfully",
        });
    } catch (error) {
        console.error("Error in loginUser:", error);
        res.status(error.status || 500).json({
            error: {
                status: error.status || 500,
                message: error.message,
            },
        });
    }
});


// 🔹 Google Login
export const googleLoginUser = asyncHandler(async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            throw new ApiError(400, "Google token is required");
        }
      
        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        console.log("🔹 Google Payload:", payload);
        const { email, name, picture, profileImage, branch, sub: googleId } = ticket.getPayload();

        // Check if user exists
        let user = await User.findOne({ email });

          // if you want register manully user

        // if (!user) {
        //     throw new ApiError(400, "Please register first is required");
        // }
        
       if (!user) {
      



    user = await User.create({
        name,
        username: email.split("@")[0], // Generate a username from email
        email,
        password: "GoogleUser", // Placeholder (not used for login)
        googleId,
        avatar: picture || "default-avatar.png", // Default avatar if none
        profileImage: picture || "default-avatar.png", // Ensure profileImage is set
        branch // Assign null if branch is not valid


    });
}
        // Generate JWT tokens
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        // Send tokens in cookies
        res.cookie("myAccessToken", accessToken, { httpOnly: false, secure: false });
        res.cookie("myRefreshToken", refreshToken, { httpOnly: false, secure: false });

        res.status(200).json({
            user,
            accessToken,
            refreshToken,
            message: "User Logged In Successfully with Google",
            
        });

    } catch (error) {
        console.error("Error in Google login:", error);
        res.status(error.status || 500).json({ error: { status: error.status || 500, message: error.message } });
    }
});















// User logout
const logoutUser = (req, res) => {
    res.clearCookie("myAccessToken", {
        httpOnly: true,
        secure: true,  // ✅ Must match the original cookie settings
        sameSite: "None",
    });

    res.clearCookie("myRefreshToken", {
        httpOnly: false,
        secure: false,
        
    });

    res.status(200).json({ message: "Logged out successfully" });
};



// Refresh access token
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.myRefreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = Jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id);
        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        const options = {
            httpOnly: false,
            secure: false,
        };

        res.status(200)
            .cookie("myAccessToken", accessToken, options)
            .cookie("myRefreshToken", refreshToken, options);

        console.log("Cookies are being set!");
        res.status(200).json({
            accessToken,
            refreshToken,
            message: "Tokens refreshed successfully",
        });
    } catch (error) {
        console.error("Error in refreshAccessToken:", error);
        res.status(error.status || 500).json(new ApiResponse(error.status || 500, null, error.message));
    }
});

// Change current password
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confPassword } = req.body;

    if (newPassword !== confPassword) {
        throw new ApiError(400, "New password and confirm password do not match");
    }

    const user = await User.findById(req.user._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

// Get current user
const getCurrentUser = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, req.user, "Current user fetched"));
});

// Update account details
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { username, email } = req.body;

    if (!username || !email) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { username, email } },
        { new: true }
    ).select("-password");

    res.status(200).json(new ApiResponse(200, user, "Account details updated successfully"));
});

// Update user avatar
const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar file");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { avatar: avatar.url } },
        { new: true }
    ).select("-password");

    res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"));
});

// Upload user documents
// Upload user documents
// Upload user documents
const uploadUserDocuments = asyncHandler(async (req, res) => {
    try {
        // Ensure req.files exists and contains the document files
        if (!req.files || (!req.files['doc1'] && !req.files['doc2'])) {
            throw new ApiError(400, "No documents provided");
        }

        // Collect documents from the request
        const docs1 = req.files['doc1'] || [];
        const docs2 = req.files['doc2'] || [];

        // Prepare documents for storage in the user's document array
        const documents = [...docs1, ...docs2].map(file => ({
            fileName: file.originalname,
            fileData: file.buffer,  // Store the file data as a buffer
        }));

        // Update the user's profile with the new documents
        const user = await User.findById(req.user._id);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Add the new documents to the existing array of documents
        user.documents = [...(user.documents || []), ...documents];
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            message: 'Documents uploaded and saved successfully!',
            documents: user.documents
        });
    } catch (error) {
        console.error('Error uploading documents:', error);
        res.status(error.statusCode || 500).json({
            message: error.message || 'Failed to upload documents. Please try again.',
        });
    }
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    uploadUserDocuments, // Export the new function
    
};
