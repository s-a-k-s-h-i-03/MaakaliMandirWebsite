import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../Context/AdminAuthContext";
import { useToast } from "../Components/ToastProvider";
import { loginAdmin } from "../Services/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useAdminAuth();
  const { showToast } = useToast();

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const data = await loginAdmin({ username, password });
      auth.login(data.token);
      navigate("/admin/dashboard");
    } catch {
      showToast({
        tone: "error",
        title: "Login failed",
        description: "Please check your username and password.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,215,0,0.35),transparent_30%),linear-gradient(180deg,#4a0f0f_0%,#7a1c1c_45%,#f7e5b6_160%)] px-4 py-10">
      <div className="mx-auto flex min-h-[90vh] max-w-6xl items-center">
        <div className="grid w-full gap-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div className="rounded-[1.75rem] bg-gradient-to-br from-[#fff6df] via-[#ffe8ad] to-[#fff3d6] p-8 shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#8b0000]">Temple Administration</p>
            <h1 className="mt-5 font-display text-5xl font-bold leading-tight text-[#4f1405]">Manage donations, events, and registrations in one place.</h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-700">
              This dashboard preserves the existing temple branding while giving administrators a cleaner daily workflow for the modules currently supported by the backend.
            </p>
          </div>

          <div className="rounded-[1.75rem] bg-white p-8 shadow-xl">
            <h2 className="font-display text-3xl font-semibold text-slate-900">Admin Login</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">Use the existing administrator account. JWT authentication and route protection remain unchanged.</p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="username">Username</label>
                <input id="username" className="admin-input" value={username} onChange={(event) => setUsername(event.target.value)} required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="password">Password</label>
                <input id="password" type="password" className="admin-input" value={password} onChange={(event) => setPassword(event.target.value)} required />
              </div>
              <button type="submit" className="admin-button-primary w-full justify-center" disabled={loading}>
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
