import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'
import { LayoutDashboard, Trophy, LogOut, BookOpen, FlaskConical } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = () => { logout(); navigate('/login') }

  if (!user) return null

  const navLink = (to, icon, label) => (
    <Link to={to}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${pathname.startsWith(to)
          ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
      {icon}{label}
    </Link>
  )

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <BookOpen size={16} className="text-white" />
          </div>
          <span className="font-bold text-slate-800 dark:text-white tracking-tight">ExamBD</span>
        </Link>

        <div className="hidden sm:flex items-center gap-1">
          {navLink('/dashboard', <LayoutDashboard size={15} />, 'Dashboard')}
          {navLink('/exam', <FlaskConical size={15} />, 'Exam')}
          {navLink('/leaderboard', <Trophy size={15} />, 'Leaderboard')}
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 font-medium">
            {user.userName || user.email}
          </span>
          <ThemeToggle />
          <button onClick={handleLogout}
            className="p-2 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </nav>
  )
}
