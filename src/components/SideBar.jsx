import React from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../reducer/useUserStore";
import toast from "react-hot-toast";

const Sidebar = () => {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const menuItems = [
    {
      label: "Create Project",
      icon: "➕",
      path: "/project", // your create project page
      visible: true,
    },
    {
      label: "View Projects",
      icon: "📋",
      path: "/project-management", // admin projects page
      visible: user?.role === "ADMIN",
    },
    {
      label: "View Users",
      icon: "👥",
      path: "/users", // you can create this page later
      visible: user?.role === "ADMIN",
    },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-green-700 to-green-900 text-white shadow-2xl z-40 flex flex-col">
      {/* Logo / Title */}
      <div className="p-6 border-b border-green-600">
        <h1 className="text-2xl font-bold tracking-wide">AI Verify</h1>
        <p className="text-green-200 text-sm mt-1">
          {user?.name} ({user?.role})
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map(
          (item) =>
            item.visible && (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center space-x-4 px-5 py-3 rounded-lg hover:bg-green-600 transition-all duration-200 text-left font-medium"
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            )
        )}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-green-600">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-4 px-5 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-all duration-200 font-medium"
        >
          <span className="text-xl">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;