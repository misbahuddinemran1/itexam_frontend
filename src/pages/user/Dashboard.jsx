import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axiosInstance'
import { BarChart2, Flame, Trophy, BookOpen, TrendingUp, AlertCircle, Play, Loader2, Bell } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [dRes, aRes, nRes] = await Promise.allSettled([
          api.get(`/api/v1/api/dashboard/${user.userId}?userName=${encodeURIComponent(user.userName || '')}`),
          api.get(`/api/v1/api/analytics/${user.userId}`),
          api.get(`/api/v1/api/notifications/${user.userId}`)
        ])
        if (dRes.status === 'fulfilled') setData(dRes.value.data)
        if (aRes.status === 'fulfilled') setAnalytics(aRes.value.data)
        if (nRes.status === 'fulfilled') setNotifications(nRes.value.data?.notifications || [])
      } catch {}
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 size={36} className="animate-spin text-primary-500" />
    </div>
  )

  const stats = [
    { label: 'মোট পরীক্ষা', value: data?.totalExams ?? '—', icon: <BookOpen size={20} />, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'গড় স্কোর', value: data?.averageScore ? `${data.averageScore}%` : '—', icon: <BarChart2 size={20} />, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'স্ট্রিক', value: data?.currentStreak ? `${data.currentStreak} দিন` : '—', icon: <Flame size={20} />, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'র‍্যাংক', value: data?.rank ? `#${data.rank}` : '—', icon: <Trophy size={20} />, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-fade-in">

      {/* Welcome Banner */}
      <div className="card bg-gradient-to-r from-primary-600 to-indigo-700 border-0 text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-primary-200 text-sm font-medium mb-1">স্বাগতম,</p>
            <h1 className="text-2xl font-bold">{user.userName || 'Student'} 👋</h1>
            <p className="text-primary-200 text-sm mt-1">আজকে কি পরীক্ষা দেবেন?</p>
          </div>
          <button onClick={() => navigate('/exam')}
            className="flex items-center gap-2 bg-white text-primary-700 font-bold px-6 py-3 rounded-xl hover:bg-primary-50 active:scale-95 transition-all shadow-lg whitespace-nowrap">
            <Play size={18} fill="currentColor" />
            Exam দিন
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="card flex items-center gap-3 p-4">
            <div className={`p-2.5 rounded-xl ${s.bg} ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-xl font-bold text-slate-800 dark:text-white">{s.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Exams */}
        <div className="card lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-primary-500" />
            <h2 className="font-semibold text-slate-800 dark:text-white">সাম্প্রতিক পরীক্ষা</h2>
          </div>
          {data?.recentExams?.length > 0 ? (
            <div className="space-y-2">
              {data.recentExams.map((ex, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{ex.examTitle || `পরীক্ষা #${i + 1}`}</p>
                    <p className="text-xs text-slate-400">{ex.date || ''}</p>
                  </div>
                  <span className={`badge ${ex.score >= 60 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {ex.score ?? '—'}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400">
              <BookOpen size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">এখনো কোনো পরীক্ষা দেননি</p>
            </div>
          )}
        </div>

        {/* Weak Areas + Notifications */}
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={16} className="text-amber-500" />
              <h2 className="font-semibold text-slate-800 dark:text-white text-sm">দুর্বল বিষয়</h2>
            </div>
            {analytics?.weakAreas?.length > 0 ? (
              <div className="space-y-2">
                {analytics.weakAreas.slice(0, 4).map((area, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-300">{area.topic || area}</span>
                    {area.accuracy !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${area.accuracy}%` }} />
                        </div>
                        <span className="text-xs text-slate-400">{area.accuracy}%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">তথ্য পাওয়া যাচ্ছে না</p>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <Bell size={16} className="text-primary-500" />
                <h2 className="font-semibold text-slate-800 dark:text-white text-sm">নোটিফিকেশন</h2>
              </div>
              <div className="space-y-2">
                {notifications.slice(0, 3).map((n, i) => (
                  <div key={i} className="text-xs text-slate-600 dark:text-slate-300 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                    {n.message || n}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
