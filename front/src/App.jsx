// src/App.jsx (or any component)
// import { useEffect } from "react";
// import api from "./api/axios.js";

import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Register from "./pages/auth/Register.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import Login from "./pages/auth/Login.jsx";
import Verify from "./pages/auth/Verify.jsx";
import DashBoard from "./pages/dashboard/DashBoard.jsx";
import TestContext from "./pages/TestContext.jsx";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/register" element={<Register />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/verify-email/:token" element={<Verify />}></Route>
          <Route path="/forgot-password" element={<ForgotPassword />}></Route>
          <Route
            path="/reset-password/:token"
            element={<ResetPassword />}
          ></Route>
          <Route path="/dashboard" element={<DashBoard />}></Route>
          <Route path="/test-auth" element={<TestContext />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
