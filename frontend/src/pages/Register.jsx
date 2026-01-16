import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

// 🔥 THIS WAS MISSING
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ hook inside component

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");



  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await registerUser({ name, email, password });

      if (res?.token) {
        localStorage.setItem("token", res.token);
        login(res.user); // 🔥 updates navbar instantly
        navigate("/");
      } else {
        alert(res?.detail || "Registration failed");
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <form
        onSubmit={handleRegister}
        className="bg-white/5 p-8 rounded-xl w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-white text-center">
          Sign Up
        </h1>

        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button className="w-full bg-white text-black">
          Create Account
        </Button>

        <p className="text-gray-400 text-sm text-center">
          Already have an account?{" "}
          <span
            className="text-white cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

  <a href="/terms" className="text-sm text-gray-400 underline">
  Terms & Conditions
  </a>
export default Register;
