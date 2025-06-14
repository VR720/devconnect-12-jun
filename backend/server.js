import express from "express";
import mongoose from "mongoose";
// import cors from "cors";
import dotenv from "dotenv";
// import authRoutes from "./routes/auth.js";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import testRoutes from "./routes/testRoutes.js";
import cors from "cors";

// load env variables
dotenv.config();

// craete app
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend port
    credentials: true,
    exposedHeaders: ["Authorization"],
  })
);

// middleware
// app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api", testRoutes);

// test route
// app.get("/api/test", (req, res) => {
//   res.json({ message: "API IS WORKING" });
// });

// connect to mongodb

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,

    console.log("mongodb connected");
  } catch (error) {
    console.error("mongodb conection failed", error.message);
    process.exit(1);
  }
};

// start server

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
