import userModel from "../models/userModel.js";
import { comparePassword, hashPassword } from "./../helpers/authHelper.js";
import JWT from "jsonwebtoken";
import orderModel from "../models/orderModel.js";

export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer, role } = req.body;

    // Validation is now handled by express-validator middleware
    // Manual validation removed (lines 10-27)

    // Check if user already exists
    const existingUser = await userModel.findOne({
      email: email.toLowerCase().trim()
    });

    if (existingUser) {
      return res.status(409).send({
        success: false,
        message: "Email already registered. Please login or use a different email.",
        field: "email"
      });
    }

    // Check if username already exists
    const existingName = await userModel.findOne({
      name: name.trim()  // Case-sensitive, only trim whitespace
    });

    if (existingName) {
      return res.status(409).send({
        success: false,
        message: "Username is already taken. Please choose another.",
        field: "name"
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create and save user with sanitized data
    const user = await new userModel({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone.trim(),
      address: address.trim(),
      answer: answer.trim(),
      role: role !== undefined ? role : 0,
    }).save();

    // Return success with user data (excluding password)
    res.status(201).send({
      success: true,
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in registration. Please try again.",
      error: error.message,
    });
  }
};
// const registerController = () => {};
// export default {registerController};

//POST LOGIN
// LOGIN USER
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Email and password are required",
      });
    }

    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is not registered",
      });
    }

    // Check password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(401).send({
        success: false,
        message: "Invalid password",
      });
    }

    // Check if JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in the .env file");
    }

    // Generate JWT token
    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).send({
      success: true,
      message: "Login successful",
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error: error.message,
    });
  }
};

//forgotPasswordController

export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    if (!email) {
      res.status(400).send({ message: "Emai is required" });
    }
    if (!answer) {
      res.status(400).send({ message: "answer is required" });
    }
    if (!newPassword) {
      res.status(400).send({ message: "New Password is required" });
    }
    //check
    const user = await userModel.findOne({ email, answer });
    //validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Wrong Email Or Answer",
      });
    }
    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

//test controller
export const testController = (req, res) => {
  //console.log("protected Route");
  res.send("protected route");
};

//update controller
export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;
    const user = await userModel.findById(req.user._id);

    // Validate password length
    if (password && password.length < 6) {
      return res.json({
        error: "Password is required and must be at least 6 characters long",
      });
    }

    // Hash password if provided
    const hashedPassword = password ? await hashPassword(password) : undefined;

    // Update user
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Profile Updated Successfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error while updating profile",
      error,
    });
  }
};

//orders
export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting Orders",
      error,
    });
  }
};

//orders
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Geting Orders",
      error,
    });
  }
};

//order status controller

export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Updateing Order",
      error,
    });
  }
};

//get all users controller
export const getAllUsersController = async (req, res) => {
  try {
    const users = await userModel
      .find({})
      .select("-password") // Exclude password field for security
      .sort({ createdAt: -1 });
    
    res.status(200).send({
      success: true,
      message: "All users fetched successfully",
      totalCount: users.length,
      users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting users",
      error: error.message,
    });
  }
};

// Check if email exists
export const checkEmailController = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Email is required"
      });
    }

    const existingUser = await userModel.findOne({ 
      email: email.toLowerCase().trim() 
    });
    
    res.status(200).send({
      success: true,
      exists: !!existingUser,
      message: existingUser ? "Email already exists" : "Email is available"
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error checking email",
      error: error.message
    });
  }
};

// Check if username exists
export const checkUsernameController = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Username is required"
      });
    }

    const existingUser = await userModel.findOne({
      name: name.trim()  // Case-sensitive, only trim whitespace
    });

    res.status(200).send({
      success: true,
      exists: !!existingUser,
      message: existingUser ? "Username already exists" : "Username is available"
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error checking username",
      error: error.message
    });
  }
};

//update user controller (admin only)
export const updateUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, role } = req.body;
    
    console.log('🔄 Updating user:', id, 'with data:', { name, email, phone, address, role });
    
    // Validation
    if (!name || !email || !phone) {
      return res.status(400).send({
        success: false,
        message: "Name, email, and phone are required"
      });
    }
    
    // Check if user exists
    const existingUser = await userModel.findById(id);
    if (!existingUser) {
      return res.status(404).send({
        success: false,
        message: "User not found"
      });
    }
    
    // Check if email is already taken by another user
    const emailExists = await userModel.findOne({ email, _id: { $ne: id } });
    if (emailExists) {
      return res.status(400).send({
        success: false,
        message: "Email is already taken by another user"
      });
    }
    
    // Update user
    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      { name, email, phone, address, role },
      { new: true }
    ).select("-password");
    
    console.log('✅ User updated successfully:', updatedUser.name);
    
    res.status(200).send({
      success: true,
      message: "User updated successfully",
      user: updatedUser
    });
    
  } catch (error) {
    console.error('💥 Error updating user:', error);
    res.status(500).send({
      success: false,
      message: "Error updating user",
      error: error.message
    });
  }
};

//delete user controller (admin only)
export const deleteUserController = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Attempting to delete user:', id);
    
    // Check if user exists
    const existingUser = await userModel.findById(id);
    if (!existingUser) {
      return res.status(404).send({
        success: false,
        message: "User not found"
      });
    }
    
    // Prevent admin from deleting themselves
    if (req.user._id === id) {
      return res.status(400).send({
        success: false,
        message: "You cannot delete your own account"
      });
    }
    
    // Delete user
    await userModel.findByIdAndDelete(id);
    
    console.log('✅ User deleted successfully:', existingUser.name);
    
    res.status(200).send({
      success: true,
      message: "User deleted successfully"
    });
    
  } catch (error) {
    console.error('💥 Error deleting user:', error);
    res.status(500).send({
      success: false,
      message: "Error deleting user",
      error: error.message
    });
  }
};

// Create user by admin
export const createUserController = async (req, res) => {
  try {
    const { name, email, password, phone, address, role } = req.body;

    // Validation
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Name is required",
      });
    }
    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Email is required",
      });
    }
    if (!password) {
      return res.status(400).send({
        success: false,
        message: "Password is required",
      });
    }
    if (!phone) {
      return res.status(400).send({
        success: false,
        message: "Phone is required",
      });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).send({
        success: false,
        message: "User with this email already exists",
        field: "email"
      });
    }

    // Check if username already exists
    const existingName = await userModel.findOne({
      name: name.trim()  // Case-sensitive, only trim whitespace
    });

    if (existingName) {
      return res.status(409).send({
        success: false,
        message: "Username is already taken. Please choose another.",
        field: "name"
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const user = await new userModel({
      name,
      email,
      password: hashedPassword,
      phone,
      address: address || "",
      answer: "admin-created", // Auto-generated default
      role: role !== undefined ? role : 0, // Default to User (0)
    }).save();

    console.log('✅ User created successfully by admin:', user.name);

    res.status(201).send({
      success: true,
      message: "User created successfully by admin",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("💥 Error creating user:", error);
    res.status(500).send({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};
