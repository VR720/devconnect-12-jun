// # Reusable token generation functions

import jwt from "jsonwebtoken";

// Generate Access Token (Short-lived, for login sessions)
export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "3s", // you can change this as needed
  });
};

// Generate Refresh Token (Long-lived, for session renewal)
export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

// Generate Email Verification Token
export const generateEmailVerifyToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_VERIFY_SECRET, {
    expiresIn: "1d",
  });
};
