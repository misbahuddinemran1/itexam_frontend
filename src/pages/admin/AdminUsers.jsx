import { useEffect, useState, useRef, useCallback } from "react"
import axios from "axios"

const API = "http://localhost:8080/api/v1"

const PLANS = [
  { code: "MONTHLY", label: "🔵 Monthly Plan", sub: "সব feature, 30 দিন — 199৳", color: "#3B82F6", bg: "#EFF6FF" },
  { code: "YEARLY", label: "🟣 Yearly Plan", sub: "সব feature, 365 দিন — 1499৳", color: "#8B5CF6", bg: "#F5F3FF" },
  { code: "FREE", label: "🆓 Free Plan", sub: "Limited access", color: "#6B7280", bg: "#F9FAFB" },
]

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState("")
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [size, setSize] = useState(10)
  const [openMenu, setOpenMenu] = useState(null)
  const [viewUser, setViewUser] = useState(null)
  const [confirmBlock, setConfirmBlock] = useState(null)
  const [grantSubModal, setGrantSubModal] = useState(null)
  const [selectedPlanCode, setSelectedPlanCode] = useState(null)
  const [grantLoading, setGrantLoading] = useState(false)
  const [plans, setPlans] = useState([])
  const [toast, setToast] = useState(null)
  const searchTimerRef = useRef(null)

  useEffect(() => { fetchUsers() }, [page, size])

  useEffect(() => {
    clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => { setPage(0); fetchUsers(0) }, 400)
    return () => clearTimeout(searchTimerRef.current)
  }, [keyword])

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("[data-menu-container]")) setOpenMenu(null)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const fetchUsers = async (overridePage = page) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("adminToken")
      const res = await axios.get(`${API}/admin/users`, {
        params: { keyword: keyword || undefined, page: overridePage, size },
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = res.data.data
      setUsers(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (e) {
      showToast("ডেটা লোড হয়নি!", "error")
    } finally {
      setLoading(false)
    }
  }

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const res = await axios.get(`${API}/admin/subscriptions/plans`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPlans(res.data.data || [])
    } catch {
      setPlans(PLANS)
    }
  }

  const toggleStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem("adminToken")
      await axios.put(`${API}/admin/users/${userId}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showToast(currentStatus ? "User blocked করা হয়েছে!" : "User active করা হয়েছে!", "success")
      fetchUsers()
    } catch {
      showToast("Status পরিবর্তন হয়নি!", "error")
    }
    setConfirmBlock(null)
  }

  const grantSubscription = async () => {
    if (!selectedPlanCode) return
    setGrantLoading(true)
    try {
      const token = localStorage.getItem("adminToken")
      await axios.post(
        `${API}/admin/users/${grantSubModal.id}/grant-subscription`,
        { planId: selectedPlanCode, durationDays: 0, notes: "Admin কর্তৃক প্রদত্ত" },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      showToast("Subscription দেওয়া হয়েছে!", "success")
      fetchUsers()
      setGrantSubModal(null)
      setSelectedPlanCode(null)
    } catch {
      showToast("Subscription দেওয়া যায়নি!", "error")
    }
    setGrantLoading(false)
  }

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const subBadge = (status, planName, expiry) => {
    const map = {
      ACTIVE: { bg: "#ECFDF5", color: "#059669", text: "Active", dot: "#10B981" },
      TRIAL: { bg: "#FFF7ED", color: "#D97706", text: "Trial", dot: "#F59E0B" },
      NONE: { bg: "#F1F5F9", color: "#94A3B8", text: "None", dot: "#CBD5E1" },
    }
    const s = map[status] || map.NONE
    return (
      <div style={{ display: "inline-flex", flexDirection: "column", gap: "3px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "20px", background: s.bg, color: s.color, fontSize: "11px", fontWeight: "700" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: s.dot }} />
          {planName ? planName : s.text}
        </span>
        {expiry && status !== "NONE" && (
          <span style={{ fontSize: "10px", color: "#94A3B8", paddingLeft: "4px" }}>{expiry}</span>
        )}
      </div>
    )
  }
  const statusBadge = (isActive) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "20px", background: isActive ? "#ECFDF5" : "#FEF2F2", color: isActive ? "#059669" : "#DC2626", fontSize: "11px", fontWeight: "700" }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: isActive ? "#10B981" : "#EF4444" }} />
      {isActive ? "Active" : "Blocked"}
    </span>
  )

  const avatar = (name, index) => {
    const colors = [
      ["#4F46E5", "#7C3AED"], ["#0EA5E9", "#0284C7"],
      ["#10B981", "#059669"], ["#F59E0B", "#D97706"],
      ["#EC4899", "#DB2777"], ["#8B5CF6", "#7C3AED"]
    ]
    const [a, b] = colors[index % colors.length]
    return (
      <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: `linear-gradient(135deg,${a},${b})`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "14px", flexShrink: 0, boxShadow: `0 3px 8px ${a}50` }}>
        {name?.charAt(0)?.toUpperCase() || "?"}
      </div>
    )
  }

  const Overlay = ({ onClose, children }) => (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      {children}
    </div>
  )

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .menu-item:hover { background: #F8FAFC !important; }
        .row-hover:hover { background: #FAFBFF !important; }
        .action-btn:hover { background: #EEF2FF !important; border-color: #C7D2FE !important; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: "24px", right: "24px", zIndex: 99999, padding: "14px 20px", borderRadius: "12px", background: toast.type === "success" ? "#ECFDF5" : "#FEF2F2", color: toast.type === "success" ? "#059669" : "#DC2626", border: `1px solid ${toast.type === "success" ? "#A7F3D0" : "#FECACA"}`, boxShadow: "0 8px 32px rgba(0,0,0,0.15)", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", animation: "slideRight 0.3s ease" }}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      {/* Block Confirm Modal */}
      {confirmBlock && (
        <Overlay onClose={() => setConfirmBlock(null)}>
          <div style={{ background: "white", borderRadius: "20px", padding: "36px", width: "380px", boxShadow: "0 24px 60px rgba(0,0,0,0.2)", textAlign: "center", animation: "fadeUp 0.25s ease" }}>
            <div style={{ width: "68px", height: "68px", borderRadius: "50%", background: confirmBlock.active ? "#FEF2F2" : "#ECFDF5", margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px" }}>
              {confirmBlock.active ? "🚫" : "✅"}
            </div>
            <h3 style={{ margin: "0 0 10px", fontSize: "18px", fontWeight: "700", color: "#0F172A" }}>
              {confirmBlock.active ? "User Block করবেন?" : "User Unblock করবেন?"}
            </h3>
            <p style={{ margin: "0 0 28px", fontSize: "13px", color: "#64748B", lineHeight: 1.6 }}>
              <strong style={{ color: "#0F172A" }}>{confirmBlock.fullName}</strong> কে{" "}
              {confirmBlock.active ? "block করলে সে আর login করতে পারবে না।" : "unblock করলে সে আবার login করতে পারবে।"}
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setConfirmBlock(null)}
                style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #E2E8F0", background: "white", color: "#64748B", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>বাতিল</button>
              <button onClick={() => toggleStatus(confirmBlock.id, confirmBlock.active)}
                style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", background: confirmBlock.active ? "linear-gradient(135deg,#EF4444,#DC2626)" : "linear-gradient(135deg,#10B981,#059669)", color: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                {confirmBlock.active ? "🚫 Block করুন" : "✅ Unblock করুন"}
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* Grant Subscription Modal */}
      {grantSubModal && (
        <Overlay onClose={() => { setGrantSubModal(null); setSelectedPlanCode(null) }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "32px", width: "440px", boxShadow: "0 24px 60px rgba(0,0,0,0.2)", animation: "fadeUp 0.25s ease" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: "700", color: "#0F172A" }}>💳 Subscription দিন</h3>
                <p style={{ margin: 0, fontSize: "12px", color: "#94A3B8" }}>{grantSubModal.fullName} — {grantSubModal.email}</p>
              </div>
              <button onClick={() => { setGrantSubModal(null); setSelectedPlanCode(null) }}
                style={{ background: "#F1F5F9", border: "none", borderRadius: "50%", width: "34px", height: "34px", cursor: "pointer", fontSize: "18px", color: "#64748B", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>

            {/* Current Status */}
            <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "12px 16px", marginBottom: "20px" }}>
              <div style={{ fontSize: "11px", color: "#94A3B8", fontWeight: "600", marginBottom: "8px" }}>বর্তমান অবস্থা</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#0F172A" }}>
                  {grantSubModal.subscriptionPlanName
                    ? grantSubModal.subscriptionPlanName
                    : "কোনো subscription নেই"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {subBadge(grantSubModal.subscriptionStatus, grantSubModal.subscriptionPlanName, grantSubModal.subscriptionExpiry)}
                  {grantSubModal.subscriptionExpiry && (
                    <span style={{ fontSize: "11px", color: "#94A3B8" }}>
                      {grantSubModal.subscriptionExpiry} পর্যন্ত
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Plan Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              {PLANS.map(plan => (
                <div key={plan.code}
                  onClick={() => setSelectedPlanCode(plan.code)}
                  style={{ padding: "14px 16px", borderRadius: "12px", border: `2px solid ${selectedPlanCode === plan.code ? plan.color : "#E2E8F0"}`, background: selectedPlanCode === plan.code ? plan.bg : "white", cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: `2px solid ${plan.color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {selectedPlanCode === plan.code && <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: plan.color }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#0F172A" }}>{plan.label}</div>
                    <div style={{ fontSize: "12px", color: "#94A3B8", marginTop: "2px" }}>{plan.sub}</div>
                  </div>
                  {selectedPlanCode === plan.code && (
                    <span style={{ fontSize: "11px", fontWeight: "700", color: plan.color, background: plan.bg, padding: "3px 10px", borderRadius: "20px" }}>Selected</span>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => { setGrantSubModal(null); setSelectedPlanCode(null) }}
                style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #E2E8F0", background: "white", color: "#64748B", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>বাতিল</button>
              <button onClick={grantSubscription} disabled={!selectedPlanCode || grantLoading}
                style={{ flex: 2, padding: "12px", borderRadius: "10px", border: "none", background: !selectedPlanCode ? "#E2E8F0" : "linear-gradient(135deg,#4F46E5,#7C3AED)", color: !selectedPlanCode ? "#94A3B8" : "white", fontSize: "13px", fontWeight: "600", cursor: !selectedPlanCode ? "not-allowed" : "pointer", boxShadow: selectedPlanCode ? "0 4px 12px rgba(79,70,229,0.3)" : "none" }}>
                {grantLoading ? "⏳ Processing..." : "✅ Confirm করুন"}
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* View Profile Modal */}
      {viewUser && (
        <Overlay onClose={() => setViewUser(null)}>
          <div style={{ background: "white", borderRadius: "20px", width: "440px", boxShadow: "0 24px 60px rgba(0,0,0,0.2)", overflow: "hidden", animation: "fadeUp 0.25s ease" }}>
            <div style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)", padding: "24px 24px 56px", position: "relative" }}>
              <button onClick={() => setViewUser(null)}
                style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.2)", border: "none", color: "white", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", fontWeight: "600", letterSpacing: "1px" }}>USER PROFILE</div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "-36px", marginBottom: "12px" }}>
              <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg,#4F46E5,#EC4899)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "800", fontSize: "28px", border: "4px solid white", boxShadow: "0 8px 24px rgba(79,70,229,0.3)" }}>
                {viewUser.fullName?.charAt(0)?.toUpperCase()}
              </div>
            </div>
            <div style={{ padding: "0 24px 24px" }}>
              <h2 style={{ textAlign: "center", margin: "0 0 4px", fontSize: "20px", fontWeight: "700", color: "#0F172A" }}>{viewUser.fullName}</h2>
              <p style={{ textAlign: "center", margin: "0 0 20px", fontSize: "13px", color: "#94A3B8" }}>{viewUser.email}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {[
                  { label: "Phone", value: viewUser.phone || "N/A", icon: "📞" },
                  { label: "Joined", value: viewUser.createdAt, icon: "📅" },
                  { label: "Last Login", value: viewUser.lastLoginAt, icon: "🕐" },
                  { label: "Total Exams", value: viewUser.totalExams, icon: "📝" },
                ].map((item, i) => (
                  <div key={i} style={{ background: "#F8FAFC", borderRadius: "12px", padding: "14px" }}>
                    <div style={{ fontSize: "11px", color: "#94A3B8", fontWeight: "600", marginBottom: "4px" }}>{item.icon} {item.label}</div>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#0F172A" }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "10px", background: "#F8FAFC", borderRadius: "12px", padding: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#94A3B8", fontWeight: "600", marginBottom: "4px" }}>💳 Subscription</div>
                 <div style={{ fontSize: "13px", fontWeight: "700", color: "#0F172A" }}>
                   {viewUser.subscriptionPlanName ? viewUser.subscriptionPlanName : "No subscription"}
                 </div>
                 {viewUser.subscriptionExpiry && (
                   <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "3px" }}>
                     Expires: {viewUser.subscriptionExpiry}
                   </div>
                 )}
                </div>
                {subBadge(viewUser.subscriptionStatus, viewUser.subscriptionPlanName, null)}
              </div>
              <div style={{ marginTop: "10px", background: "#F8FAFC", borderRadius: "12px", padding: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#0F172A" }}>Account Status</span>
                {statusBadge(viewUser.active)}
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                <button onClick={() => { setGrantSubModal(viewUser); setViewUser(null) }}
                  style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "1px solid #C7D2FE", background: "#EEF2FF", color: "#4F46E5", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>💳 Grant Sub</button>
                <button onClick={() => setViewUser(null)}
                  style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg,#4F46E5,#7C3AED)", color: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Close</button>
              </div>
            </div>
          </div>
        </Overlay>
      )}

      {/* ===== PAGE CONTENT ===== */}
      <div>
        {/* Header */}
        <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#0F172A" }}>👥 Users Management</h1>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#94A3B8" }}>সব user দেখুন, manage করুন</p>
          </div>
          <div style={{ padding: "8px 18px", background: "linear-gradient(135deg,#4F46E5,#7C3AED)", borderRadius: "10px", color: "white", fontSize: "13px", fontWeight: "600", boxShadow: "0 4px 12px rgba(79,70,229,0.3)" }}>
            Total: {totalElements} Users
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "20px" }}>
          {[
            { label: "Total Users", value: totalElements, icon: "👥", color: "#4F46E5", bg: "#EEF2FF" },
            { label: "Active", value: users.filter(u => u.active).length, icon: "✅", color: "#10B981", bg: "#ECFDF5" },
            { label: "Blocked", value: users.filter(u => !u.active).length, icon: "🚫", color: "#EF4444", bg: "#FEF2F2" },
            { label: "Subscribed", value: users.filter(u => u.subscriptionStatus === "ACTIVE").length, icon: "💳", color: "#F59E0B", bg: "#FFFBEB" },
          ].map((s, i) => (
            <div key={i} style={{ background: "white", borderRadius: "14px", padding: "16px 18px", border: "1px solid #F1F5F9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: "22px", fontWeight: "800", color: "#0F172A", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: "12px", color: "#94A3B8", marginTop: "3px" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search Bar */}
        <div style={{ background: "white", borderRadius: "14px", padding: "14px 18px", marginBottom: "14px", border: "1px solid #F1F5F9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "15px" }}>🔍</span>
            <input value={keyword} onChange={e => setKeyword(e.target.value)}
              placeholder="নাম, email বা phone দিয়ে search করুন..."
              style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "10px", border: "1px solid #E2E8F0", fontSize: "13px", outline: "none", background: "#F8FAFC", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "12px", color: "#94A3B8" }}>দেখাও:</span>
            {[10, 25, 50].map(n => (
              <button key={n} onClick={() => { setSize(n); setPage(0) }}
                style={{ padding: "7px 13px", borderRadius: "8px", border: size === n ? "none" : "1px solid #E2E8F0", background: size === n ? "linear-gradient(135deg,#4F46E5,#7C3AED)" : "white", color: size === n ? "white" : "#64748B", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>{n}</button>
            ))}
          </div>
          <button onClick={() => fetchUsers()}
            style={{ padding: "9px 14px", borderRadius: "10px", border: "1px solid #E2E8F0", background: "white", color: "#64748B", fontSize: "13px", cursor: "pointer" }}>🔄 Refresh</button>
        </div>

        {/* Table */}
        <div style={{ background: "white", borderRadius: "16px", border: "1px solid #F1F5F9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "visible" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1.2fr 1.2fr 1fr 1fr 1fr 56px", padding: "12px 20px", background: "#F8FAFC", borderRadius: "16px 16px 0 0", borderBottom: "1px solid #F1F5F9" }}>
            {["User", "Phone", "Subscription", "Status", "Joined", "Last Login", ""].map((h, i) => (
              <div key={i} style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8", letterSpacing: "0.5px", textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#94A3B8" }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
              Loading...
            </div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#94A3B8" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>😕</div>
              কোনো user পাওয়া যায়নি
            </div>
          ) : (
            users.map((user, index) => (
              <div key={user.id} className="row-hover"
                style={{ display: "grid", gridTemplateColumns: "2.5fr 1.2fr 1.2fr 1fr 1fr 1fr 56px", padding: "13px 20px", borderBottom: index < users.length - 1 ? "1px solid #F8FAFC" : "none", alignItems: "center", position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {avatar(user.fullName, index)}
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#0F172A" }}>{user.fullName}</div>
                    <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "2px" }}>{user.email}</div>
                  </div>
                </div>
                <div style={{ fontSize: "12px", color: "#64748B" }}>{user.phone || "—"}</div>
               <div>{subBadge(user.subscriptionStatus, user.subscriptionPlanName, user.subscriptionExpiry)}</div>
                <div>{statusBadge(user.active)}</div>
                <div style={{ fontSize: "12px", color: "#64748B" }}>{user.createdAt}</div>
                <div style={{ fontSize: "12px", color: "#64748B" }}>{user.lastLoginAt}</div>

                {/* ✅ Action Menu - inline dropdown, overflow: visible */}
                <div data-menu-container style={{ position: "relative" }}>
                  <button className="action-btn"
                    onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                    style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #E2E8F0", background: openMenu === user.id ? "#EEF2FF" : "white", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", color: openMenu === user.id ? "#4F46E5" : "#64748B", transition: "all 0.15s" }}>⋮</button>

                  {openMenu === user.id && (
                    <div style={{ position: "absolute", right: 0, top: "36px", background: "white", borderRadius: "12px", boxShadow: "0 12px 40px rgba(0,0,0,0.18)", border: "1px solid #F1F5F9", zIndex: 999, minWidth: "185px", overflow: "hidden", animation: "fadeUp 0.15s ease" }}>
                      <div className="menu-item" onClick={() => { setViewUser(user); setOpenMenu(null) }}
                        style={{ padding: "11px 16px", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", color: "#0F172A", fontWeight: "500", background: "white" }}>
                        👁 View Profile
                      </div>
                      <div style={{ height: "1px", background: "#F1F5F9" }} />
                      <div className="menu-item" onClick={() => { setGrantSubModal(user); setOpenMenu(null) }}
                        style={{ padding: "11px 16px", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", color: "#4F46E5", fontWeight: "500", background: "white" }}>
                        💳 Grant Subscription
                      </div>
                      <div style={{ height: "1px", background: "#F1F5F9" }} />
                      <div className="menu-item" onClick={() => { setConfirmBlock(user); setOpenMenu(null) }}
                        style={{ padding: "11px 16px", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", color: user.active ? "#EF4444" : "#10B981", fontWeight: "500", background: "white" }}>
                        {user.active ? "🚫 Block User" : "✅ Unblock User"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "16px" }}>
            <div style={{ fontSize: "13px", color: "#94A3B8" }}>
              Page <strong style={{ color: "#0F172A" }}>{page + 1}</strong> / <strong style={{ color: "#0F172A" }}>{totalPages}</strong> — মোট {totalElements} জন
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={() => setPage(0)} disabled={page === 0}
                style={{ padding: "7px 12px", borderRadius: "8px", border: "1px solid #E2E8F0", background: "white", color: page === 0 ? "#CBD5E1" : "#64748B", fontSize: "12px", cursor: page === 0 ? "not-allowed" : "pointer" }}>«</button>
              <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
                style={{ padding: "7px 12px", borderRadius: "8px", border: "1px solid #E2E8F0", background: "white", color: page === 0 ? "#CBD5E1" : "#64748B", fontSize: "12px", cursor: page === 0 ? "not-allowed" : "pointer" }}>‹</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(0, Math.min(totalPages - 5, page - 2)) + i
                return (
                  <button key={p} onClick={() => setPage(p)}
                    style={{ padding: "7px 12px", borderRadius: "8px", border: page === p ? "none" : "1px solid #E2E8F0", background: page === p ? "linear-gradient(135deg,#4F46E5,#7C3AED)" : "white", color: page === p ? "white" : "#64748B", fontSize: "12px", cursor: "pointer", fontWeight: page === p ? "700" : "500" }}>{p + 1}</button>
                )
              })}
              <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
                style={{ padding: "7px 12px", borderRadius: "8px", border: "1px solid #E2E8F0", background: "white", color: page >= totalPages - 1 ? "#CBD5E1" : "#64748B", fontSize: "12px", cursor: page >= totalPages - 1 ? "not-allowed" : "pointer" }}>›</button>
              <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}
                style={{ padding: "7px 12px", borderRadius: "8px", border: "1px solid #E2E8F0", background: "white", color: page >= totalPages - 1 ? "#CBD5E1" : "#64748B", fontSize: "12px", cursor: page >= totalPages - 1 ? "not-allowed" : "pointer" }}>»</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
