import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Register from "./pages/auth/Register.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import Login from "./pages/auth/Login.jsx";
import Verify from "./pages/auth/Verify.jsx";
import DashBoard from "./pages/dashboard/DashBoard.jsx";
import TestContext from "./pages/TestContext.jsx";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white transition-colors duration-300">
      <BrowserRouter>
        <ToastContainer position="top-center" autoClose={3000} theme="colored" />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email/:token" element={<Verify />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/dashboard" element={<DashBoard />} />
          <Route path="/test-auth" element={<TestContext />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
