// In routes/testRoutes.js or directly in your main route file
import express from "express";
const router = express.Router();

router.get("/test", (req, res) => {
  try {
    res.json({ message: "Axios is connected to backend!" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

export default router;
