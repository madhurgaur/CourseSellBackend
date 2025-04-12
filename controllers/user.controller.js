import {User} from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";

export const register = async (req,res) => {
    try {
       
        const {name, email, password} = req.body; // Madhur214
        if(!name || !email || !password){
            return res.status(400).json({
                success:false,
                message:"All fields are required."
            })
        }
        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({
                success:false,
                message:"User already exist with this email."
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            name,
            email,
            password:hashedPassword
        });
        return res.status(201).json({
            success:true,
            message:"Account created successfully."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to register"
        })
    }
}
export const login = async (req,res) => {
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"All fields are required."
            })
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({
                success:false,
                message:"Incorrect email or password"
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            return res.status(400).json({
                success:false,
                message:"Incorrect email or password"
            });
        }
        generateToken(res, user, `Welcome back ${user.name}`);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to login"
        })
    }
}
export const logout = async (_,res) => {
    try {
        return res.status(200).cookie("token", "", {maxAge:0}).json({
            message:"Logged out successfully.",
            success:true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to logout"
        }) 
    }
}
export const getUserProfile = async (req, res) => {
    try {
      const userId = req.user?.id; // ✅ FIXED HERE
      const user = await User.findById(userId)
        .select("-password")
        .populate("enrolledCourses");
  
      if (!user) {
        return res.status(404).json({
          message: "Profile not found",
          success: false,
        });
      }
  
      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Failed to load user",
      });
    }
  };
  
export const updateProfile = async (req, res) => {
    try {
      const userId = req.user?.id;
      const { name } = req.body;
      const profilePhoto = req.file;
      console.log(userId);
  
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "Invalid user session",
        });
      }
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
  
      // Upload new profile photo if provided
      let photoUrl = user.photoUrl;
  
      if (profilePhoto) {
        // Delete the old one from Cloudinary
        if (user.photoUrl) {
          const publicId = user.photoUrl.split("/").pop().split(".")[0];
          await deleteMediaFromCloudinary(publicId);
        }
  
        // Upload new one
        const cloudResponse = await uploadMedia(profilePhoto.path); // or .path based on your multer setup
        if (!cloudResponse?.secure_url) {
          return res.status(500).json({
            success: false,
            message: "Failed to upload profile photo",
          });
        }
  
        photoUrl = cloudResponse.secure_url;
      }
  
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { name, photoUrl },
        { new: true }
      ).select("-password");
  
      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      });
  
    } catch (error) {
      console.error("Profile update error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Something went wrong while updating profile",
      });
    }
  };
  