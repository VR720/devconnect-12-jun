import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verify = async (req, res, next) => {
  const authHeader = req.headers.authorizaton;

  if (!authHeader || !authHeader.startswith("Bearer ")) {
    return res.status(404).json({ message: "token not found" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decode = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decode.id).select("-password");
    if (!user) return res.status(404).json({ message: "user not found" });

    req.user = user;
    next();
  } catch (error) {
    res.status(404).json({ message: "not Authorized or invalid token" });
  }
};
