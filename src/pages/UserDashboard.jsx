import axios from "axios";
import React, { useEffect, useState } from "react";
import useUserStore from "../reducer/useUserStore";
import useProjectStore from "../reducer/useProjectStore"; // Adjust path if needed
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function UserProjects() {
  const { user, logout } = useUserStore();
  const { setActiveProject } = useProjectStore(); // Get setter from Zustand store
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchProjects = async (query = "", currentPage = 1) => {
    setLoading(true);
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
      setTotal(res.data.pagination.total);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch projects");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ASSIGNED":
        return "bg-blue-100 text-blue-800";
      case "UNDERREVIEW":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "ASSIGNED":
        return "Assigned";
      case "UNDERREVIEW":
        return "Under Review";
      case "APPROVED":
        return "Approved";
      case "REJECTED":
        return "Rejected";
      default:
        return status;
    }
  };

  const openDetailsModal = (project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setSelectedProject(null);
    setShowDetailsModal(false);
  };

  // Updated: Save project to store and navigate to /demo
  const handleGoToProject = (project) => {
    setActiveProject(project); // Save full project object to persistent store
    navigate("/demo");         // Go to the demo/work page
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchProjects(search, page);
  }, [user, search, page, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Projects</h1>
              <p className="text-gray-600 mt-1">
                Total: {total} project{total !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
            >
              ← Back
            </button>
          </div>
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search projects by name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Projects List */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-500 mt-4">No projects found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Project Image */}
                  <div className="relative h-48 bg-gradient-to-br from-indigo-100 to-purple-100">
                    <img
                      src={project.image1 || "/placeholder.jpg"}
                      alt={project.projectName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {getStatusText(project.status)}
                      </span>
                    </div>
                  </div>
                  {/* Project Info */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">
                      {project.projectName}
                    </h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium mr-2">Handler:</span>
                        <span>{project.handledBy}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium mr-2">Progress:</span>
                        <span>
                          {project.currentState} /{" "}
                          {project.totalNumbers.split(",").length}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium mr-2">Time Gap:</span>
                        <span>{project.gap}s</span>
                      </div>
                      {project.pauseNotes?.length > 0 && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-medium mr-2">Pause Notes:</span>
                          <span>{project.pauseNotes.length}</span>
                        </div>
                      )}
                    </div>
                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openDetailsModal(project)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition font-medium text-sm"
                      >
                        👁️ Details
                      </button>
                      <button
                        onClick={() => handleGoToProject(project)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition font-medium text-sm"
                      >
                        Go to Project →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-2xl shadow-lg p-4 mt-6">
                <div className="flex justify-center items-center space-x-4">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 transition font-medium"
                  >
                    ← Previous
                  </button>
                  <span className="text-gray-700 font-medium">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 transition font-medium"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b p-6 z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedProject.projectName}
                </h2>
                <button
                  onClick={closeDetailsModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                    selectedProject.status
                  )}`}
                >
                  {getStatusText(selectedProject.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Project ID
                  </label>
                  <p className="text-gray-900 font-semibold">#{selectedProject.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Handled By
                  </label>
                  <p className="text-gray-900">{selectedProject.handledBy}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Time Gap
                  </label>
                  <p className="text-gray-900">{selectedProject.gap} seconds</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Current State
                  </label>
                  <p className="text-gray-900">
                    {selectedProject.currentState} /{" "}
                    {selectedProject.totalNumbers.split(",").length}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Passed Time
                  </label>
                  <p className="text-gray-900">{selectedProject.passedTime || "N/A"}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Total Numbers
                </label>
                <p className="text-gray-900 font-mono bg-gray-50 p-3 rounded-lg border">
                  {selectedProject.totalNumbers}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Real Image
                  </label>
                  <img
                    src={selectedProject.image1}
                    alt="Real"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    AI Image
                  </label>
                  <img
                    src={selectedProject.image2}
                    alt="AI"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              </div>

              {selectedProject.resultProof && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Result Proof
                  </label>
                  <img
                    src={selectedProject.resultProof}
                    alt="Result"
                    className="w-full max-h-64 object-contain rounded-lg border"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Pause Notes ({selectedProject.pauseNotes?.length || 0})
                </label>
                {selectedProject.pauseNotes?.length === 0 ? (
                  <p className="text-gray-400 italic bg-gray-50 p-4 rounded-lg">
                    No pause notes available
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedProject.pauseNotes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-blue-50 p-4 rounded-lg border border-blue-200"
                      >
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Paused At:</strong> {note.pausedAt}
                        </p>
                        <p className="text-gray-900">{note.note}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t p-6">
              <div className="flex gap-3">
                <button
                  onClick={closeDetailsModal}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    closeDetailsModal();
                    handleGoToProject(selectedProject);
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Go to Project →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Button */}
      <button
        onClick={() => {
          logout();
          navigate("/login");
        }}
        className="fixed bottom-6 right-6 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg transition"
      >
        Logout
      </button>
    </div>
  );
}