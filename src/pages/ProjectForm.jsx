import axios from "axios";
import React, { useEffect, useState } from "react";
import useProjectStore from "../reducer/useProjectStore";
import useUserStore from "../reducer/useUserStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../components/SideBar";
import { Upload, Users, Clock, Hash, User, FileText, X, Image as ImageIcon } from "lucide-react";

export default function ProjectForm() {
  const { setActiveProject } = useProjectStore();
  const { user } = useUserStore();
  const navigate = useNavigate();

  const [realImage, setRealImage] = useState(null);
  const [aiImage, setAiImage] = useState(null);
  const [previewReal, setPreviewReal] = useState(null);
  const [previewAi, setPreviewAi] = useState(null);

  const [selectedProjectNotes, setSelectedProjectNotes] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  const [projectName, setProjectName] = useState("");
  const [numbers, setNumbers] = useState("");
  const [handledBy, setHandledBy] = useState("");
  const [gap, setGap] = useState(2);
  const [loading, setLoading] = useState(false);

  // Fetch users for admin
  const fetchUsers = async () => {
    if (user?.role !== "ADMIN") return;
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/users`, {
        id: user.id,
      });
      setUsers(res.data.data || []);
    } catch (error) {
      toast.error("Failed to load users");
    }
  };

  // Image preview handlers
  const handleRealImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRealImage(file);
      setPreviewReal(URL.createObjectURL(file));
    }
  };

  const handleAiImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAiImage(file);
      setPreviewAi(URL.createObjectURL(file));
    }
  };

  // Validation
  function isValidNumberList(nums) {
    return /^\d+(,\d+)*$/.test(nums.trim());
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!realImage || !aiImage) {
      toast.error("Please upload both Real and AI images");
      setLoading(false);
      return;
    }

    if (user?.role === "ADMIN" && !selectedUserId) {
      toast.error("Please assign the project to a user");
      setLoading(false);
      return;
    }

    if (!isValidNumberList(numbers)) {
      toast.error("Invalid numbers format. Use comma-separated digits only.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("userId", selectedUserId || user.id);
    formData.append("adminId", user.id);
    formData.append("projectName", projectName.trim());
    formData.append("totalNumbers", numbers.trim());
    formData.append("handledBy", handledBy.trim());
    formData.append("gap", gap);
    formData.append("currentState", 0);
    formData.append("image1", realImage);
    formData.append("image2", aiImage);

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/project`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Project created successfully!");
      
      // Reset form
      setProjectName("");
      setNumbers("");
      setHandledBy("");
      setSelectedUserId("");
      setRealImage(null);
      setAiImage(null);
      setPreviewReal(null);
      setPreviewAi(null);
      setGap(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  // Notes Modal Functions
  const openNotesModal = (notes) => setSelectedProjectNotes(notes || []);
  const closeNotesModal = () => setSelectedProjectNotes(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role === "ADMIN") {
      fetchUsers();
    }
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
            <p className="text-gray-600 mt-1">Set up a new verification project with real and AI-generated images</p>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-8 py-8">
          <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column - Project Details */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Project Information Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-white flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Project Information
                    </h2>
                  </div>
                  <div className="p-6 space-y-5">
                    {/* Project Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Name
                      </label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="Enter project name"
                        required
                      />
                    </div>

                    {/* Assign User - Admin Only */}
                    {user?.role === "ADMIN" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <Users className="w-4 h-4 mr-1.5" />
                          Assign to User
                        </label>
                        <select
                          value={selectedUserId}
                          onChange={(e) => setSelectedUserId(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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

                    {/* Handled By */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <User className="w-4 h-4 mr-1.5" />
                        Handled By
                      </label>
                      <input
                        type="text"
                        value={handledBy}
                        onChange={(e) => setHandledBy(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="Enter handler name"
                        required
                      />
                    </div>

                    {/* Numbers */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Hash className="w-4 h-4 mr-1.5" />
                        Numbers (comma-separated)
                      </label>
                      <textarea
                        value={numbers}
                        onChange={(e) => setNumbers(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none transition"
                        placeholder="Example: 2, 15, 8, 21, 0, 33, 7"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1.5">Only digits and commas allowed</p>
                    </div>

                    {/* Time Gap */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Clock className="w-4 h-4 mr-1.5" />
                        Time Gap Between Images (seconds)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={gap}
                        onChange={(e) => setGap(Number(e.target.value))}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Image Uploads Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-white flex items-center">
                      <ImageIcon className="w-5 h-5 mr-2" />
                      Image Uploads
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Real Image */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Real Image
                        </label>
                        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition group">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleRealImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            required
                          />
                          {previewReal ? (
                            <div className="relative">
                              <img
                                src={previewReal}
                                alt="Real preview"
                                className="w-full h-64 object-cover rounded-lg"
                              />
                              <div className="absolute inset-0   group-hover:bg-opacity-10 transition rounded-lg flex items-center justify-center">
                                <Upload className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition" />
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                                <Upload className="w-8 h-8 text-green-600" />
                              </div>
                              <p className="text-sm font-medium text-gray-700">Upload Real Image</p>
                              <p className="text-xs text-gray-500 mt-1">Click or drag to upload</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* AI Image */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          AI-Generated Image
                        </label>
                        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-purple-400 transition group">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAiImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            required
                          />
                          {previewAi ? (
                            <div className="relative">
                              <img
                                src={previewAi}
                                alt="AI preview"
                                className="w-full h-64 object-cover rounded-lg"
                              />
                              <div className="absolute inset-0   bg-opacity-0 group-hover:bg-opacity-10 transition rounded-lg flex items-center justify-center">
                                <Upload className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition" />
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                                <Upload className="w-8 h-8 text-purple-600" />
                              </div>
                              <p className="text-sm font-medium text-gray-700">Upload AI Image</p>
                              <p className="text-xs text-gray-500 mt-1">Click or drag to upload</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Submit Section */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-28">
                  <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-white">Ready to Submit?</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center text-gray-600">
                        <div className={`w-2 h-2 rounded-full mr-2 ${projectName ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        Project name {projectName ? '✓' : ''}
                      </div>
                      {user?.role === "ADMIN" && (
                        <div className="flex items-center text-gray-600">
                          <div className={`w-2 h-2 rounded-full mr-2 ${selectedUserId ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          User assigned {selectedUserId ? '✓' : ''}
                        </div>
                      )}
                      <div className="flex items-center text-gray-600">
                        <div className={`w-2 h-2 rounded-full mr-2 ${handledBy ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        Handler name {handledBy ? '✓' : ''}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <div className={`w-2 h-2 rounded-full mr-2 ${numbers ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        Numbers provided {numbers ? '✓' : ''}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <div className={`w-2 h-2 rounded-full mr-2 ${realImage ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        Real image {realImage ? '✓' : ''}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <div className={`w-2 h-2 rounded-full mr-2 ${aiImage ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        AI image {aiImage ? '✓' : ''}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md transform hover:scale-105 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating...
                          </>
                        ) : (
                          'Create Project'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Notes Modal */}
      {selectedProjectNotes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Pause Notes</h3>
              <button
                onClick={closeNotesModal}
                className="text-white hover:text-gray-300 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {selectedProjectNotes.length === 0 ? (
                <p className="text-gray-500 text-center py-8 italic">No pause notes recorded.</p>
              ) : (
                <div className="space-y-4">
                  {selectedProjectNotes.map((note, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 mb-2">
                        <strong>Paused at:</strong> {note.pausedAt}
                      </p>
                      <p className="text-gray-800">{note.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={closeNotesModal}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-2.5 rounded-lg transition"
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