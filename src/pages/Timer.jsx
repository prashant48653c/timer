import React, { useRef, useState } from "react";

const SetupForm = () => {
  const [projectName, setProjectName] = useState("");
  const [numberInput, setNumberInput] = useState("");
  const [finalNum, setFinalNum] = useState([]);
  const [intervalSec, setIntervalSec] = useState(2);
const [isRunning, setIsRunning] = useState(false);
const [isPaused, setIsPaused] = useState(false);
const [currentIndex, setCurrentIndex] = useState(0);
 
const intervalRef = useRef(null);




const speakNumber = (num) => {
  if (!window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(num.toString());
  utterance.lang = "en"; // Or "ne" if you want Nepali
  utterance.rate = 1;
  window.speechSynthesis.speak(utterance);
};

const handleStart = () => {
  if (finalNum.length === 0 || isRunning) return;

  setIsRunning(true);
  setIsPaused(false);
  setCurrentIndex(0);

  intervalRef.current = setInterval(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex >= finalNum.length) {
        clearInterval(intervalRef.current);
        setIsRunning(false);
        return prevIndex;
      }

      speakNumber(finalNum[prevIndex]);
      return prevIndex + 1;
    });
  }, intervalSec * 1000);
};



const handlePauseResume = () => {
  if (!isRunning) return;

  if (isPaused) {
    // Resume
    setIsPaused(false);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= finalNum.length) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          return prevIndex;
        }
        speakNumber(finalNum[nextIndex]);
        return nextIndex;
      });
    }, intervalSec * 1000);
  } else {
    // Pause
    setIsPaused(true);
    clearInterval(intervalRef.current);
    window.speechSynthesis.cancel(); // stop current speaking
  }
};



  const handleSubmit = (e) => {
    e.preventDefault();
    const numbers = numberInput
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n !== "")
      .map(Number);
    if (projectName.trim() === "" || numbers.length < 3) {
      alert("Please enter a project name and at least 3 numbers.");
      return;
    }
    setFinalNum(numbers);
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.heading}>Project Setup</h2>

        <label style={styles.label}>Project Name</label>
        <input
          style={styles.input}
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Enter project name"
          required
        />

        <label style={styles.label}>Numbers (comma-separated)</label>
        <input
          style={styles.input}
          type="text"
          value={numberInput}
          onChange={(e) => setNumberInput(e.target.value)}
          placeholder="e.g. 1, 2, 3, 4"
          required
        />

        <label style={styles.label}>Interval (seconds)</label>
        <input
          style={styles.input}
          type="number"
          value={intervalSec}
          onChange={(e) => setIntervalSec(Number(e.target.value))}
          min={1}
          required
        />

        <button style={styles.button} type="submit">
          Setup
        </button>
      </form>

      {/* Pyramid box UI */}
      {finalNum.length >= 3 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            gap: "20px",
            height: "180px",
            marginTop: "40px",
            position: "relative",
            maxWidth: "400px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {/* Box 1 (bottom-left) */}
          <div
            style={{
              width: "60px",
              height: "60px",
              background: "#3498db",
              borderRadius: "10px",
              color: "#fff",
              fontWeight: "700",
              fontSize: "22px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              top: "40px",
              boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
            }}
          >
            {/* empty box */}
          </div>

          {/* Box 2 (bottom-left middle) */}
          <div
            style={{
              width: "60px",
              height: "60px",
              background: "#3498db",
              borderRadius: "10px",
              color: "#fff",
              fontWeight: "700",
              fontSize: "22px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              top: "20px",
              boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
            }}
          >
            {/* empty box */}
          </div>

          {/* Box 3 (top center) */}
          <div
            style={{
              width: "60px",
              height: "60px",
              background: "#e74c3c",
              borderRadius: "10px",
              color: "#fff",
              fontWeight: "700",
              fontSize: "22px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              top: "0px",
              boxShadow: "0 8px 16px rgba(0,0,0,0.25)",
              border: "3px solid white",
              animation: "pulse 2s infinite",
            }}
          >
            {finalNum[0]}
          </div>

          {/* Box 4 (bottom-right middle) */}
          <div
            style={{
              width: "60px",
              height: "60px",
              background: "#9b59b6",
              borderRadius: "10px",
              color: "#fff",
              fontWeight: "700",
              fontSize: "22px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              top: "20px",
              boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
            }}
          >
            {finalNum[1]}
          </div>

          {/* Box 5 (bottom-right) */}
          <div
            style={{
              width: "60px",
              height: "60px",
              background: "#2980b9",
              borderRadius: "10px",
              color: "#fff",
              fontWeight: "700",
              fontSize: "22px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              top: "40px",
              boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
            }}
          >
            {finalNum[2]}
          </div>
        </div>
      )}

      {/* Bottom number bar */}
      {finalNum.length > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "#f0f0f0",
            display: "flex",
            justifyContent: "center",
            gap: "6px",
            padding: "8px 0",
            borderTop: "1px solid #ccc",
            overflowX: "auto",
          }}
        >
          {finalNum.map((num, idx) => (
            <div
              key={idx}
              style={{
                minWidth: "24px",
                minHeight: "24px",
                background: "#ddd",
                color: "#333",
                fontWeight: "600",
                fontSize: "14px",
                borderRadius: "4px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "0 6px",
              }}
            >
              {num}
            </div>
          ))}
        </div>
      )}

      {finalNum.length >= 3 && (
  <div style={{ textAlign: "center", marginTop: "20px" }}>
   <button onClick={handleStart}>Start</button>
<button onClick={handlePauseResume}>{isPaused ? "Resume" : "Pause"}</button>

  </div>
)}


      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              box-shadow: 0 0 20px rgba(231, 76, 60, 0.5);
              border-color: white;
            }
            50% {
              box-shadow: 0 0 30px rgba(231, 76, 60, 0.8);
              border-color: #f1c40f;
            }
          }
        `}
      </style>
    </div>
  );
};

const styles = {
  container: {
    background:
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection:"column",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  form: {
    background: "rgba(255, 255, 255, 0.95)",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
    boxSizing: "border-box",
  },
  heading: {
    color: "#333",
    marginBottom: "20px",
    fontWeight: "300",
    textAlign: "center",
  },
  label: {
    display: "block",
    margin: "10px 0 5px",
    color: "#666",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "2px solid #e0e0e0",
    fontSize: "16px",
    boxSizing: "border-box",
    transition: "border-color 0.3s ease",
    outline: "none",
    marginBottom: "15px",
  },
  button: {
    width: "100%",
    padding: "12px",
    background:
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    color: "white",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "1px",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
};

export default SetupForm;
