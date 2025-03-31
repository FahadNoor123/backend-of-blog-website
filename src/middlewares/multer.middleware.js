import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary"; // Correct import
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// multer.middleware.js
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Query-Documents_Education_Board_Website", // Specify the folder for avatars
    allowed_formats: ["jpg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const ecommerceStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Profile_Images_User_Education_Board_Website", // Specify the folder for ecommerce images
    allowed_formats: ["jpg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

// Create Multer instances with different storages
export const uploadQueryDocuments = multer({ storage: avatarStorage });
export const uploadProfileImage = multer({ storage: ecommerceStorage });

