import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SIgnUp";
import ProjectForm from "./pages/ProjectForm";
import Timer from "./pages/Timer";
import NumberSlider from "./pages/Demo";
import "./index.css"; // or './main.css'
import LandingPage from "./pages/Landing";
import { Toaster } from "react-hot-toast";



const linkStyle = {
  marginRight: 15,
  padding: "8px 16px",
  textDecoration: "none",
  borderRadius: 6,
  fontWeight: "bold",
  color: "#555",
  backgroundColor: "#f0f0f0",
  transition: "background-color 0.3s, color 0.3s",
};

const activeLinkStyle = {
  color: "#fff",
  backgroundColor: "#2563eb", // blue-600
};

export default function App() {
  return (
    <div
      className=""
      style={{
        fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        borderRadius: 12,
        backgroundColor: "#fff",
      }}
    >
      <Routes>
        <Route
          path="/"
          element={
            <>
              <LandingPage />
            </>
          }
        />

        <Route
          path="/login"
          element={
            <>
              <nav
                className="mt-10"
                style={{ marginBottom: 30, textAlign: "center" }}
              >
                <NavLink
                  to="/login"
                  style={({ isActive }) =>
                    isActive ? { ...linkStyle, ...activeLinkStyle } : linkStyle
                  }
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  style={({ isActive }) =>
                    isActive ? { ...linkStyle, ...activeLinkStyle } : linkStyle
                  }
                >
                  Sign Up
                </NavLink>
              </nav>

              <Login />
            </>
          }
        />
        <Route
          path="/signup"
          element={
            <>
              <nav
                className="mt-10"
                style={{ marginBottom: 30, textAlign: "center" }}
              >
                <NavLink
                  to="/login"
                  style={({ isActive }) =>
                    isActive ? { ...linkStyle, ...activeLinkStyle } : linkStyle
                  }
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  style={({ isActive }) =>
                    isActive ? { ...linkStyle, ...activeLinkStyle } : linkStyle
                  }
                >
                  Sign Up
                </NavLink>
              </nav>

              <SignUp />
            </>
          }
        />

        <Route path="/project" element={<ProjectForm />} />
        <Route path="/timer" element={<Timer />} />
        <Route path="/demo" element={<NumberSlider />} />

        <Route path="*" element={<Login />} />
      </Routes>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "green",
          },
        }}
      />
    </div>
  );
}
