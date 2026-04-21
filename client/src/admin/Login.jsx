import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/admin/login", {
        username,
        password
      });

      localStorage.setItem("token", res.data.token);
      nav("/admin/dashboard");

    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#FFF8E1]">
      <div className="bg-white p-8 rounded-xl shadow w-[300px]">
        <h2 className="text-xl mb-4 text-center font-semibold">Admin Login</h2>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Username"
          onChange={e => setUsername(e.target.value)}
        />

        <input
          type="password"
          className="border p-2 w-full mb-4"
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
        />

        <button
          className="bg-orange-500 text-white w-full py-2 rounded"
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </div>
  );
}