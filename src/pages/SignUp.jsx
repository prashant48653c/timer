import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const styles = {
  form: {
    maxWidth: 480,
    margin: "2rem auto",
    padding: "2rem 2.5rem",
    borderRadius: 12,
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  title: {
    marginBottom: "1.5rem",
    textAlign: "center",
    color: "#0f172a",
    fontSize: "2rem",
    fontWeight: "700",
  },
  field: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: 8,
    fontWeight: "600",
    color: "#334155",
    fontSize: 14,
  },
  input: {
    padding: "12px 14px",
    borderRadius: 8,
    border: "1.5px solid #cbd5e1",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    width: "100%",
    boxSizing: "border-box",
  },
  inputFocus: {
    borderColor: "#3b82f6",
    boxShadow: "0 0 0 3px rgba(59,130,246,0.3)",
  },
  fileInput: {
    borderRadius: 8,
    border: "1.5px solid #cbd5e1",
    padding: "6px 10px",
    fontSize: 14,
    cursor: "pointer",
  },
  button: {
    marginTop: "1.5rem",
    padding: "14px 0",
    borderRadius: 8,
    border: "none",
    backgroundColor: "#14b8a6",
    color: "white",
    fontWeight: "700",
    fontSize: "1.1rem",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  buttonHover: {
    backgroundColor: "#0d9488",
  },
  buttonDisabled: {
    backgroundColor: "#94a3b8",
    cursor: "not-allowed",
  },
  message: {
    marginTop: "1rem",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
  },
};

export default function SignUp() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const [buttonHover, setButtonHover] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    
    try {
      if(!firstName || !lastName || !email || !password) {
         setMessage("Please fill in all required fields.");
        
        throw new Error("All fields are required.");
       
      }
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("password", password);
      if (image1) formData.append("image1", image1);
      if (image2) formData.append("image2", image2);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/signup`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (res.data) {
        navigate("/login");
      }

      setMessage("Signup successful!");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setImage1(null);
      setImage2(null);
    } catch (error) {
      setMessage("Signup failed: " + (error.response?.data?.message || error.message));
    }
    setLoading(false);
  };

  const inputStyle = (field) =>
    focusedField === field
      ? { ...styles.input, ...styles.inputFocus }
      : styles.input;

  return (
    <form
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      style={styles.form}
      noValidate
    >
      <h2 style={styles.title}>Sign Up</h2>

      <div style={styles.field}>
        <label htmlFor="firstName" style={styles.label}>
          First Name
        </label>
        <input
          id="firstName"
          type="text"
          required
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          style={inputStyle("firstName")}
          onFocus={() => setFocusedField("firstName")}
          onBlur={() => setFocusedField(null)}
          autoComplete="given-name"
        />
      </div>

      <div style={styles.field}>
        <label htmlFor="lastName" style={styles.label}>
          Last Name
        </label>
        <input
          id="lastName"
          type="text"
          required
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          style={inputStyle("lastName")}
          onFocus={() => setFocusedField("lastName")}
          onBlur={() => setFocusedField(null)}
          autoComplete="family-name"
        />
      </div>

      <div style={styles.field}>
        <label htmlFor="email" style={styles.label}>
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle("email")}
          onFocus={() => setFocusedField("email")}
          onBlur={() => setFocusedField(null)}
          autoComplete="email"
        />
      </div>

      <div style={styles.field}>
        <label htmlFor="password" style={styles.label}>
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle("password")}
          onFocus={() => setFocusedField("password")}
          onBlur={() => setFocusedField(null)}
          autoComplete="new-password"
        />
      </div>

      <div style={styles.field}>
        <label htmlFor="image1" style={styles.label}>
          Image 1
        </label>
        <input
          id="image1"
          type="file"
          accept="image/*"
          style={styles.fileInput}
          onChange={(e) => setImage1(e.target.files[0])}
        />
      </div>

      <div style={styles.field}>
        <label htmlFor="image2" style={styles.label}>
          Image 2
        </label>
        <input
          id="image2"
          type="file"
          accept="image/*"
          style={styles.fileInput}
          onChange={(e) => setImage2(e.target.files[0])}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        onMouseEnter={() => setButtonHover(true)}
        onMouseLeave={() => setButtonHover(false)}
        style={
          loading
            ? { ...styles.button, ...styles.buttonDisabled }
            : buttonHover
            ? { ...styles.button, ...styles.buttonHover }
            : styles.button
        }
      >
        {loading ? "Signing up..." : "Sign Up"}
      </button>

      {message && (
        <p
          style={{
            ...styles.message,
            color: message.startsWith("Signup successful") ? "#16a34a" : "#dc2626",
          }}
          role="alert"
        >
          {message}
        </p>
      )}
    </form>
  );
}
