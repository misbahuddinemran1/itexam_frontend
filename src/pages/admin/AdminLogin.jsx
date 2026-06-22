import { useState } from "react"
import axios from "axios"

const API = import.meta.env.VITE_API_BASE_URL

export default function AdminLogin() {
  const [form, setForm] = useState({ username: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.username || !form.password) {
      setError("সব field পূরণ করো")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await axios.post(`${API}/auth/login`, form)
      const token = res.data.data.token
      localStorage.setItem("adminToken", token)
      window.location.href = "/admin/dashboard"
    } catch (err) {
      setError("Username অথবা Password ভুল!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
            <span className="text-2xl">🖥️</span>
          </div>
          <h1 className="text-2xl font-bold text-white">ICT Exam Platform</h1>
          <p className="text-blue-300 text-sm mt-1">Admin Panel</p>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-6">Admin Login</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="text-sm text-blue-200 mb-2 block">Username</label>
            <input
              type="text"
              placeholder="superadmin"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div className="mb-6">
            <label className="text-sm text-blue-200 mb-2 block">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold rounded-xl py-3 text-sm transition shadow-lg"
          >
            {loading ? "Loading..." : "Login করো"}
          </button>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          ICT Exam Platform © 2025
        </p>
      </div>
    </div>
  )
}
