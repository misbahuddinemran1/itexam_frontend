import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../../../api/axiosInstance'
import { Clock, SkipForward, Loader2, AlertCircle, RotateCcw, CheckSquare, Flag, Calculator, X, AlertTriangle, ArrowRightLeft } from 'lucide-react'

const EXAM_DURATION = 10 * 60

export default function ExamPlay() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const sessionId = state?.sessionId

  const [question, setQuestion] = useState(null)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [selectedOption, setSelectedOption] = useState(null)
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [examDone, setExamDone] = useState(false)
  const [error, setError] = useState('')

  // Skip এবং Review — দুটোই এখন answerable, পার্থক্য শুধু category/list
  const [skippedQuestions, setSkippedQuestions] = useState([])
  const [reviewQuestions, setReviewQuestions] = useState([])

  const [showSkipPanel, setShowSkipPanel] = useState(false)
  const [showReviewPanel, setShowReviewPanel] = useState(false)
  const [panelOrigin, setPanelOrigin] = useState('header') // 'header' | 'final'
  const [showFinalConfirm, setShowFinalConfirm] = useState(false)

  const [expandedQId, setExpandedQId] = useState(null)
  const [answeringQId, setAnsweringQId] = useState(null)
  const [panelSelectedOption, setPanelSelectedOption] = useState({})
  const [movingQId, setMovingQId] = useState(null)

  const [tabWarning, setTabWarning] = useState(false)
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [showCalculator, setShowCalculator] = useState(false)
  const [calcInput, setCalcInput] = useState('')

  const questionStartTime = useRef(Date.now())

  // Timer
  useEffect(() => {
    if (examDone) return
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(interval); finishExam(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [examDone])

  // Tab-switch / window-blur detection (anti-cheat warning)
  useEffect(() => {
    if (examDone) return
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1)
        setTabWarning(true)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [examDone])

  const fetchQuestion = useCallback(async () => {
    setLoading(true)
    setError('')
    setSelectedOption(null)
    setShowSkipPanel(false)
    setShowReviewPanel(false)
    questionStartTime.current = Date.now()
    try {
      const res = await api.get(`/api/v1/api/exam/${sessionId}/next-question`)
      if (res.data?.done || res.data?.finished) { finishExam(); return }
      setQuestion(res.data)
      setProgress({ current: res.data.questionNumber, total: res.data.totalQuestions })
    } catch (err) {
      // ফলব্যাক সেফটি নেট — স্বাভাবিকভাবে এখানে আসার কথা না
      if (err.response?.status === 400 || err.response?.status === 404 || err.response?.data?.done) {
        finishExam()
      } else {
        setError('প্রশ্ন লোড করতে সমস্যা হয়েছে।')
      }
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    if (!sessionId) { navigate('/exam'); return }
    fetchQuestion()
  }, [sessionId])

  const finishExam = async () => {
    setExamDone(true)
    try {
      const res = await api.post(`/api/v1/api/exam/${sessionId}/finish`)
      navigate(`/exam/result/${sessionId}`, { state: { result: res.data } })
    } catch {
      navigate(`/exam/result/${sessionId}`)
    }
  }

  // action: 'answer' | 'skip' | 'review'
  const submitAnswer = async (optionId, action = 'answer') => {
    if (submitting) return
    setSubmitting(true)
    if (action === 'answer') setSelectedOption(optionId)
    const timeSpent = Math.round((Date.now() - questionStartTime.current) / 1000)
    const isLastQuestion = progress.total > 0 && progress.current >= progress.total

    try {
      await api.post(`/api/v1/api/exam/${sessionId}/submit-answer`, {
        questionId: question.questionId,
        selectedOptionId: action === 'answer' ? optionId : null,
        isSkipped: action !== 'answer',
        timeSpentSec: timeSpent
      })

      if (action === 'skip') setSkippedQuestions(prev => [...prev, question])
      if (action === 'review') setReviewQuestions(prev => [...prev, question])

      if (isLastQuestion) {
        setShowFinalConfirm(true)
      } else {
        fetchQuestion()
      }
    } catch {
      setError('উত্তর জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
      setSelectedOption(null)
    } finally {
      setSubmitting(false)
    }
  }

  // Skip/Review panel থেকে কোনো marked প্রশ্নের real answer submit করার জন্য
  const submitPanelAnswer = async (panelQ, optionId, listSetter) => {
    if (answeringQId) return
    setAnsweringQId(panelQ.questionId)
    setPanelSelectedOption(prev => ({ ...prev, [panelQ.questionId]: optionId }))
    try {
      await api.post(`/api/v1/api/exam/${sessionId}/submit-answer`, {
        questionId: panelQ.questionId,
        selectedOptionId: optionId,
        isSkipped: false,
        timeSpentSec: 0
      })
      listSetter(prev => prev.filter(q => q.questionId !== panelQ.questionId))
      setExpandedQId(null)
    } catch {
      setError('উত্তর জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
    } finally {
      setAnsweringQId(null)
    }
  }

  // Skip ⇄ Review এর মধ্যে কোনো প্রশ্ন move করা (category পরিবর্তন, answer status অপরিবর্তিত — isSkipped:true থেকেই যায়)
  const moveQuestion = (q, fromSetter, toSetter) => {
    if (movingQId) return
    setMovingQId(q.questionId)
    fromSetter(prev => prev.filter(item => item.questionId !== q.questionId))
    toSetter(prev => [...prev, q])
    setExpandedQId(null)
    setMovingQId(null)
  }

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const openSkipPanel = (origin = 'header') => {
    setPanelOrigin(origin)
    setShowReviewPanel(false)
    setShowFinalConfirm(false)
    setShowSkipPanel(true)
  }

  const openReviewPanel = (origin = 'header') => {
    setPanelOrigin(origin)
    setShowSkipPanel(false)
    setShowFinalConfirm(false)
    setShowReviewPanel(true)
  }

  const closePanel = () => {
    setShowSkipPanel(false)
    setShowReviewPanel(false)
    setExpandedQId(null)
    if (panelOrigin === 'final') setShowFinalConfirm(true)
  }

  const toggleExpand = (qId) => {
    setExpandedQId(prev => prev === qId ? null : qId)
  }

  // সাধারণ calculator logic
  const calcPress = (val) => {
    if (val === 'C') return setCalcInput('')
    if (val === '=') {
      try {
        // eslint-disable-next-line no-eval
        const result = eval(calcInput.replace(/×/g, '*').replace(/÷/g, '/'))
        setCalcInput(String(result))
      } catch {
        setCalcInput('Error')
      }
      return
    }
    setCalcInput(prev => prev + val)
  }

  const timerColor = timeLeft < 60 ? 'text-red-500' : timeLeft < 180 ? 'text-amber-500' : 'text-emerald-500'
  const progressPct = progress.total > 0 ? (progress.current / progress.total) * 100 : 0
  const inPanelOrFinal = showSkipPanel || showReviewPanel || showFinalConfirm

  const finalAnswered = progress.total - skippedQuestions.length - reviewQuestions.length
  const finalSkipped = skippedQuestions.length
  const finalReview = reviewQuestions.length

  if (!sessionId) return null

  // রিইউজেবল প্যানেল-কার্ড রেন্ডারার — Skip ও Review panel এখন একই রকম কাজ করে (answerable + move)
  const renderPanelQuestionCard = (q, i, { listSetter, otherSetter, accentClass, moveLabel, moveIcon: MoveIcon }) => {
    const isExpanded = expandedQId === q.questionId
    const isAnswering = answeringQId === q.questionId
    return (
      <div key={q.questionId} className={`rounded-xl ${accentClass.bg} border ${accentClass.border} overflow-hidden`}>
        <div className="p-3 cursor-pointer" onClick={() => toggleExpand(q.questionId)}>
          <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">
            <span className={`text-xs ${accentClass.numberText} font-bold mr-2`}>#{i + 1}</span>
            {q.questionText}
          </p>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-xs text-primary-500 font-semibold">
              {isExpanded ? 'বন্ধ করুন ▲' : 'উত্তর দিন ▼'}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); moveQuestion(q, listSetter, otherSetter) }}
              disabled={movingQId === q.questionId}
              className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 px-2 py-1 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors disabled:opacity-50"
            >
              <MoveIcon size={12} /> {moveLabel}
            </button>
          </div>
        </div>
        {isExpanded && (
          <div className="px-3 pb-3 space-y-2">
            {q.options?.map(opt => (
              <button key={opt.optionId}
                onClick={() => submitPanelAnswer(q, opt.optionId, listSetter)}
                disabled={isAnswering}
                className={`option-btn ${panelSelectedOption[q.questionId] === opt.optionId ? 'selected' : ''} ${isAnswering ? 'opacity-60 cursor-not-allowed' : ''}`}>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-current mr-3 text-xs font-bold flex-shrink-0">
                  {isAnswering && panelSelectedOption[q.questionId] === opt.optionId
                    ? <Loader2 size={12} className="animate-spin" />
                    : opt.optionKey}
                </span>
                {opt.optionText}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in relative">

      {/* Tab-switch Warning Toast */}
      {tabWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] animate-slide-up">
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl px-4 py-3 shadow-lg max-w-sm">
            <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-700 dark:text-red-300">
              আপনি exam ট্যাব থেকে বের হয়েছিলেন ({tabSwitchCount} বার)। এটি record হয়েছে।
            </p>
            <button onClick={() => setTabWarning(false)} className="flex-shrink-0 text-red-400 hover:text-red-600">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Calculator Floating Button */}
      <button
        onClick={() => setShowCalculator(true)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-lg flex items-center justify-center transition-colors"
      >
        <Calculator size={20} />
      </button>

      {/* Calculator Popup */}
      {showCalculator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="card max-w-xs w-full animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Calculator size={16} /> ক্যালকুলেটর
              </h3>
              <button onClick={() => setShowCalculator(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <input
              value={calcInput}
              readOnly
              className="w-full mb-3 px-3 py-2 text-right text-lg font-mono rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white"
              placeholder="0"
            />
            <div className="grid grid-cols-4 gap-2">
              {['7','8','9','÷','4','5','6','×','1','2','3','-','C','0','=','+'].map(btn => (
                <button
                  key={btn}
                  onClick={() => calcPress(btn)}
                  className={`py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    btn === '=' ? 'bg-primary-500 hover:bg-primary-600 text-white' :
                    btn === 'C' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200' :
                    'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timer + Progress */}
      <div className="card mb-4 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            প্রশ্ন {progress.current} / {progress.total}
          </span>
          <div className="flex items-center gap-2">
            {skippedQuestions.length > 0 && !inPanelOrFinal && (
              <button
                onClick={() => openSkipPanel('header')}
                className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-600"
              >
                <SkipForward size={12} /> Skip: {skippedQuestions.length}
              </button>
            )}
            {reviewQuestions.length > 0 && !inPanelOrFinal && (
              <button
                onClick={() => openReviewPanel('header')}
                className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-700"
              >
                <Flag size={12} /> Review: {reviewQuestions.length}
              </button>
            )}
            <div className={`flex items-center gap-1.5 font-mono font-bold text-lg ${timerColor} ${timeLeft < 60 ? 'timer-warning' : ''}`}>
              <Clock size={18} />{formatTime(timeLeft)}
            </div>
          </div>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Skip Panel — এখন answerable, এবং Review এ move করা যায় */}
      {showSkipPanel && (
        <div className="card animate-slide-up">
          <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
            <SkipForward size={18} className="text-slate-400" />
            Skip করা প্রশ্নসমূহ ({skippedQuestions.length}টি)
          </h2>
          <div className="space-y-3 mb-5">
            {skippedQuestions.map((q, i) => renderPanelQuestionCard(q, i, {
              listSetter: setSkippedQuestions,
              otherSetter: setReviewQuestions,
              accentClass: {
                bg: 'bg-slate-50 dark:bg-slate-700/30',
                border: 'border-slate-200 dark:border-slate-600',
                numberText: 'text-slate-400'
              },
              moveLabel: 'Review এ নিন',
              moveIcon: Flag
            }))}
            {skippedQuestions.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-4">সব skip করা প্রশ্নের উত্তর দেওয়া হয়েছে 🎉</p>
            )}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 text-center">
            প্রশ্নে ক্লিক করে উত্তর দিতে পারবেন, বা Review তালিকায় নিতে পারবেন।
          </p>
          <div className="flex gap-3">
            <button onClick={closePanel} className="btn-outline flex-1 flex items-center justify-center gap-2">
              <RotateCcw size={15} /> ফিরে যান
            </button>
            <button onClick={finishExam} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <CheckSquare size={15} /> Submit করুন
            </button>
          </div>
        </div>
      )}

      {/* Review Panel — answerable, এবং Skip এ move করা যায় */}
      {showReviewPanel && (
        <div className="card animate-slide-up">
          <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
            <Flag size={18} className="text-amber-500" />
            Review এর জন্য চিহ্নিত প্রশ্ন ({reviewQuestions.length}টি)
          </h2>
          <div className="space-y-3 mb-5">
            {reviewQuestions.map((q, i) => renderPanelQuestionCard(q, i, {
              listSetter: setReviewQuestions,
              otherSetter: setSkippedQuestions,
              accentClass: {
                bg: 'bg-amber-50 dark:bg-amber-900/20',
                border: 'border-amber-200 dark:border-amber-700',
                numberText: 'text-amber-500'
              },
              moveLabel: 'Skip এ নিন',
              moveIcon: SkipForward
            }))}
            {reviewQuestions.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-4">সব review প্রশ্নের উত্তর দেওয়া হয়েছে 🎉</p>
            )}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 text-center">
            প্রশ্নে ক্লিক করে উত্তর দিতে পারবেন, বা Skip তালিকায় নিতে পারবেন।
          </p>
          <div className="flex gap-3">
            <button onClick={closePanel} className="btn-outline flex-1 flex items-center justify-center gap-2">
              <RotateCcw size={15} /> ফিরে যান
            </button>
            <button onClick={finishExam} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <CheckSquare size={15} /> Submit করুন
            </button>
          </div>
        </div>
      )}

      {/* Question Card */}
      {!showSkipPanel && !showReviewPanel && !showFinalConfirm && (
        <div className="card animate-slide-up">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 size={32} className="animate-spin text-primary-500" />
              <p className="text-slate-400 text-sm">প্রশ্ন লোড হচ্ছে...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-10 gap-3 text-red-500">
              <AlertCircle size={32} />
              <p className="text-sm">{error}</p>
              <button onClick={fetchQuestion} className="btn-outline text-sm">আবার চেষ্টা করুন</button>
            </div>
          ) : question ? (
            <>
              <div className="mb-6">
                <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 mb-3">
                  প্রশ্ন {question.questionNumber}
                </span>
                <h2 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white leading-relaxed">
                  {question.questionText}
                </h2>
              </div>

              <div className="space-y-3 mb-6">
                {question.options?.map(opt => (
                  <button key={opt.optionId}
                    onClick={() => submitAnswer(opt.optionId, 'answer')}
                    disabled={submitting}
                    className={`option-btn ${selectedOption === opt.optionId ? 'selected' : ''} ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-current mr-3 text-xs font-bold flex-shrink-0">
                      {submitting && selectedOption === opt.optionId
                        ? <Loader2 size={12} className="animate-spin" />
                        : opt.optionKey}
                    </span>
                    {opt.optionText}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3">
                <button onClick={() => submitAnswer(null, 'skip')} disabled={submitting}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">
                  <SkipForward size={16} /> Skip
                </button>
                <button onClick={() => submitAnswer(null, 'review')} disabled={submitting}
                  className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 hover:text-amber-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-50">
                  <Flag size={16} /> Review এর জন্য রাখুন
                </button>
              </div>
              {submitting && (
                <p className="text-center text-xs text-slate-400 mt-2 flex items-center justify-center gap-1.5">
                  <Loader2 size={13} className="animate-spin" /> Submit হচ্ছে...
                </p>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* Final Submit Confirmation Popup */}
      {showFinalConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="card max-w-sm w-full text-center animate-slide-up">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <CheckSquare size={26} className="text-primary-500" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-1">পরীক্ষা সম্পন্ন!</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Submit করার আগে নিচের তথ্যগুলো দেখে নিন</p>

            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{finalAnswered}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">উত্তর দেওয়া</p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{finalReview}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Review এর জন্য</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600">
                <p className="text-xl font-bold text-slate-500 dark:text-slate-300">{finalSkipped}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Skip করা</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-5">মোট প্রশ্ন: {progress.total}টি</p>

            <div className="flex flex-col gap-2">
              {finalReview > 0 && (
                <button onClick={() => openReviewPanel('final')} className="btn-outline w-full flex items-center justify-center gap-2">
                  <Flag size={15} /> Review করা প্রশ্নগুলো দেখুন
                </button>
              )}
              {finalSkipped > 0 && (
                <button onClick={() => openSkipPanel('final')} className="btn-outline w-full flex items-center justify-center gap-2">
                  <SkipForward size={15} /> Skip করা প্রশ্নগুলো দেখুন
                </button>
              )}
              <button onClick={finishExam} className="btn-primary w-full flex items-center justify-center gap-2">
                <CheckSquare size={15} /> ফাইনাল সাবমিট করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}