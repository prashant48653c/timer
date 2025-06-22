import React from "react";
import { NavLink } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-400 to-blue-600 px-6 text-white">
      <h1 className="text-5xl font-extrabold mb-4">Welcome to NumberSlider</h1>
      <p className="max-w-xl text-center mb-8 text-lg sm:text-xl opacity-90">
        Experience a dynamic countdown and slider animation tool designed for your needs. 
        Customize your numbers, control the timer, and stay on track with ease.
      </p>

      <button
       
        className="px-8 py-3 bg-white text-green-700 font-semibold rounded-lg shadow-lg hover:bg-green-100 transition"
      >
         <NavLink
          to="/signup"
          
        >
         Get Started
        </NavLink>
      </button>

      <footer className="mt-16 text-sm opacity-70">
        &copy; {new Date().getFullYear()} NumberSlider. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
