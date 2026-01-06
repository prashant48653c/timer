import axios from "axios";
import React, { useEffect, useState } from "react";
import useUserStore from "../reducer/useUserStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../components/SideBar";

export default function AdminProjects() {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchProjects = async (query = "", currentPage = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/admin/projects`,
        {
          params: {
            adminId: user.id,
            search: query,
            page: currentPage,
          },
        }
      );
      setProjects(res.data.projects);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch projects");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/change-status`,
        {
          projectId,
          userId: user.id,
          status: newStatus,
        }
      );
      toast.success("Status updated successfully!");
      fetchProjects(search, page);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
      console.error(error);
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

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    // if (user.role !== "ADMIN") {
      // toast.error("Admin access required");
     // navigate("/");
    //   return;
    // }
    fetchProjects(search, page);
  }, [user, search, page]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">

<Sidebar/>
      <div className="flex-1 ml-64 p-6">
      
      <div className="max-w-[90rem] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              Project Management
            </h1>
            <button
              onClick={() => navigate("/project")}
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
            placeholder="Search by project name or handler..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Projects Table */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-500">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-500">No projects found.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned To
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Handler
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {projects.map((project) => (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {project.projectName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {project.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {project.user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {project.user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {project.handledBy}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={project.status}
                            onChange={(e) =>
                              handleStatusChange(project.id, e.target.value)
                            }
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              project.status
                            )} border-0 cursor-pointer`}
                          >
                            <option value="ASSIGNED">Assigned</option>
                            <option value="UNDERREVIEW">Under Review</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => openDetailsModal(project)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                            title="View Details"
                          >
                            👁️ View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="bg-white rounded-2xl shadow-lg p-4 mt-6">
              <div className="flex justify-center items-center space-x-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <span className="text-gray-700 font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
</div>
      {/* Details Modal */}
      {showDetailsModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  Project Details
                </h2>
                <button
                  onClick={closeDetailsModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Project Name
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {selectedProject.projectName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Status
                  </label>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                      selectedProject.status
                    )}`}
                  >
                    {selectedProject.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Assigned To
                  </label>
                  <p className="text-gray-900">
                    {selectedProject.user.name} ({selectedProject.user.email})
                  </p>
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
                    Passed Time
                  </label>
                  <p className="text-gray-900">{selectedProject.passedTime} seconds</p>
                </div>
              </div>

              {/* Numbers */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Total Numbers
                </label>
                <p className="text-gray-900 font-mono bg-gray-50 p-3 rounded-lg">
                  {selectedProject.totalNumbers}
                </p>
              </div>

              {/* Images */}
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

              {/* Result Proof */}
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

              {/* Pause Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Pause Notes
                </label>
                {selectedProject.pauseNotes.length === 0 ? (
                  <p className="text-gray-400 italic">No pause notes</p>
                ) : (
                  <div className="space-y-2">
                    {selectedProject.pauseNotes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-gray-50 p-3 rounded-lg border"
                      >
                        <p className="text-sm text-gray-600 mb-1">
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
              <button
                onClick={closeDetailsModal}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}