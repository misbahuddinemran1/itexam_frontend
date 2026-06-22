import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { dark, toggle } = useTheme()
  return (
    <button onClick={toggle}
      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
      {dark
        ? <Sun size={18} className="text-amber-400" />
        : <Moon size={18} className="text-slate-600" />}
    </button>
  )
}
