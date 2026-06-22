import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../api/axiosInstance'
import {
  Play, Lock, BookOpen, Layers, Tag,
  Calendar, PenLine, Loader2, ChevronRight
} from 'lucide-react'

const EXAM_TYPES = [
  {
    id: 'free',
    icon: <Play size={24} />,
    title: 'Free Exam',
    titleBn: 'ফ্রি পরীক্ষা',
    desc: 'যেকোনো সময় দিন, সব topic মিলিয়ে',
    color: 'from-primary-500 to-indigo-600',
    bg: 'bg-primary-50 dark:bg-primary-900/20',
    iconColor: 'text-primary-600 dark:text-primary-400',
    available: true,
  },
  {
    id: 'subject',
    icon: <BookOpen size={24} />,
    title: 'Subject Exam',
    titleBn: 'বিষয়ভিত্তিক পরীক্ষা',
    desc: 'নির্দিষ্ট subject এর উপর পরীক্ষা',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    available: false,
  },
  {
    id: 'chapter',
    icon: <Layers size={24} />,
    title: 'Chapter Exam',
    titleBn: 'অধ্যায়ভিত্তিক পরীক্ষা',
    desc: 'নির্দিষ্ট chapter এর উপর পরীক্ষা',
    color: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
    available: false,
  },
  {
    id: 'topic',
    icon: <Tag size={24} />,
    title: 'Topic Exam',
    titleBn: 'টপিকভিত্তিক পরীক্ষা',
    desc: 'নির্দিষ্ট topic এর উপর পরীক্ষা',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    iconColor: 'text-violet-600 dark:text-violet-400',
    available: false,
  },
  {
    id: 'weekly',
    icon: <Calendar size={24} />,
    title: 'Weekly Exam',
    titleBn: 'সাপ্তাহিক পরীক্ষা',
    desc: 'প্রতি সপ্তাহে নির্ধারিত পরীক্ষা',
    color: 'from-orange-500 to-amber-600',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    iconColor: 'text-orange-600 dark:text-orange-400',
    available: false,
  },
  {
    id: 'written',
    icon: <PenLine size={24} />,
    title: 'Written Exam',
    titleBn: 'লিখিত পরীক্ষা',
    desc: 'লিখিত প্রশ্নের উপর পরীক্ষা',
    color: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    iconColor: 'text-rose-600 dark:text-rose-400',
    available: false,
  },
]

export default function ExamHome() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [starting, setStarting] = useState(false)

 const startFreeExam = async () => {
     setStarting(true)
     try {
       const res = await api.get(`/api/v1/api/exam/free-exam/start?userId=${user.userId}`)
       navigate('/exam/play', { state: { sessionId: res.data.sessionId } })
     } catch {
       alert('পরীক্ষা শুরু করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
     } finally {
       setStarting(false)
     }
   }

  const handleClick = (type) => {
    if (!type.available) return
    if (type.id === 'free') startFreeExam()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">পরীক্ষা দিন</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          আপনার পছন্দ অনুযায়ী পরীক্ষার ধরন বেছে নিন
        </p>
      </div>

      {/* Exam Type Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {EXAM_TYPES.map(type => (
          <div key={type.id}
            onClick={() => handleClick(type)}
            className={`relative card p-5 transition-all duration-200
              ${type.available
                ? 'cursor-pointer hover:shadow-md hover:-translate-y-1 active:scale-[0.98]'
                : 'opacity-60 cursor-not-allowed'
              }`}>

            {/* Coming Soon Badge */}
            {!type.available && (
              <div className="absolute top-3 right-3">
                <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px]">
                  শীঘ্রই আসছে
                </span>
              </div>
            )}

            {/* Icon */}
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${type.bg} ${type.iconColor} mb-4`}>
              {type.icon}
            </div>

            {/* Text */}
            <h3 className="font-bold text-slate-800 dark:text-white mb-1">{type.titleBn}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{type.desc}</p>

            {/* Bottom */}
            {type.available ? (
              <div className={`flex items-center justify-between`}>
                <span className="badge bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                  ✓ উপলব্ধ
                </span>
                <div className={`flex items-center gap-1 text-xs font-semibold bg-gradient-to-r ${type.color} bg-clip-text text-transparent`}>
                  {starting ? (
                    <Loader2 size={14} className="animate-spin text-primary-500" />
                  ) : (
                    <>শুরু করুন <ChevronRight size={14} className="text-primary-500" /></>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Lock size={12} />
                Admin দ্বারা নিয়ন্ত্রিত
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
        <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
          💡 Subject, Chapter, Topic, Weekly ও Written পরীক্ষা শীঘ্রই আসছে।
          Admin panel থেকে schedule ও criteria নির্ধারণ করা যাবে।
        </p>
      </div>
    </div>
  )
}
