import { useEffect, useState } from "react"
import axios from "axios"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import AdminUsers from "./AdminUsers"
import QuestionBank from "./QuestionBank"
import SubjectManage from "./SubjectManage"
import BulkUpload from "./BulkUpload"

const API = import.meta.env.VITE_API_BASE_URL

const menuItems = [
  { id: "dashboard", icon: "⊞", label: "Dashboard" },
  { id: "users", icon: "👥", label: "Users" },
  { id: "subjects", icon: "📚", label: "Subject Manage" },
  { id: "questions", icon: "❓", label: "Question Bank" },
   {
      id: "bulk-upload",
      icon: "📁",
      label: "Bulk Question Upload"
    },
  { id: "exams", icon: "📝", label: "Exam Management" },
  { id: "subscriptions", icon: "💳", label: "Subscriptions" },
  { id: "analytics", icon: "📈", label: "Analytics" },
  { id: "settings", icon: "⚙️", label: "Settings" },
]

export default function AdminDashboard() {
  const [active, setActive] = useState("dashboard")
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const token = localStorage.getItem("adminToken")

  useEffect(() => {
    if (!token) { window.location.href = "/admin/login"; return }
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(res.data.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    window.location.href = "/admin/login"
  }

  const statCards = stats ? [
    { label: "Total Users", value: stats.totalUsers, icon: "👥", color: "#4F46E5", light: "#EEF2FF", change: `+${stats.newUsersThisMonth} this month` },
    { label: "Active Subscriptions", value: stats.activeSubscriptions, icon: "💳", color: "#0EA5E9", light: "#F0F9FF", change: "Currently active" },
    { label: "Total Questions", value: stats.totalQuestions, icon: "❓", color: "#10B981", light: "#ECFDF5", change: "In question bank" },
    { label: "Exam Sessions", value: stats.totalExamSessions, icon: "📝", color: "#F59E0B", light: "#FFFBEB", change: `${stats.todayExamAttempts} today` },
  ] : []

  const S = {
    app: { display: "flex", minHeight: "100vh", background: "#F1F5F9", fontFamily: "'Inter','Segoe UI',sans-serif" },
    sidebar: { width: sidebarOpen ? "256px" : "72px", background: "#FFFFFF", borderRight: "1px solid #E2E8F0", display: "flex", flexDirection: "column", position: "fixed", height: "100vh", transition: "width 0.3s ease", boxShadow: "4px 0 12px rgba(0,0,0,0.04)", zIndex: 100, overflow: "hidden" },
    main: { marginLeft: sidebarOpen ? "256px" : "72px", flex: 1, transition: "margin-left 0.3s ease" },
  }

  return (
    <div style={S.app}>

      {/* Sidebar */}
      <div style={S.sidebar}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ minWidth: "40px", height: "40px", background: "linear-gradient(135deg,#4F46E5,#7C3AED)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", boxShadow: "0 4px 12px rgba(79,70,229,0.3)" }}>🖥️</div>
            {sidebarOpen && <div><div style={{ fontWeight: "700", fontSize: "15px", color: "#0F172A" }}>ICT Exam</div><div style={{ fontSize: "11px", color: "#94A3B8" }}>Admin Panel</div></div>}
          </div>
          {sidebarOpen && <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", fontSize: "18px" }}>←</button>}
        </div>
        {!sidebarOpen && <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", fontSize: "18px", padding: "12px", textAlign: "center" }}>→</button>}

        <nav style={{ padding: "12px 10px", flex: 1, overflowY: "auto" }}>
          {sidebarOpen && <div style={{ fontSize: "10px", color: "#CBD5E1", fontWeight: "700", letterSpacing: "1.2px", padding: "0 8px 10px" }}>NAVIGATION</div>}
          {menuItems.map(m => (
            <div key={m.id} onClick={() => setActive(m.id)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 12px", borderRadius: "10px", cursor: "pointer", marginBottom: "4px", transition: "all 0.2s", background: active === m.id ? "linear-gradient(135deg,#4F46E5,#7C3AED)" : "transparent", color: active === m.id ? "#FFFFFF" : "#64748B", fontWeight: active === m.id ? "600" : "400", fontSize: "14px", boxShadow: active === m.id ? "0 4px 12px rgba(79,70,229,0.25)" : "none" }}>
              <span style={{ fontSize: "18px", minWidth: "20px", textAlign: "center" }}>{m.icon}</span>
              {sidebarOpen && <span style={{ whiteSpace: "nowrap" }}>{m.label}</span>}
            </div>
          ))}
        </nav>

        <div style={{ padding: "16px", borderTop: "1px solid #F1F5F9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ minWidth: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(135deg,#4F46E5,#EC4899)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "15px" }}>S</div>
            {sidebarOpen && <div><div style={{ fontSize: "13px", fontWeight: "600", color: "#0F172A" }}>Super Admin</div><div style={{ fontSize: "11px", color: "#94A3B8" }}>superadmin</div></div>}
          </div>
          {sidebarOpen && <button onClick={handleLogout} style={{ width: "100%", marginTop: "12px", padding: "8px", borderRadius: "8px", border: "1px solid #FEE2E2", background: "#FFF5F5", color: "#EF4444", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>🚪 Logout</button>}
        </div>
      </div>

      {/* Main */}
      <div style={S.main}>

        {/* Header */}
        <div style={{ background: "#FFFFFF", borderBottom: "1px solid #E2E8F0", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#0F172A" }}>
              {menuItems.find(m => m.id === active)?.label || "Dashboard"}
            </h1>
            <p style={{ margin: 0, fontSize: "13px", color: "#94A3B8", marginTop: "2px" }}>{new Date().toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ padding: "8px 16px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", fontSize: "13px", color: "#64748B" }}>🔔 Notifications</div>
            <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(135deg,#4F46E5,#EC4899)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "15px" }}>S</div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "28px 32px" }}>

          {/* Users Page */}
          {active === "users" && <AdminUsers token={token} />}

          {/* Subject Manage page */}
          {active === "subjects" && <SubjectManage token={token} />}

          {/* Question Bank Page */}
          {active === "questions" && <QuestionBank token={token} />}

          {active === "bulk-upload" &&
            <BulkUpload token={token} />
          }

          {/* Coming Soon Pages */}
          {["exams", "subscriptions", "analytics", "settings"].includes(active) && (
            <div style={{ textAlign: "center", padding: "80px", color: "#94A3B8" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚧</div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#0F172A", marginBottom: "8px" }}>{menuItems.find(m => m.id === active)?.label}</div>
              <div style={{ fontSize: "14px" }}>এই section টি শীঘ্রই আসছে!</div>
            </div>
          )}

          {/* Dashboard */}
          {active === "dashboard" && (
            <>
              <div style={{ background: "linear-gradient(135deg,#4F46E5 0%,#7C3AED 50%,#0EA5E9 100%)", borderRadius: "20px", padding: "28px 32px", marginBottom: "28px", color: "white", boxShadow: "0 8px 32px rgba(79,70,229,0.3)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "120px", height: "120px", background: "rgba(255,255,255,0.05)", borderRadius: "50%" }} />
                <div style={{ position: "absolute", bottom: "-30px", right: "80px", width: "80px", height: "80px", background: "rgba(255,255,255,0.05)", borderRadius: "50%" }} />
                <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "700" }}>স্বাগতম, Super Admin! 👋</h2>
                <p style={{ margin: "8px 0 0", opacity: 0.85, fontSize: "14px" }}>ICT Exam Platform — BCS, Bank, NTRCA পরীক্ষার্থীদের জন্য</p>
              </div>

              {loading ? (
                <div style={{ textAlign: "center", padding: "60px", color: "#94A3B8" }}>Loading...</div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "20px", marginBottom: "28px" }}>
                    {statCards.map((s, i) => (
                      <div key={i} style={{ background: "#FFFFFF", borderRadius: "16px", padding: "24px", border: "1px solid #F1F5F9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", transition: "all 0.2s", cursor: "default" }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.08)" }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                          <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: s.light, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>{s.icon}</div>
                          <div style={{ padding: "4px 10px", borderRadius: "20px", background: s.light, color: s.color, fontSize: "11px", fontWeight: "600" }}>Live</div>
                        </div>
                        <div style={{ fontSize: "32px", fontWeight: "800", color: "#0F172A", lineHeight: 1 }}>{s.value}</div>
                        <div style={{ fontSize: "13px", color: "#64748B", marginTop: "6px", fontWeight: "500" }}>{s.label}</div>
                        <div style={{ fontSize: "11px", color: s.color, marginTop: "8px", fontWeight: "500" }}>↑ {s.change}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "20px", marginBottom: "24px" }}>
                    <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "24px", border: "1px solid #F1F5F9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#0F172A" }}>📈 Exam Attempts</h3>
                          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94A3B8" }}>Last 7 days</p>
                        </div>
                        <div style={{ padding: "6px 14px", background: "#EEF2FF", color: "#4F46E5", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>Weekly</div>
                      </div>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={stats.last7DaysExams}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94A3B8" }} />
                          <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} allowDecimals={false} />
                          <Tooltip contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: "12px" }} />
                          <Line type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={3} dot={{ fill: "#4F46E5", r: 5 }} activeDot={{ r: 7 }} name="Attempts" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "24px", border: "1px solid #F1F5F9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#0F172A" }}>👥 Recent Users</h3>
                        <span onClick={() => setActive("users")} style={{ fontSize: "12px", color: "#4F46E5", cursor: "pointer", fontWeight: "600" }}>View all →</span>
                      </div>
                      {stats.recentUsers.map((u, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: i < stats.recentUsers.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: `linear-gradient(135deg, ${["#4F46E5","#0EA5E9","#10B981","#F59E0B","#EC4899"][i % 5]}, ${["#7C3AED","#0284C7","#059669","#D97706","#DB2777"][i % 5]})`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "13px", flexShrink: 0 }}>{u.fullName?.charAt(0)}</div>
                          <div style={{ flex: 1, overflow: "hidden" }}>
                            <div style={{ fontSize: "13px", fontWeight: "600", color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.fullName}</div>
                            <div style={{ fontSize: "11px", color: "#94A3B8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.email}</div>
                          </div>
                          <div style={{ fontSize: "10px", color: "#CBD5E1", whiteSpace: "nowrap" }}>{u.createdAt}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "24px", border: "1px solid #F1F5F9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                      <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#0F172A" }}>📝 Recent Exam Sessions</h3>
                      <span onClick={() => setActive("exams")} style={{ fontSize: "12px", color: "#4F46E5", cursor: "pointer", fontWeight: "600" }}>View all →</span>
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "#F8FAFC" }}>
                          {["User", "Type", "Score", "Questions", "Status", "Date"].map(h => (
                            <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#94A3B8", letterSpacing: "0.5px", textTransform: "uppercase" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentExams.map((e, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid #F8FAFC" }}
                            onMouseEnter={el => el.currentTarget.style.background = "#FAFAFA"}
                            onMouseLeave={el => el.currentTarget.style.background = "transparent"}>
                            <td style={{ padding: "12px 14px", fontSize: "13px", fontWeight: "600", color: "#0F172A" }}>{e.userName}</td>
                            <td style={{ padding: "12px 14px" }}>
                              <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: e.sessionType === "PRACTICE" ? "#EEF2FF" : "#F0F9FF", color: e.sessionType === "PRACTICE" ? "#4F46E5" : "#0EA5E9" }}>{e.sessionType}</span>
                            </td>
                            <td style={{ padding: "12px 14px", fontSize: "13px", color: "#0F172A", fontWeight: "600" }}>{e.score}</td>
                            <td style={{ padding: "12px 14px", fontSize: "13px", color: "#64748B" }}>{e.totalQuestions}</td>
                            <td style={{ padding: "12px 14px" }}>
                              <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: e.status === "COMPLETED" ? "#ECFDF5" : e.status === "IN_PROGRESS" ? "#FFFBEB" : "#FEF2F2", color: e.status === "COMPLETED" ? "#10B981" : e.status === "IN_PROGRESS" ? "#F59E0B" : "#EF4444" }}>{e.status}</span>
                            </td>
                            <td style={{ padding: "12px 14px", fontSize: "12px", color: "#94A3B8" }}>{e.createdAt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "24px", border: "1px solid #F1F5F9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                      <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: "700", color: "#0F172A" }}>📊 Platform Modules</h3>
                      {[
                        { label: "BCS Preparation", value: "Active", color: "#10B981" },
                        { label: "Bank Exam", value: "Active", color: "#10B981" },
                        { label: "NTRCA Prep", value: "Active", color: "#10B981" },
                        { label: "Payment System", value: "Coming Soon", color: "#F59E0B" },
                        { label: "AI Features", value: "Coming Soon", color: "#F59E0B" },
                        { label: "Battle Exam", value: "Coming Soon", color: "#F59E0B" },
                      ].map((item, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < 5 ? "1px solid #F8FAFC" : "none" }}>
                          <span style={{ fontSize: "13px", color: "#64748B" }}>{item.label}</span>
                          <span style={{ fontSize: "11px", fontWeight: "600", color: item.color, background: item.color + "15", padding: "3px 10px", borderRadius: "20px" }}>{item.value}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "24px", border: "1px solid #F1F5F9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                      <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: "700", color: "#0F172A" }}>🔧 System Status</h3>
                      {[
                        { label: "Backend API", status: "Online", color: "#10B981" },
                        { label: "Database", status: "Online", color: "#10B981" },
                        { label: "Auth Service", status: "Online", color: "#10B981" },
                        { label: "Exam Engine", status: "Online", color: "#10B981" },
                        { label: "Payment Gateway", status: "Offline", color: "#EF4444" },
                        { label: "AI Service", status: "Offline", color: "#EF4444" },
                      ].map((item, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < 5 ? "1px solid #F8FAFC" : "none" }}>
                          <span style={{ fontSize: "13px", color: "#64748B" }}>{item.label}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                            <span style={{ fontSize: "12px", fontWeight: "600", color: item.color }}>{item.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
