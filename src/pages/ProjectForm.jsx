import axios from "axios";
import React, { useEffect, useState } from "react";
import useProjectStore from "../reducer/useProjectStore";
import useUserStore from "../reducer/useUserStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ProjectSliderPanel from "../components/SideBar";

export default function ProjectForm() {
  const { setActiveProject } = useProjectStore();
  const { user, logout } = useUserStore();
  const [realImage, setRealImage] = useState(null);
  const [aiImage, setAiImage] = useState(null);
  const [selectedProjectNotes, setSelectedProjectNotes] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showSlider, setShowSlider] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  const openNotesModal = (project) => {
    setSelectedProjectNotes(project.pauseNotes || []);
  };

  const closeNotesModal = () => {
    setSelectedProjectNotes(null);
  };

  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("");
  const [numbers, setNumbers] = useState("");
  const [handledBy, setHandledBy] = useState("");
  const [projects, setProjects] = useState([]);
  const [gap, setGap] = useState(2);

  const fetchProjects = async (query = "", currentPage = 1) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/projects/${user.id}`,
        {
          params: {
            search: query,
            page: currentPage,
          },
        }
      );
      setProjects(res.data.projects);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      toast.error("Something went wrong!");
      console.log(error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/users`,
        { id: user.id }
      );
      console.log(res,"Users")
      setUsers(res.data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    }
  };

  function isValidNumberList(numbers) {
    const regex = /^\d+(,\d+)*$/;
    return regex.test(numbers);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!realImage || !aiImage) {
      toast.error("Please upload both images.");
      return;
    }

    if (!selectedUserId) {
      toast.error("Please select a user to assign.");
      return;
    }

    const formData = new FormData();
    formData.append("userId", selectedUserId);
    formData.append("adminId", user.id);
    formData.append("projectName", projectName);
    formData.append("gap", gap);

    if (isValidNumberList(numbers)) {
      formData.append("totalNumbers", numbers);
    } else {
      toast.error("Invalid number list format");
      return;
    }

    formData.append("currentState", 0);
    formData.append("handledBy", handledBy);
    formData.append("image1", realImage);
    formData.append("image2", aiImage);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/project`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if(res.data.success){
        console.log("first",res)
      }
      toast.success("Project created successfully!");
      setProjectName("");
      setNumbers("");
      setHandledBy("");
      setSelectedUserId("");
      setRealImage(null);
      setAiImage(null);
      setGap(2);
      
      // Refresh projects list
      fetchProjects(search, page);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "Error creating project.");
    }
  };

  const handleProjectClick = (item) => {
    setActiveProject(item);
    navigate("/demo");
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user?.id) {
      fetchProjects(search, page);
      if (user.role === "ADMIN") {
        fetchUsers();
      }
    }
  }, [user, search, page]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6">
      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-5"
      >
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
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
            type="text"
            id="projectName"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter project name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        {(
          <div>
            <label
              htmlFor="assignUser"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Assign to User
            </label>
            <select
              id="assignUser"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select a user</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label
            htmlFor="handledBy"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Handled By
          </label>
          <input
            type="text"
            id="handledBy"
            value={handledBy}
            onChange={(e) => setHandledBy(e.target.value)}
            placeholder="Enter handler name"
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
            htmlFor="gap"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Time Gap (seconds)
          </label>
          <input
            type="number"
            id="gap"
            value={gap}
            onChange={(e) => setGap(e.target.value)}
            placeholder="Enter time gap in seconds"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Real Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setRealImage(e.target.files[0])}
            className="block w-full text-sm text-gray-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload AI Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAiImage(e.target.files[0])}
            className="block w-full text-sm text-gray-600"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition"
        >
          Create Project
        </button>
      </form>

      {/* Notes Modal */}
      {selectedProjectNotes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-lg relative">
            <h3 className="text-xl font-bold mb-4">Pause Notes</h3>
            {selectedProjectNotes.length === 0 ? (
              <p className="text-gray-500">No pause notes available.</p>
            ) : (
              <ul className="space-y-3">
                {selectedProjectNotes.map((note, idx) => (
                  <li key={idx} className="border-b pb-2 last:border-none">
                    <p>
                      <strong>Paused At:</strong> {note.pausedAt}
                    </p>
                    <p>
                      <strong>Note:</strong> {note.note}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={closeNotesModal}
              className="mt-6 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Project Slider Panel */}
      <ProjectSliderPanel
        isOpen={showSlider}
        projects={projects}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onProjectClick={handleProjectClick}
        onViewNotes={openNotesModal}
        onClose={() => setShowSlider(false)}
      />

      {/* Floating Ball Icon Button */}
      <button
        onClick={() => setShowSlider(!showSlider)}
        className="fixed bottom-6 left-6 w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg hover:bg-green-700 transition-all duration-300 z-50"
        title="Toggle Project Panel"
      >
        🟢
      </button>

      {/* Admin Projects Button */}
      {user?.role === "ADMIN" && (
        <button
          onClick={() => navigate("/project-management")}
          className="fixed bottom-20 left-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-full shadow-lg transition"
        >
          Manage Projects
        </button>
      )}

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