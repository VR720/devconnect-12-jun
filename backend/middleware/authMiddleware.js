// authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader);

  // Check if the token is present and starts with 'Bearer'
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log(authHeader);

    return res.status(401).json({ message: "Token not found or invalid" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Get user from DB
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json(error.message);
  }
};
