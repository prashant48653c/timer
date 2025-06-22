import React, { useEffect, useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import useProjectStore from "../reducer/useProjectStore";
import axios from "axios";

const NumberSlider = () => {
  const { activeProject } = useProjectStore();

  const num = activeProject?.totalNumbers?.split(",") || [];
  const intervalSec = parseInt(activeProject?.gap || "2");
  const [currentIndex, setCurrentIndex] = useState(
    parseInt(activeProject?.currentState || 0)
  );
 const [timeLeft, setTimeLeft] = useState(
  (num.length - currentIndex) * intervalSec
);
  const [paused, setPaused] = useState(false);
const [currentState, setCurrentState] = useState(activeProject?.currentState || 0);

const updateProjectState = async (index) => {
  try {
    const response = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/project/${activeProject.id}`, {
      currentState: index,
    });
    console.log("Project updated:", response.data);
    toast.success("Project updated successfully!");
  } catch (error) {
    console.error("Failed to update project:", error);
  }
};



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
  if (paused) return;

  const timerInterval = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(timerInterval);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  const sliderInterval = setInterval(() => {
    setCurrentIndex((prev) => {
      const nextIndex = prev + 1;

      if (nextIndex >= num.length) {
        clearInterval(sliderInterval);
        
        // 🎯 Animation ended, reset state to 0 and patch
        setCurrentState(0);
        updateProjectState(0); // <-- reset currentState in DB
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
  setPaused(newPaused);
  toast.success(newPaused ? "Paused" : "Resumed");

  if (newPaused) {
    const updatedIndex = currentIndex;
    setCurrentState(updatedIndex);
    await updateProjectState(updatedIndex); // pass updated index
  }
};

  return (
  <div
 onClick={togglePause}
 className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 cursor-pointer py-28 relative overflow-hidden"
>
 {/* Background decorative elements */}
 <div className="absolute inset-0 opacity-10">
   <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
   <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
   <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500 rounded-full blur-3xl"></div>
 </div>

 {/* Sliding Boxes */}
 <div className="relative flex justify-center items-end gap-3 sm:gap-6 mb-12 z-10">
   {renderArray.map((item, index) => {
     const base = "flex items-center justify-center font-bold rounded-2xl transition-all duration-500 ease-out shadow-2xl border backdrop-blur-sm";
     
     const sizeClasses = index === 2
       ? "w-36 h-36 sm:w-80 sm:h-80 text-5xl sm:text-9xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white border-emerald-300/50 z-20 shadow-emerald-500/50 animate-pulse"
       : "w-14 h-14 sm:w-24 sm:h-24 text-xl sm:text-3xl bg-gradient-to-br from-emerald-500/80 to-teal-600/80 text-white/90 border-emerald-400/30";

     const positionClasses = index === 0 || index === 4
       ? "translate-y-8 opacity-40 scale-75"
       : index === 1 || index === 3
       ? "translate-y-4 opacity-70 scale-90"
       : "scale-110";

     return (
       <div
         key={index}
         className={`${base} ${sizeClasses} ${positionClasses}`}
         style={{
           boxShadow: index === 2 
             ? '0 25px 50px -12px rgba(16, 185, 129, 0.5), 0 0 0 1px rgba(16, 185, 129, 0.1)' 
             : '0 10px 25px -3px rgba(16, 185, 129, 0.2)'
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
         <span className="text-yellow-300">
           ⏳ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
         </span>
       ) : (
         <span className="text-green-300 animate-bounce">
           ✨ Complete! ✨
         </span>
       )}
     </div>
     <div className="text-purple-200 text-center text-sm mt-1">
       {timeLeft > 0 ? "Time Remaining" : "Task Finished"}
     </div>
   </div>
 </div>

 {/* Number Preview Grid */}
 <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl max-w-4xl z-10">
   <h3 className="text-white text-lg font-semibold mb-4 text-center">Number Sequence</h3>
   <div className="flex flex-wrap justify-around gap-2 min-h-[20rem] overflow-y-auto overflow-x-hidden max-w-[20rem] scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
     {num.map((item, i) => (
       <div
         key={i}
         className={`w-10 h-10 sm:w-12 sm:h-12 font-bold flex items-center justify-center rounded-xl transition-all duration-300 text-sm sm:text-base ${
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

 <Toaster 
   position="top-center"
   toastOptions={{
     style: {
       background: 'rgba(255, 255, 255, 0.1)',
       backdropFilter: 'blur(10px)',
       border: '1px solid rgba(255, 255, 255, 0.2)',
       color: 'white',
     },
   }}
 />
</div>
  );
};

export default NumberSlider;
