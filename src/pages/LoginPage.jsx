import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/books", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-gray-100 px-4 py-8 sm:px-6 sm:py-12">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-md sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
            <svg
              aria-hidden="true"
              className="h-8 w-8"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 7.5C9.8 5.9 6.7 5.5 3.5 6.4v11.2c3.2-.9 6.3-.5 8.5 1.1m0-11.2c2.2-1.6 5.3-2 8.5-1.1v11.2c-3.2-.9-6.3-.5-8.5 1.1m0-11.2v11.2"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="mt-2 text-xl font-bold sm:text-2xl">The Reading Room</h1>
        </div>

        {error && <div className="mb-4 break-words rounded border border-red-400 bg-red-100 px-4 py-3 text-sm text-red-700" role="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2 text-sm">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="min-h-11 w-full min-w-0 rounded-md border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2 text-sm">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="min-h-11 w-full min-w-0 rounded-md border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="min-h-11 w-full rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-600 disabled:bg-gray-400" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          New here? <Link to="/register" className="text-blue-500 hover:underline">Register as a student</Link>
        </div>
      </div>
    </main>
  );
}