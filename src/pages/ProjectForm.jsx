import axios from "axios";
import React, { useEffect, useState } from "react";
import useProjectStore from "../reducer/useProjectStore";
import useUserStore from "../reducer/useUserStore";
import { useNavigate } from "react-router-dom";

export default function ProjectForm() {
  const { setActiveProject } = useProjectStore();
  const { user, logout } = useUserStore();

  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("");
  const [numbers, setNumbers] = useState("");
  const [projects, setProjects] = useState([]);
  const [gap, setGap] = useState(2);
  const fetchProjects = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/projects/${user.id}`
      );
      setProjects(res.data.projects);
    } catch (error) {
      alert("Something went wrong!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      userId: user.id,
      projectName,
      gap,
      totalNumbers: numbers,
      currentState: 0,
    };

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/project`,
        payload
      );

      setActiveProject(res.data.project);
      alert("Project created successfully!");
      setProjectName("");
      setNumbers("");
      navigate("/demo");
    } catch (error) {
      console.error("Error:", error);
      alert("Error creating project.");
    }
  };

  const handleProjectClick = (item) => {
    setActiveProject(item);
    navigate("/demo");
  };

  useEffect(() => {
    if (user?.id) fetchProjects();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 relative">
      {/* USER INFO CARD */}
      {user && (
        <div className="max-w-xl mx-auto bg-white p-4 rounded-xl shadow mb-6 flex items-center gap-4">
          <img
            src={user.image1 || "https://via.placeholder.com/60"}
            alt="img1"
            className="w-16 h-16 rounded-full object-cover border-2 border-green-500"
          />
          <div className="text-center flex-1">
            <p className="text-xl font-bold text-green-700">{user.name}</p>
          </div>
          <img
            src={user.image2 || "https://via.placeholder.com/60"}
            alt="img2"
            className="w-16 h-16 rounded-full object-cover border-2 border-green-500"
          />
        </div>
      )}

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md space-y-5"
      >
        <h2 className="text-2xl font-bold text-green-700">
          Create New Project
        </h2>

        <div>
          <label
            htmlFor="projectName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Project Name
          </label>
          <input
            id="projectName"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter project name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="numbers"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Numbers (comma separated)
          </label>
          <textarea
            id="numbers"
            value={numbers}
            onChange={(e) => setNumbers(e.target.value)}
            placeholder="e.g. 2,3,5,6,1,1,33,0,3"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono resize-y"
            required
          />
        </div>

        <div>
          <label
            htmlFor="numbers"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Time Gap
          </label>
          <input
            type="number"
            value={gap}
            onChange={(e) => setGap(e.target.value)}
            placeholder="Enter time gap in seconds"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono resize-y"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition"
        >
          Submit
        </button>
      </form>

      {/* PROJECT LIST */}
      <div className="max-w-md mx-auto mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Other Projects
        </h3>

        {projects.length === 0 ? (
          <p className="text-gray-500">No projects yet.</p>
        ) : (
          <div className="space-y-3">
            {projects.map((item, i) => (
              <div
                key={i}
                className="bg-green-50 border border-green-200 rounded-lg p-4 cursor-pointer hover:bg-green-100 transition-shadow hover:shadow"
                onClick={() => handleProjectClick(item)}
              >
                <p className="text-green-700 font-medium">{item.projectName}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LOGOUT BUTTON */}
      <button
        onClick={() => {
          logout();
          navigate("/login");
        }}
        className="fixed bottom-6 right-6 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-full shadow-lg transition"
      >
        Logout
      </button>
    </div>
  );
}
