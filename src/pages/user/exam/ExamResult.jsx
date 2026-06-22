import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import api from '../../../api/axiosInstance'
import { CheckCircle2, XCircle, MinusCircle, Trophy, RotateCcw, LayoutDashboard, Loader2, Sparkles, X, ChevronDown, ChevronUp } from 'lucide-react'

function AIExplanationInline({ question, explanation }) {
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiLoaded, setAiLoaded] = useState(false)

  const loadAI = async () => {
    setAiLoading(true)
    try {
      const res = await api.post('/api/v1/api/ai/explain-answer', {
        questionId: question.questionId,
        questionText: question.questionText,
        options: []
      })
      setAiText(res.data?.explanation || res.data?.message || 'AI ব্যাখ্যা পাওয়া যায়নি।')
      setAiLoaded(true)
    } catch {
      setAiText('AI explanation লোড করতে সমস্যা হয়েছে।')
      setAiLoaded(true)
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="mt-3">
      {!aiLoaded ? (
        <button onClick={loadAI} disabled={aiLoading}
          className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors disabled:opacity-60">
          {aiLoading
            ? <><Loader2 size={13} className="animate-spin" /> AI বিশ্লেষণ করছে...</>
            : <><Sparkles size={13} /> AI দিয়ে আরো জানুন</>}
        </button>
      ) : (
        <div className="mt-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-1 mb-1">
            <Sparkles size={12} className="text-amber-500" />
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">AI ব্যাখ্যা</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{aiText}</p>
        </div>
      )}
    </div>
  )
}

function QuestionReviewCard({ a, index }) {
  const [expanded, setExpanded] = useState(false)

  const borderColor = a.skipped ? 'border-slate-300 dark:border-slate-600'
    : a.correct ? 'border-emerald-400'
    : 'border-red-400'

  const bgColor = a.skipped ? 'bg-slate-50 dark:bg-slate-700/30'
    : a.correct ? 'bg-emerald-50 dark:bg-emerald-900/20'
    : 'bg-red-50 dark:bg-red-900/20'

  return (
    <div className={`rounded-xl border-l-4 ${borderColor} ${bgColor} overflow-hidden`}>
      <div className="flex items-start gap-3 p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex-shrink-0 mt-0.5">
          {a.skipped ? <MinusCircle size={18} className="text-slate-400" />
            : a.correct ? <CheckCircle2 size={18} className="text-emerald-500" />
            : <XCircle size={18} className="text-red-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
            <span className="text-xs text-slate-400 mr-2">#{index + 1}</span>
            {a.questionText}
          </p>
        </div>
        <div className="flex-shrink-0">
          {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {a.skipped ? (
            <p className="text-xs text-slate-400 italic">এই প্রশ্নটি skip করা হয়েছে।</p>
          ) : (
            <>
              <div className={`flex items-center gap-2 p-2 rounded-lg ${a.correct ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                <span className="text-xs font-semibold text-slate-500">আপনার উত্তর:</span>
                <span className={`text-xs font-bold ${a.correct ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                  {a.selectedOptionText || '—'}
                </span>
                {a.correct ? <span className="ml-auto text-emerald-500">✓</span> : <span className="ml-auto text-red-500">✗</span>}
              </div>

              {!a.correct && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <span className="text-xs font-semibold text-slate-500">সঠিক উত্তর:</span>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    {a.correctOptionText || '—'}
                  </span>
                  <span className="ml-auto text-emerald-500">✓</span>
                </div>
              )}

              {a.explanation && (
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 block mb-1">📖 ব্যাখ্যা</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{a.explanation}</p>
                </div>
              )}

              <AIExplanationInline question={a} explanation={a.explanation} />
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function ExamResult() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (state?.result) {
      setResult(state.result)
      setLoading(false)
      return
    }
    api.get(`/api/v1/api/exam/${sessionId}/progress`)
      .then(res => setResult(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [sessionId])

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 size={36} className="animate-spin text-primary-500" />
    </div>
  )

  if (!result) return (
    <div className="max-w-lg mx-auto px-4 py-10 text-center">
      <p className="text-slate-500">Result লোড করতে সমস্যা হয়েছে।</p>
      <button onClick={() => navigate('/exam')} className="btn-primary mt-4">Exam এ যান</button>
    </div>
  )

  const { totalQuestions, correctCount, wrongCount, skipCount, percentage, questionReviews } = result
  const pct = Math.round(percentage ?? 0)
  const grade = pct >= 80 ? { label: 'অসাধারণ! 🎉', color: 'text-emerald-500' }
    : pct >= 60 ? { label: 'ভালো! 👍', color: 'text-blue-500' }
    : pct >= 40 ? { label: 'চেষ্টা করুন 💪', color: 'text-amber-500' }
    : { label: 'আরো পড়ুন 📚', color: 'text-red-500' }

  const circleCircumference = 2 * Math.PI * 54
  const dashOffset = circleCircumference * (1 - pct / 100)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 animate-fade-in">

      {/* Score Card */}
      <div className="card text-center">
        <h1 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4">পরীক্ষার ফলাফল</h1>
        <div className="flex justify-center mb-4">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor"
                className="text-slate-100 dark:text-slate-700" strokeWidth="10" />
              <circle cx="60" cy="60" r="54" fill="none"
                stroke="url(#scoreGrad)" strokeWidth="10" strokeLinecap="round"
                strokeDasharray={circleCircumference} strokeDashoffset={dashOffset}
                className="transition-all duration-1000" />
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-slate-800 dark:text-white">{pct}%</span>
              <span className={`text-xs font-semibold ${grade.color}`}>{grade.label}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-5">
          {[
            { icon: <CheckCircle2 size={18} className="text-emerald-500" />, val: correctCount ?? 0, label: 'সঠিক', color: 'text-emerald-600 dark:text-emerald-400' },
            { icon: <XCircle size={18} className="text-red-500" />, val: wrongCount ?? 0, label: 'ভুল', color: 'text-red-600 dark:text-red-400' },
            { icon: <MinusCircle size={18} className="text-slate-400" />, val: skipCount ?? 0, label: 'Skip', color: 'text-slate-500' },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
              {s.icon}
              <span className={`text-xl font-bold mt-1 ${s.color}`}>{s.val}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500">{s.label}</span>
            </div>
          ))}
        </div>

<div className="mb-5 py-3 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
  <p className="text-sm text-slate-600 dark:text-slate-300">
    প্রাপ্ত স্কোর:
    <span className="font-bold text-indigo-700 dark:text-indigo-300 ml-2">
      {result.score?.toFixed(1)} / {totalQuestions}
    </span>
    <span className="text-xs text-slate-400 ml-2">(সঠিক: +১, ভুল: -০.৫, Skip: ০)</span>
  </p>
</div>

        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={() => navigate('/dashboard')} className="btn-outline flex items-center gap-2">
            <LayoutDashboard size={16} /> Dashboard
          </button>
          <button onClick={() => navigate('/exam')} className="btn-primary flex items-center gap-2">
            <RotateCcw size={16} /> আবার পরীক্ষা দিন
          </button>
        </div>
      </div>

      {/* Question Review */}
      {questionReviews?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Trophy size={17} className="text-amber-500" />
            প্রশ্ন পর্যালোচনা
            <span className="text-xs text-slate-400 font-normal ml-1">(click করে বিস্তারিত দেখুন)</span>
          </h2>
          <div className="space-y-3">
            {questionReviews.map((a, i) => (
              <QuestionReviewCard key={i} a={a} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}