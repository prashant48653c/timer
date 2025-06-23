import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useUserStore from "../reducer/useUserStore";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

const styles = {
  form: {
    maxWidth: 400,
    margin: "2rem auto",
    padding: "2rem",
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  title: {
    marginBottom: "1.5rem",
    textAlign: "center",
    color: "#0f172a",
    fontSize: "1.8rem",
    fontWeight: "700",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "1rem",
  },
  label: {
    marginBottom: 6,
    fontWeight: "600",
    color: "#334155",
  },
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1.5px solid #cbd5e1",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.2s ease",
  },
  inputFocus: {
    borderColor: "#3b82f6",
    boxShadow: "0 0 0 3px rgba(59,130,246,0.3)",
  },
  button: {
    width: "100%",
    padding: "12px 0",
    borderRadius: 8,
    border: "none",
    backgroundColor: "#14b8a6",
    color: "white",
    fontWeight: "700",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  buttonDisabled: {
    backgroundColor: "#94a3b8",
    cursor: "not-allowed",
  },
  message: {
    marginTop: "1rem",
    textAlign: "center",
    fontWeight: "600",
  },
};

export default function Login() {
  const [email, setEmail] = useState("");
   const setUser = useUserStore((state) => state.setUser);

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
    const [showPassword, setShowPassword] = useState(false); // 👈 new state

  const [focusedField, setFocusedField] = useState(null);
const navigate=useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
        if(!email || !password) {
         setMessage("Please fill in all required fields.");
        
        throw new Error("All fields are required.");
       
      }
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/login`, { email, password });
      if(res.data){
        console.log(res.data)
        setUser(res.data.user);
        localStorage.setItem("user",res.data.user)
        localStorage.setItem("userId",res.data.user.id)

        navigate('/project')
      }
      setMessage("Login successful!");
      setEmail("");
      setPassword("");
    } catch (error) {
      setMessage("Login failed: " + (error.response?.data?.message || error.message));
    }
    setLoading(false);
  };

  const inputStyle = (field) =>
    focusedField === field
      ? { ...styles.input, ...styles.inputFocus }
      : styles.input;

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 className="text-3xl font-bold text-center"  >Login</h2>

      <div style={styles.field}>
        <label htmlFor="email" style={styles.label}>Email</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle("email")}
          onFocus={() => setFocusedField("email")}
          onBlur={() => setFocusedField(null)}
        />
      </div>

     <div style={styles.field}>
  <label htmlFor="password" style={styles.label}>
    Password
  </label>
  <div style={{ position: "relative" }}>
    <input
      id="password"
      type={showPassword ? "text" : "password"}
      required
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      style={{
        ...inputStyle("password"),
        paddingRight: "2.75rem", // space for the eye icon
      }}
      onFocus={() => setFocusedField("password")}
      onBlur={() => setFocusedField(null)}
    />
    <button
      type="button"
      onClick={() => setShowPassword((prev) => !prev)}
      style={{
        position: "absolute",
        top: "50%",
        right: "10px",
        transform: "translateY(-50%)",
        background: "transparent",
        border: "none",
        padding: 0,
        margin: 0,
        cursor: "pointer",
        color: "#64748b",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "24px",
      }}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <FaRegEyeSlash size={18} /> : <FaRegEye size={18} />}
    </button>
  </div>
</div>


      <button
        type="submit"
        disabled={loading}
        style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      {message && (
        <p
          style={{
            ...styles.message,
            color: message.startsWith("Login successful") ? "#16a34a" : "#dc2626",
          }}
        >
          {message}
        </p>
      )}
    </form>
  );
}
