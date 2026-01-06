import axios from "axios";
import React, { useEffect, useState } from "react";
import useUserStore from "../reducer/useUserStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../components/SideBar";
 
export default function UserList() {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async (query = "", currentPage = 1) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/users`,
        {
          id: user.id,
          search: query,
          page: currentPage,
        }
      );

      setUsers(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "ADMIN") {
      toast.error("Admin access required");
      navigate("/project");
      return;
    }

    fetchUsers(search, page);
  }, [user, search, page, navigate]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      <Sidebar />

      <div className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
              <button
                onClick={() => navigate("/project")}
                className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg transition"
              >
                ← Back to Create Project
              </button>
            </div>

            {/* Search Bar */}
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search users by name or email..."
              className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <p className="text-gray-500 text-lg">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <p className="text-gray-500 text-lg">No users found.</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-indigo-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                          Projects Assigned
                        </th>
                       
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-indigo-50 transition">
                          <td className="px-6 py-5">
                            <div className="text-sm font-medium text-gray-900">
                              {u.name}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm text-gray-600">{u.email}</div>
                          </td>
                          <td className="px-6 py-5">
                            <span
                              className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                                u.role === "ADMIN"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className="text-sm text-gray-700">
                              {u.projects.length || 0}
                            </span>
                          </td>
                         
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
                  <div className="flex justify-center items-center space-x-6">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="px-5 py-2.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Previous
                    </button>
                    <span className="text-gray-700 font-medium">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                      className="px-5 py-2.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}