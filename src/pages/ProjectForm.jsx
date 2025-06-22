import axios from "axios";
import React, { useEffect, useState } from "react";
import useProjectStore from "../reducer/useProjectStore";
import useUserStore from "../reducer/useUserStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function ProjectForm() {
  const { setActiveProject } = useProjectStore();
  const { user, logout } = useUserStore();
  const [realImage, setRealImage] = useState(null);
  const [aiImage, setAiImage] = useState(null);
 const [selectedProjectNotes, setSelectedProjectNotes] = useState(null);
const [search, setSearch] = useState("");
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);

  const openNotesModal = (project) => {
    setSelectedProjectNotes(project.pauseNotes || []);
  };

  const closeNotesModal = () => {
    setSelectedProjectNotes(null);
  };
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("");
  const [numbers, setNumbers] = useState("");
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


function isValidNumberList(numbers) {
  // Check if it matches the pattern: one or more digits, separated by single commas, no trailing comma
  const regex = /^\d+(,\d+)*$/;
  return regex.test(numbers);
}
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!realImage || !aiImage) {
      toast.error("Please upload both images.");
      return;
    }

    const formData = new FormData();
    formData.append("userId", user.id);
    formData.append("projectName", projectName);
    formData.append("gap", gap);
   if (isValidNumberList(numbers)) {
  formData.append("totalNumbers", numbers);
} else {
  toast.error("Invalid number list format");
  // Show user error or handle accordingly
}
    formData.append("currentState", 0);
    formData.append("image1", realImage); // Real Image
    formData.append("image2", aiImage); // AI Image

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

      setActiveProject(res.data.project);
      toast.success("Project created successfully!");
      setProjectName("");
      setNumbers("");
      setRealImage(null);
      setAiImage(null);
      navigate("/demo");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error creating project.");
    }
  };

  const handleProjectClick = (item) => {
    setActiveProject(item);
    navigate("/demo");
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
    if (user?.id) fetchProjects(search,page);
  }, [user,search,page]);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 relative">
    

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
          Submit
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
                      <strong>Paused At:</strong>{" "}
                      {note.pausedAt}
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


      {/* PROJECT LIST */}
     <div className="max-w-md mx-auto mt-6">
  <h3 className="text-lg font-semibold text-gray-800 mb-4">Other Projects</h3>

  <input
    type="text"
    value={search}
    onChange={(e) => {
  setSearch(e.target.value);
  setPage(1);
}}

    placeholder="Search by project name..."
    className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
  />

  {projects.length === 0 ? (
    <p className="text-gray-500">No projects yet.</p>
  ) : (
    <div className="space-y-3">
      {projects.map((item, i) => (
        <div
          key={i}
          className="bg-green-50 border border-green-200 rounded-lg p-4 flex justify-between items-center cursor-pointer hover:bg-green-100 transition-shadow hover:shadow"
        >
          <p className="text-green-700 font-medium">{item.projectName}</p>

          <div className="space-x-2">
            <button
              onClick={() => openNotesModal(item)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
            >
              View
            </button>
            <button
              onClick={() => handleProjectClick(item)}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
            >
              Start
            </button>
          </div>
        </div>

      ))}
      <div className="flex justify-center items-center mt-4 space-x-2">
  <button
    disabled={page === 1}
    onClick={() => setPage(page - 1)}
    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
  >
    Previous
  </button>
  <span className="text-gray-700">
    Page {page} of {totalPages}
  </span>
  <button
    disabled={page === totalPages}
    onClick={() => setPage(page + 1)}
    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
  >
    Next
  </button>
</div>

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
