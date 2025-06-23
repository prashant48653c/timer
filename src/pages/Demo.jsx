import React, { act, useEffect, useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import useProjectStore from "../reducer/useProjectStore";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useUserStore from "../reducer/useUserStore";

const NumberSlider = () => {
  const { activeProject, setActiveProject } = useProjectStore();
  console.log(activeProject);
  const num = activeProject?.totalNumbers?.split(",") || [];
  const intervalSec = parseInt(activeProject?.gap || "2");
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [pauseNote, setPauseNote] = useState("");
  const [timeElapsed, setTimeElapsed] = useState(
    parseInt(activeProject?.passedTime) || 0
  );
  const [showSettings, setShowSettings] = useState(false);
  const [editName, setEditName] = useState(activeProject?.projectName || "");
  const [editGap, setEditGap] = useState(activeProject?.gap || 2);
  const [editHandledBy, setEditHandledBy] = useState(
    activeProject?.handledBy || ""
  );

  const [currentIndex, setCurrentIndex] = useState(
    parseInt(activeProject?.currentState || 0)
  );
  const [timeLeft, setTimeLeft] = useState(
    (num.length - currentIndex) * intervalSec
  );
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [paused, setPaused] = useState(false);
  const [currentState, setCurrentState] = useState(
    activeProject?.currentState || 0
  );

  const handleNoteSubmit = async () => {
    const updatedIndex = currentIndex;
    const now = new Date();
    const pauseAt = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    console.log(timeElapsed);
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/project/${activeProject.id}`,
        {
          currentState: updatedIndex,
          pauseAt,
          passedTime: timeElapsed.toString(),
          note: pauseNote,
        }
      );

      toast.success("Note saved!");
    } catch (error) {
      console.error("Failed to update project with note:", error);
      toast.error("Failed to save note.");
    }

    setNoteModalVisible(false);
    setPauseNote("");
  };

  const goBack = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setRenderArray(getRenderArray(prevIndex));
      speakNumber(num[prevIndex]);
      setTimeLeft((num.length - prevIndex) * intervalSec);
    }
  };

  const goForward = () => {
    if (currentIndex < num.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setRenderArray(getRenderArray(nextIndex));
      speakNumber(num[nextIndex]);
      setTimeLeft((num.length - nextIndex) * intervalSec);
    }
  };
  const handleNumberClick = async (index, item) => {
    speakNumber(item);
    setCurrentIndex(index);
    setCurrentState(index); // if currentState represents the same thing

    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/project/${activeProject.id}`,
        {
          currentState: index,
        }
      );

      // Optionally update global state
      setActiveProject(res.data.project);
    } catch (error) {
      console.error("Failed to update currentState:", error);
    }
  };

  const handleComplete = async () => {
    const updatedIndex = currentIndex;
    const now = new Date();
    const pauseAt = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    console.log(timeElapsed);
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/project/${activeProject.id}`,
        {
          currentState: 0,
          pauseAt,
          passedTime: timeElapsed.toString(),
          note: "Task was completed!",
        }
      );
      console.log(res.data);
      toast.success("Task was completed!");
    } catch (error) {
      console.error("Failed to update project with note:", error);
      toast.error("Failed to save note.");
    }
  };

  useEffect(() => {
    if (timeLeft <= 0) {
      handleComplete();
    }
  }, [timeLeft]);

  const speakNumber = (n) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(n);
    utterance.lang = "en";
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  const getRenderArray = (index) => {
    const result = [];
    for (let i = -2; i <= 2; i++) {
      const n = num[index + i];
      result.push(n || "");
    }
    return result;
  };

  const [renderArray, setRenderArray] = useState(getRenderArray(currentIndex));

  // Speak initially
  useEffect(() => {
    if (renderArray[2]) {
      speakNumber(renderArray[2]);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user]);
  useEffect(() => {
    if (activeProject) {
      setEditName(activeProject.projectName);
      setEditGap(activeProject.gap);
      setEditHandledBy(activeProject.handledBy || "");
    }
  }, [activeProject]);

  useEffect(() => {
    if (paused) return;

    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          return 0;
        }
        return prev - 1;
      });

      setTimeElapsed((prev) => prev + 1); // Increment elapsed time
    }, 1000);

    const sliderInterval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = prev + 1;

        if (nextIndex >= num.length) {
          clearInterval(sliderInterval);

          // 🎯 Animation ended, reset state to 0 and patch
          setCurrentState(0);

          return prev;
        }

        setRenderArray(getRenderArray(nextIndex));
        speakNumber(num[nextIndex]);
        return nextIndex;
      });
    }, intervalSec * 1000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(sliderInterval);
    };
  }, [paused]);

  const togglePause = async () => {
    const newPaused = !paused;

    if (newPaused) {
      toast.error("Paused");
      setPaused(true);
      setNoteModalVisible(true); // open modal for note
    } else {
      setPaused(false);
      toast.success("Resumed");
    }
  };

  return (
    <div
      onClick={togglePause}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 cursor-pointer py-28 relative overflow-hidden"
    >
      {activeProject?.image1 && (
        <img
          src={activeProject.image1}
          alt="Real Image"
          className="absolute top-4 left-4 w-20 h-20 rounded-full border-4 border-green-400 shadow-lg object-cover z-50"
        />
      )}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowSettings(true);
          }}
          className="bg-white border rounded-full p-2 shadow hover:bg-gray-100"
          title="Edit Project"
        >
          ⚙️
        </button>
      </div>

      {activeProject?.image2 && (
        <img
          src={activeProject.image2}
          alt="AI Image"
          className="absolute top-4 right-4 w-20 h-20 rounded-full border-4 border-blue-400 shadow-lg object-cover z-50"
        />
      )}

      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500 rounded-full blur-3xl"></div>
      </div>

      {/* Sliding Boxes */}
      <div className="relative flex justify-center items-end gap-3 sm:gap-6 mb-12 z-10">
        {renderArray.map((item, index) => {
          const base =
            "flex items-center justify-center font-bold rounded-2xl transition-all duration-500 ease-out shadow-2xl border backdrop-blur-sm";

          const sizeClasses =
            index === 2
              ? "w-36 h-36 sm:w-80 sm:h-80 text-5xl sm:text-9xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white border-emerald-300/50 z-20 shadow-emerald-500/50 animate-pulse"
              : "w-14 h-14 sm:w-24 sm:h-24 text-xl sm:text-3xl bg-gradient-to-br from-emerald-500/80 to-teal-600/80 text-white/90 border-emerald-400/30";

          const positionClasses =
            index === 0 || index === 4
              ? "translate-y-8 opacity-40 scale-75"
              : index === 1 || index === 3
              ? "translate-y-4 opacity-70 scale-90"
              : "scale-110";

          return (
            <div
              key={index}
              className={`${base} ${sizeClasses} ${positionClasses}`}
              style={{
                boxShadow:
                  index === 2
                    ? "0 25px 50px -12px rgba(16, 185, 129, 0.5), 0 0 0 1px rgba(16, 185, 129, 0.1)"
                    : "0 10px 25px -3px rgba(16, 185, 129, 0.2)",
              }}
            >
              {item}
            </div>
          );
        })}
      </div>

      {/* Time Display */}
      <div className="mb-8 z-10">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-4 shadow-xl">
          <div className="text-2xl sm:text-3xl font-bold text-center">
            {timeLeft > 0 ? (
              <div className="text-yellow-300 flex flex-col sm:flex-row items-center justify-center gap-2">
                <span>
                  ⏳ {Math.floor(timeLeft / 60)}:
                  {(timeLeft % 60).toString().padStart(2, "0")} left
                </span>
                <span className="text-green-300">
                  ⬆️ {Math.floor(timeElapsed / 60)}:
                  {(timeElapsed % 60).toString().padStart(2, "0")} passed
                </span>
              </div>
            ) : (
              <span className="text-green-300 animate-bounce">
                ✨ Completed at{" "}
                <span className="text-green-300">
                  {Math.floor(timeElapsed / 60)}:
                  {(timeElapsed % 60).toString().padStart(2, "0")} ✨
                </span>
              </span>
            )}
          </div>

          <div className="text-purple-200 text-center text-sm mt-1">
            {timeLeft > 0 ? "Time Remaining" : "Task Finished"}
          </div>
          <div className="flex justify-center gap-4 mt-4 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                goBack();
              }}
              disabled={currentIndex === 0}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded disabled:opacity-50"
            >
              ⬅️ Back
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                goForward();
              }}
              disabled={currentIndex === num.length - 1}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded disabled:opacity-50"
            >
              Forward ➡️
            </button>
          </div>
          <p className="text-white text-sm mt-4 text-center">
            Step {currentIndex + 1} of {num.length}
          </p>
        </div>
      </div>

      {noteModalVisible && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={(e) => e.stopPropagation()} // Prevent bubbling up when clicking outside modal content
        >
          <div
            className="bg-white text-black rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()} // Prevent bubbling up when clicking inside modal box
          >
            <h2 className="text-xl font-bold">Pause Note</h2>
            <textarea
              rows="4"
              className="w-full p-3 border rounded-md focus:outline-none"
              placeholder="Why are you pausing?"
              value={pauseNote}
              onChange={(e) => setPauseNote(e.target.value)}
              onClick={(e) => e.stopPropagation()} // Prevent bubbling when clicking inside textarea
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPaused(false);
                  setNoteModalVisible(false);
                  setPauseNote("");
                }}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNoteSubmit();
                }}
                className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div   onClick={(e) => e.stopPropagation()} className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow p-6 w-full max-w-md relative">
            <h2 className="text-lg font-bold mb-4">Edit Project</h2>

            <label className="block mb-2">
              <span className="text-sm text-gray-600">Project Name</span>
              <input
                type="text"
                value={editName}
                onChange={(e) => {
                  e.stopPropagation();
                  setEditName(e.target.value);
                }}
                className="w-full mt-1 border rounded px-3 py-2"
              />
            </label>

            <label className="block mb-2">
              <span className="text-sm text-gray-600">Time Gap (seconds)</span>
              <input
                type="number"
                min={1}
                value={editGap}
                onChange={(e) => {
                  e.stopPropagation();
                  setEditGap(Number(e.target.value));
                }}
                className="w-full mt-1 border rounded px-3 py-2"
              />
            </label>

            <label className="block mb-4">
              <span className="text-sm text-gray-600">Handled By</span>
              <input
                type="text"
                value={editHandledBy}
                onChange={(e) => {
                  e.stopPropagation();
                  setEditHandledBy(e.target.value);
                }}
                className="w-full mt-1 border rounded px-3 py-2"
              />
            </label>

            <div className="flex justify-end gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettings(false);
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const res = await axios.patch(
                      `${import.meta.env.VITE_BACKEND_URL}/project/${
                        activeProject.id
                      }`,
                      {
                        projectName: editName,
                        gap: editGap.toString(),
                        handledBy: editHandledBy,
                        passedTime: timeElapsed.toString(),
                        currentState: currentIndex,
                      }
                    );
                    console.log(res.data);
                    setActiveProject(res.data.project);
                    setShowSettings(false);
                    toast.success("Project updated successfully!");
                  } catch (err) {
                    console.error("Update failed:", err);
                    toast.error("Failed to update project.");
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Number Preview Grid */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl max-w-4xl z-10">
        <h3 className="text-white text-lg font-semibold mb-4 text-center">
          Number Sequence
        </h3>

        <div className="overflow-x-auto overflow-y-hidden max-w-[80vw] scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
          <div className="flex flex-nowrap gap-2 min-h-[5rem] pr-4">
            {num.map((item, i) => (
              <div
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNumberClick(i, item);
                }}
                className={`cursor-pointer min-w-[3rem] h-10 sm:w-12 sm:h-12 font-bold flex items-center justify-center rounded-xl transition-all duration-300 text-sm sm:text-base ${
                  i === currentIndex
                    ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/50 scale-110 border-2 border-emerald-300"
                    : i < currentIndex
                    ? "bg-gradient-to-br from-gray-400 to-gray-600 text-white opacity-60"
                    : "bg-gradient-to-br from-purple-500/50 to-blue-500/50 text-white/80 border border-purple-400/30"
                }`}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumberSlider;
