import { Router } from "express";


import { loginUser, logoutUser, registerUser, refreshAccessToken, googleLoginUser } from "../controllers/user.controller.js";
import {uploadProfileImage } from '../middlewares/multer.middleware.js';
import { verifyJWT,verifyUserProfile } from "../middlewares/auth.middlerware.js"; //for creating protected route
import {User} from "../models/user.model.js"; //getting Data from user model file
import bcrypt from "bcrypt"

const router = Router()

router.route('/register').post(  registerUser);



    router.route("/login").post(loginUser);// Inside adminMiddleware
    router.route("/google-login").post(googleLoginUser);
    
   
    

// secure Routes
router.route("/logout").post(logoutUser)

// Protected route for user profile
router.route("/profile").get(verifyUserProfile, (req, res) => {
    // Access the authenticated user using req.user
    console.log("Profile Route hitted")
    const user = req.user;
  
    // You can render a React component here, or send JSON data
    res.json({ message: 'Profile page', user });
  });


// PUT: Update user profile (Dynamic Fields)
router.route("/profile").put(verifyUserProfile, async (req, res) => {
  

  try {
      const userId = req.user._id; // Get user ID from middleware
      const updates = req.body; // Get all fields sent from frontend

      // Find user by ID and update with the new fields
      const updatedUser = await User.findByIdAndUpdate(
          userId,
          { $set: updates }, // Dynamically update fields
          { new: true, runValidators: true } // Return updated user & validate input
      );

      if (!updatedUser) {
          return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Internal server error" });
  }
});












  // , verifyUserProfile,

 


  router.post('/update-email', verifyUserProfile, async (req, res) => {
    const { email } = req.body;
    const userId = req.user._id; // Use _id to match your database schema
  
    if (!email) {
      return res.status(400).json({ message: 'New email is required' });
    }
  
    try {
      // Check if the email is already in use
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
  
      // Check if the new email is different from the current email
      const user = await User.findById(userId);
      if (user.email === email) {
        return res.status(400).json({ message: 'New email must be different from the current email' });
      }
  
      // Update the user's email
      await User.findByIdAndUpdate(userId, { email });
  
      res.json({ message: 'Email updated successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });


  router.post('/update-password', verifyJWT, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;
  
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
  
    try {
      // Retrieve the user's current password from the database
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Verify the current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
  
      // Check if the new password is different from the old password
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({ message: 'New password must be different from the current password' });
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the user's password
      await User.findByIdAndUpdate(userId, { password: hashedPassword });
  
      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });



//Notification Fetching 






  
router.route("/refresh-token").post(refreshAccessToken)

export default router