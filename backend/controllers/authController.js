//  # All auth-related logic (register, login, etc.)

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import User from "../models/User.js";
import {
  sendVerificationEmail,
  sendResetPasswordEmail,
} from "../utils/sendEmail.js";
import {
  generateAccessToken,
  generateRefreshToken,
  generateEmailVerifyToken,
} from "../utils/genrateTokens.js";

const CLIENT_URL = process.env.CLIENT_URL;

// @route   POST /api/auth/register
// @desc    Register a new user

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashed });

    const verifyToken = generateEmailVerifyToken(newUser._id);
    await sendVerificationEmail(email, verifyToken);

    res
      .status(201)
      .json({ message: "Registered. Check your email to verify." });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get current user mgcyfdsew
// @route   GET /api/auth/verify-email/:token
// @desc    Verify user email

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_VERIFY_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

// @route   POST /api/auth/login
// @desc    Log in user and issue tokens

// export const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "Invalid credentials" });

//     if (!user.isVerified) {
//       return res
//         .status(401)
//         .json({ message: "Please verify your email first" });
//     }

//     const match = bcrypt.compare(password, user.password);
//     if (!match) return res.status(400).json({ message: "Invalid credentials" });

//     const accessToken = generateAccessToken(user._id);
//     const refreshToken = generateRefreshToken(user._id);

//     res
//       .cookie("refreshToken", refreshToken, {
//         httpOnly: true,
//         secure: true,
//         sameSite: "Strict",
//         maxAge: 7 * 24 * 60 * 60 * 1000,
//       })
//       .json({ accessToken });
//   } catch (err) {
//     // res.status(500).json({ message: "Login failed" });
//     res.status(500).json({ message: err.message });
//   }
// };

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res
        .status(401)
        .json({ message: "Please verify your email first" });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // ✅ Set refresh token as secure cookie
    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true, // or conditionally set for production
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
        accessToken,
      });
  } catch (err) {
    console.error("Login error:", err.message || err);
    res.status(500).json({ message: "Server error during login" });
  }
};

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "No user with that email" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hash = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hash;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    const resetURL = `${CLIENT_URL}/reset-password/${resetToken}`;
    await sendResetPasswordEmail(email, resetURL);

    res.json({ message: "Reset link sent to email" });
  } catch (err) {
    // res.status(500).json({ message: "Error sending reset link" });
    res.status(500).json({ message: err.message });
  }
};

// @route   POST /api/auth/reset-password/:token
// @desc    Reset user password
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const hash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hash,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   GET /api/auth/refresh-token
// @desc    Refresh and return a new access token
export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const accessToken = generateAccessToken(decoded.id);
    res.json({ accessToken });
  } catch (err) {
    // res.status(403).json({ message: "Invalid token" });
    res.status(403).json({ message: err.message });
  }
};

// @route   POST /api/auth/logout
// @desc    Clear refresh token cookie
// export const logoutUser = (req, res) => {
//   res.clearCookie("refreshToken", {
//     httpOnly: true,
//     secure: true,
//     sameSite: "Strict",
//   });
//   // res.json({ message: "Logged out successfully" });
//   res.status(403).json({ message: err.message });
// };

export const logoutUser = (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true, // set false for localhost only during dev
      sameSite: "Strict",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err.message || err);
    return res.status(500).json({ message: "Logout failed" });
  }
};

// @route   GET /api/auth/me
// @desc    Get current authenticated user
// export const getCurrentUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("-password");
//     res.json(user);
//   } catch (err) {
//     // res.status(500).json({ message: "Failed to fetch user" });
//     res.status(500).json({ message: err.message });
//     console.log(err.message);
//   }
// };

// @desc    Get current authenticated user
export const getCurrentUser = async (req, res) => {
  try {
    // Since req.user already contains id, name, email (from middleware), no need to query DB again
    res.status(200).json({ user: req.user });
  } catch (err) {
    console.error("getCurrentUser error:", err.message);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};
