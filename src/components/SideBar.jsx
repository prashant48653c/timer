// components/ProjectSliderPanel.js
import React from "react";

export default function ProjectSliderPanel({
  isOpen,
  projects,
  page,
  totalPages,
  onPageChange,
  onProjectClick,
  onViewNotes,
  onClose,
}) {

  return (
    <div
      className={`fixed top-0 left-0 h-full w-72 bg-white shadow-lg border-r border-gray-200 transition-transform duration-300 z-50 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="p-4 flex justify-between items-center border-b">
        <h2 className="text-lg font-bold text-green-700">Projects</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-xl font-bold">
          &times;
        </button>
      </div>
      <div className="p-4 overflow-y-auto flex flex-col max-h-[90vh] space-y-3">
        {projects.length === 0 ? (
          <p className="text-gray-500">No projects yet.</p>
        ) : (
          projects.map((item, i) => (
            <div
              key={i}
              className="bg-green-50 border border-green-200 rounded-lg p-3"
            >
              <p className="text-green-800 font-semibold mb-2">{item.projectName}</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => onViewNotes(item)}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded"
                >
                  View
                </button>
                <button
                  onClick={() => onProjectClick(item)}
                  className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded"
                >
                  Start
                </button>
              </div>
            </div>
          ))
        )}

 <div className="flex justify-center items-center mt-4 space-x-2">
  <button
    disabled={page === 1}
    onClick={() => onPageChange(page - 1)}
    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
  >
    Previous
  </button>
  <span className="text-gray-700">
    Page {page} of {totalPages}
  </span>
  <button
    disabled={page === totalPages}
    onClick={() => onPageChange(page + 1)}
    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
  >
    Next
  </button>
</div>
      </div>
     

    </div>
  );
}
