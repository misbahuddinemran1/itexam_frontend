import { useState } from 'react'
import { X, Sparkles, Loader2 } from 'lucide-react'
import api from '../api/axiosInstance'

export default function AIExplanationModal({ question, explanation, onClose }) {
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiLoaded, setAiLoaded] = useState(false)

  const loadAI = async () => {
    setAiLoading(true)
    try {
      const res = await api.post('/api/v1/api/ai/explain-answer', {
        questionId: question.questionId,
        questionText: question.questionText,
        options: question.options,
        selectedOptionId: question.selectedOptionId
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg card animate-slide-up max-h-[80vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Sparkles size={16} className="text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">ব্যাখ্যা</h3>
              <p className="text-xs text-slate-400">সঠিক উত্তরের বিবরণ</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
            <X size={18} />
          </button>
        </div>

        {/* Question */}
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 mb-4">
          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
            {question.questionText}
          </p>
        </div>

        {/* DB Explanation */}
        <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap min-h-[60px] mb-4">
          {explanation || 'এই প্রশ্নের ব্যাখ্যা এখনো যোগ করা হয়নি।'}
        </div>

        {/* AI Section */}
        {!aiLoaded ? (
          <button
            onClick={loadAI}
            disabled={aiLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 text-sm font-medium hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-60 mb-4"
          >
            {aiLoading ? (
              <><Loader2 size={15} className="animate-spin" /> AI বিশ্লেষণ করছে...</>
            ) : (
              <><Sparkles size={15} /> AI দিয়ে আরো জানুন</>
            )}
          </button>
        ) : (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={13} className="text-amber-500" />
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">AI ব্যাখ্যা</span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {aiText}
            </p>
          </div>
        )}

        <button onClick={onClose} className="btn-primary w-full">বুঝেছি ✓</button>
      </div>
    </div>
  )
}