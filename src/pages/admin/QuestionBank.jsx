import { useEffect, useState } from "react"
import axios from "axios"

const API = "http://localhost:8080/api/v1"

const statusColors = {
  APPROVED: { bg: "#ECFDF5", color: "#10B981" },
  DRAFT: { bg: "#F8FAFC", color: "#64748B" },
  UNDER_REVIEW: { bg: "#FFFBEB", color: "#F59E0B" },
  REJECTED: { bg: "#FEF2F2", color: "#EF4444" },
  ARCHIVED: { bg: "#F5F3FF", color: "#8B5CF6" },
}

const difficultyLabel = { 1: "Easy", 2: "Medium", 3: "Hard", 4: "Expert", 5: "Master" }
const difficultyColor = { 1: "#10B981", 2: "#F59E0B", 3: "#EF4444", 4: "#8B5CF6", 5: "#0F172A" }

const defaultForm = {
  questionText: "",
  subjectId: "",
  chapterId: "",
  topicId: "",
  difficultyLevel: 1,
  questionType: "MCQ_SINGLE",
  language: "EN",
  yearAppeared: "",
  sourceReference: "",
  options: [
    { optionKey: "A", optionText: "", isCorrect: false, explanation: "" },
    { optionKey: "B", optionText: "", isCorrect: false, explanation: "" },
    { optionKey: "C", optionText: "", isCorrect: false, explanation: "" },
    { optionKey: "D", optionText: "", isCorrect: false, explanation: "" },
  ]
}

export default function QuestionBank({ token }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState({
    status: "",
    keyword: "",
    subjectId: "",
    chapterId: "",
    topicId: ""
  })
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [actionLoading, setActionLoading] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [subjects, setSubjects] = useState([])
  const [topics, setTopics] = useState([])
  const [chapters, setChapters] = useState([])
  const [filterChapters, setFilterChapters] = useState([])
  const [filterTopics, setFilterTopics] = useState([])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [editing, setEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchQuestions()
  }, [
    page,
    filter.status,
    filter.subjectId,
    filter.chapterId,
    filter.topicId
  ])
  useEffect(() => { fetchSubjects() }, [])
  useEffect(() => {
    if (form.subjectId) {
      fetchTopics(form.subjectId)
      fetchChapters(form.subjectId)
    }
  }, [form.subjectId])

  useEffect(() => {

    if (filter.subjectId) {
      fetchFilterChapters(
        filter.subjectId
      )
    }

  }, [filter.subjectId])

  useEffect(() => {

    if (filter.chapterId) {
      fetchFilterTopics(
        filter.chapterId
      )
    }

  }, [filter.chapterId])



  const fetchQuestions = async () => {

    setLoading(true)

    try {

      const params = new URLSearchParams({
        page,
        size: 10
      })

      if (filter.status) {
        params.append(
          "status",
          filter.status
        )
      }

      if (filter.subjectId) {
        params.append(
          "subjectId",
          filter.subjectId
        )
      }

      if (filter.chapterId) {
        params.append(
          "chapterId",
          filter.chapterId
        )
      }

      if (filter.topicId) {
        params.append(
          "topicId",
          filter.topicId
        )
      }

      const res = await axios.get(
        `${API}/admin/questions?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setQuestions(
        res.data.data.content
      )

      setTotal(
        res.data.data.totalElements
      )

      setTotalPages(
        res.data.data.totalPages
      )

    } catch (e) {

      console.error(e)

    } finally {

      setLoading(false)

    }
  }

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${API}/user/exam/subjects`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSubjects(res.data.data || [])
    } catch (e) { console.error(e) }
  }

  const fetchTopics = async (subjectId) => {
    try {
      const res = await axios.get(`${API}/user/exam/subjects/${subjectId}/topics`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTopics(res.data.data || [])
    } catch (e) { console.error(e) }
  }

  const fetchChapters = async (subjectId) => {
    try {
      const res = await axios.get(`${API}/user/exam/subjects/${subjectId}/chapters`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setChapters(res.data.data || [])
    } catch (e) { console.error(e) }
  }

  const fetchFilterChapters = async (subjectId) => {

    try {

      const res = await axios.get(
        `${API}/user/exam/subjects/${subjectId}/chapters`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setFilterChapters(
        res.data.data || []
      )

    } catch (e) {
      console.error(e)
    }
  }

  const fetchFilterTopics = async (chapterId) => {

    try {

      const res = await axios.get(
        `${API}/pub/chapters/${chapterId}/topics`
      )

      setFilterTopics(
        res.data.data || []
      )

    } catch (e) {
      console.error(e)
    }
  }

  const handleApprove = async (id) => {
    setActionLoading(true)
    try {
      await axios.patch(`${API}/admin/questions/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchQuestions()
      setSelected(null)
    } catch (e) { console.error(e) }
    finally { setActionLoading(false) }
  }

  const handleReject = async (id) => {
    setActionLoading(true)
    try {
      await axios.patch(`${API}/admin/questions/${id}/reject?notes=Rejected by admin`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchQuestions()
      setSelected(null)
    } catch (e) { console.error(e) }
    finally { setActionLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete করবেন?")) return
    try {
      await axios.delete(`${API}/admin/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchQuestions()
      setSelected(null)
    } catch (e) { console.error(e) }
  }


  const handleEdit = async (question) => {

     const res = await axios.get(
        `${API}/admin/questions/${question.id}`,
        {
           headers:{
              Authorization:`Bearer ${token}`
           }
        }
     )

     const q = res.data.data

     await fetchTopics(q.subjectId)
     await fetchChapters(q.subjectId)

     setForm({
        questionText:q.questionText,
        subjectId:q.subjectId,
        chapterId:q.chapterId,
        topicId:q.topicId,
        difficultyLevel:q.difficultyLevel,
        questionType:q.questionType,
        language:q.language,
        yearAppeared:q.yearAppeared || "",
        sourceReference:q.sourceReference || "",
        options:q.options
     })

     setEditing(true)
     setEditingId(q.id)

     setSelected(null)
     setShowAdd(true)
  }

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...form.options]
    if (field === "isCorrect") {
      newOptions.forEach((o, i) => o.isCorrect = i === index)
    } else {
      newOptions[index][field] = value
    }
    setForm({ ...form, options: newOptions })
  }

  const handleSave = async (submitForReview = false) => {
    setSaveError("")
    if (!form.questionText.trim()) { setSaveError("Question text দাও"); return }
    if (!form.subjectId) { setSaveError("Subject select করো"); return }
    if (!form.topicId) { setSaveError("Topic select করো"); return }
    if (!form.chapterId) { setSaveError("Chapter select করো"); return }
    if (form.options.some(o => !o.optionText.trim())) { setSaveError("সব option এর text দাও"); return }
    if (!form.options.some(o => o.isCorrect)) { setSaveError("একটা correct answer select করো"); return }

    setSaving(true)
    try {
      const payload = {
        questionText: form.questionText,
        subjectId: form.subjectId,
        chapterId: form.chapterId,
        topicId: form.topicId,
        difficultyLevel: form.difficultyLevel,
        questionType: form.questionType,
        language: form.language,
        yearAppeared: form.yearAppeared ? parseInt(form.yearAppeared) : null,
        sourceReference: form.sourceReference,
        options: form.options.map((o, i) => ({
          optionKey: o.optionKey,
          optionText: o.optionText,
          isCorrect: o.isCorrect,
          explanation: o.explanation,
          orderIndex: i
        }))
      }
     if (editing) {

       await axios.put(
         `${API}/admin/questions/${editingId}`,
         payload,
         {
           headers: {
             Authorization: `Bearer ${token}`
           }
         }
       )

     } else {

       await axios.post(
         `${API}/admin/questions`,
         payload,
         {
           headers: {
             Authorization: `Bearer ${token}`
           }
         }
       )

     }
      if (submitForReview) {
        // submit for review হবে
      }
     setEditing(false)
     setEditingId(null)

     setShowAdd(false)
     setSelected(null)

     setForm(defaultForm)

     fetchQuestions()
    } catch (e) {
      setSaveError("Error! আবার চেষ্টা করো")
    } finally { setSaving(false) }
  }

  const filtered = questions.filter(q =>
    !filter.keyword || q.questionText.toLowerCase().includes(filter.keyword.toLowerCase())
  )

  return (
    <div style={{ display: "flex", gap: "20px" }}>

      {/* Left */}
      <div style={{ flex: 1, minWidth: 0 }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#0F172A" }}>Question Bank</h2>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#94A3B8" }}>Total {total} questions</p>
          </div>
          <button
            onClick={() => {

              setEditing(false)
              setEditingId(null)

              setForm(defaultForm)

              setShowAdd(true)
              setSelected(null)

            }}
            style={{ padding: "10px 20px", background: "linear-gradient(135deg,#4F46E5,#7C3AED)", color: "white", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 12px rgba(79,70,229,0.3)" }}>
            + Add Question
          </button>
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
          <input
            placeholder="🔍 Search questions..."
            value={filter.keyword}
            onChange={e => setFilter({ ...filter, keyword: e.target.value })}
            style={{ flex: 1, padding: "10px 14px", border: "1px solid #E2E8F0", borderRadius: "10px", fontSize: "13px", outline: "none", background: "#FFFFFF" }}
          />
          <select
            value={filter.status}
            onChange={e => { setFilter({ ...filter, status: e.target.value }); setPage(0) }}
            style={{ padding: "10px 14px", border: "1px solid #E2E8F0", borderRadius: "10px", fontSize: "13px", outline: "none", background: "#FFFFFF", color: "#64748B" }}
          >
            <option value="">All Status</option>
            <option value="APPROVED">Approved</option>
            <option value="DRAFT">Draft</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

       <div
         style={{
           display: "grid",
           gridTemplateColumns: "1fr 1fr 1fr",
           gap: "12px",
           marginBottom: "16px"
         }}
       >

         {/* Subject */}

         <select
           value={filter.subjectId}
           onChange={(e) => {

             setFilter({
               ...filter,
               subjectId: e.target.value,
               chapterId: "",
               topicId: ""
             })

           }}
           style={{
             padding: "10px 14px",
             border: "1px solid #E2E8F0",
             borderRadius: "10px",
             fontSize: "13px"
           }}
         >
           <option value="">
             All Subjects
           </option>

           {subjects.map((s) => (

             <option
               key={s.id}
               value={s.id}
             >
               {s.name}
             </option>

           ))}

         </select>

         {/* Chapter */}

         <select
           value={filter.chapterId}
           onChange={(e) => {

             setFilter({
               ...filter,
               chapterId: e.target.value,
               topicId: ""
             })

           }}
           style={{
             padding: "10px 14px",
             border: "1px solid #E2E8F0",
             borderRadius: "10px",
             fontSize: "13px"
           }}
         >
           <option value="">
             All Chapters
           </option>

           {filterChapters.map((c) => (

             <option
               key={c.id}
               value={c.id}
             >
               {c.name}
             </option>

           ))}

         </select>

         {/* Topic */}

         <select
           value={filter.topicId}
           onChange={(e) => {

             setFilter({
               ...filter,
               topicId: e.target.value
             })

           }}
           style={{
             padding: "10px 14px",
             border: "1px solid #E2E8F0",
             borderRadius: "10px",
             fontSize: "13px"
           }}
         >
           <option value="">
             All Topics
           </option>

           {filterTopics.map((t) => (

             <option
               key={t.id}
               value={t.id}
             >
               {t.name}
             </option>

           ))}

         </select>

       </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
          {[
            { label: "Total", value: total, color: "#4F46E5" },
            { label: "Approved", value: questions.filter(q => q.status === "APPROVED").length, color: "#10B981" },
            { label: "Pending", value: questions.filter(q => q.status === "UNDER_REVIEW").length, color: "#F59E0B" },
            { label: "Draft", value: questions.filter(q => q.status === "DRAFT").length, color: "#64748B" },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, background: "#FFFFFF", border: "1px solid #F1F5F9", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "20px", fontWeight: "700", color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "2px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "#FFFFFF", borderRadius: "16px", border: "1px solid #F1F5F9", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>কোনো question নেই</div>
          ) : filtered.map((q, i) => (
            <div key={q.id}
              onClick={() => { setSelected(q); setShowAdd(false) }}
              style={{ padding: "16px 20px", borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none", cursor: "pointer", transition: "all 0.15s", background: selected?.id === q.id ? "#EEF2FF" : "transparent", borderLeft: selected?.id === q.id ? "3px solid #4F46E5" : "3px solid transparent" }}
              onMouseEnter={e => { if (selected?.id !== q.id) e.currentTarget.style.background = "#F8FAFC" }}
              onMouseLeave={e => { if (selected?.id !== q.id) e.currentTarget.style.background = "transparent" }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ minWidth: "28px", height: "28px", borderRadius: "8px", background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: "#4F46E5" }}>{i + 1 + page * 10}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#0F172A", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.questionText}</p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ padding: "2px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: statusColors[q.status]?.bg, color: statusColors[q.status]?.color }}>{q.status}</span>
                    <span style={{ padding: "2px 8px", borderRadius: "20px", fontSize: "11px", background: "#F1F5F9", color: "#64748B" }}>{q.subjectName}</span>
                    <span style={{ padding: "2px 8px", borderRadius: "20px", fontSize: "11px", background: "#F1F5F9", color: difficultyColor[q.difficultyLevel] }}>{difficultyLabel[q.difficultyLevel]}</span>
                    {q.yearAppeared && <span style={{ padding: "2px 8px", borderRadius: "20px", fontSize: "11px", background: "#FFFBEB", color: "#F59E0B" }}>{q.yearAppeared}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "16px" }}>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #E2E8F0", background: page === 0 ? "#F8FAFC" : "#FFFFFF", cursor: page === 0 ? "not-allowed" : "pointer", fontSize: "13px" }}>← Prev</button>
            <span style={{ padding: "8px 16px", fontSize: "13px", color: "#64748B" }}>{page + 1} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #E2E8F0", background: page === totalPages - 1 ? "#F8FAFC" : "#FFFFFF", cursor: page === totalPages - 1 ? "not-allowed" : "pointer", fontSize: "13px" }}>Next →</button>
          </div>
        )}
      </div>

      {/* Right — Detail or Add Form */}
      <div style={{ width: "400px", flexShrink: 0 }}>

        {/* Add Question Form */}
        {showAdd && (
          <div style={{ background: "#FFFFFF", borderRadius: "16px", border: "1px solid #F1F5F9", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", padding: "24px", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
             <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0F172A" }}>
               {editing ? "✏️ Edit Question" : "➕ New Question"}
             </h3>
              <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#94A3B8" }}>✕</button>
            </div>

            {saveError && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#EF4444", marginBottom: "16px" }}>{saveError}</div>
            )}

            {/* Question Text */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748B", display: "block", marginBottom: "6px" }}>QUESTION TEXT *</label>
              <textarea
                rows={3}
                placeholder="প্রশ্নটি লিখুন..."
                value={form.questionText}
                onChange={e => setForm({ ...form, questionText: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #E2E8F0", borderRadius: "10px", fontSize: "13px", outline: "none", resize: "vertical", boxSizing: "border-box" }}
              />
            </div>

            {/* Subject */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748B", display: "block", marginBottom: "6px" }}>SUBJECT *</label>
              <select
                value={form.subjectId}
                onChange={e => setForm({ ...form, subjectId: e.target.value, topicId: "", chapterId: "" })}
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #E2E8F0", borderRadius: "10px", fontSize: "13px", outline: "none", background: "#FFFFFF" }}
              >
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {/* Chapter */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748B", display: "block", marginBottom: "6px" }}>CHAPTER *</label>
              <select
                value={form.chapterId}
                onChange={e => setForm({ ...form, chapterId: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #E2E8F0", borderRadius: "10px", fontSize: "13px", outline: "none", background: "#FFFFFF" }}
              >
                <option value="">Select Chapter</option>
                {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Topic */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748B", display: "block", marginBottom: "6px" }}>TOPIC *</label>
              <select
                value={form.topicId}
                onChange={e => setForm({ ...form, topicId: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #E2E8F0", borderRadius: "10px", fontSize: "13px", outline: "none", background: "#FFFFFF" }}
              >
                <option value="">Select Topic</option>
                {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            {/* Difficulty + Year */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748B", display: "block", marginBottom: "6px" }}>DIFFICULTY</label>
                <select
                  value={form.difficultyLevel}
                  onChange={e => setForm({ ...form, difficultyLevel: parseInt(e.target.value) })}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #E2E8F0", borderRadius: "10px", fontSize: "13px", outline: "none", background: "#FFFFFF" }}
                >
                  <option value={1}>Easy</option>
                  <option value={2}>Medium</option>
                  <option value={3}>Hard</option>
                  <option value={4}>Expert</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748B", display: "block", marginBottom: "6px" }}>YEAR</label>
                <input
                  type="number"
                  placeholder="2024"
                  value={form.yearAppeared}
                  onChange={e => setForm({ ...form, yearAppeared: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #E2E8F0", borderRadius: "10px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>

            {/* Options */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748B", display: "block", marginBottom: "10px" }}>OPTIONS * (সঠিক উত্তরে ক্লিক করো)</label>
              {form.options.map((opt, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                  <div
                    onClick={() => handleOptionChange(i, "isCorrect", true)}
                    style={{ minWidth: "28px", height: "28px", borderRadius: "50%", background: opt.isCorrect ? "#10B981" : "#F1F5F9", color: opt.isCorrect ? "white" : "#64748B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", cursor: "pointer", border: `2px solid ${opt.isCorrect ? "#10B981" : "#E2E8F0"}` }}
                  >{opt.optionKey}</div>
                  <input
                    placeholder={`Option ${opt.optionKey}`}
                    value={opt.optionText}
                    onChange={e => handleOptionChange(i, "optionText", e.target.value)}
                    style={{ flex: 1, padding: "8px 12px", border: `1px solid ${opt.isCorrect ? "#10B981" : "#E2E8F0"}`, borderRadius: "8px", fontSize: "13px", outline: "none", background: opt.isCorrect ? "#ECFDF5" : "#FFFFFF" }}
                  />
                </div>
              ))}
            </div>

            {/* Source */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748B", display: "block", marginBottom: "6px" }}>SOURCE (optional)</label>
              <input
                placeholder="e.g. BCS 44th Preliminary"
                value={form.sourceReference}
                onChange={e => setForm({ ...form, sourceReference: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #E2E8F0", borderRadius: "10px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                style={{ flex: 1, padding: "11px", borderRadius: "10px", border: "1px solid #E2E8F0", background: "#F8FAFC", color: "#64748B", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
              >
                💾 Draft
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                style={{ flex: 2, padding: "11px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg,#4F46E5,#7C3AED)", color: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 12px rgba(79,70,229,0.3)" }}
              >
                {saving ? "Saving..." : "✅ Save & Submit"}
              </button>
            </div>
          </div>
        )}

        {/* Question Detail */}
        {selected && !showAdd && (
          <div style={{ background: "#FFFFFF", borderRadius: "16px", border: "1px solid #F1F5F9", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", padding: "24px", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#0F172A" }}>Question Detail</h3>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#94A3B8" }}>✕</button>
            </div>

            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
              <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: statusColors[selected.status]?.bg, color: statusColors[selected.status]?.color }}>{selected.status}</span>
              <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", background: "#F1F5F9", color: "#64748B" }}>{selected.subjectName}</span>
              <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", background: "#F1F5F9", color: "#64748B" }}>{selected.topicName}</span>
            </div>

            <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
              <p style={{ margin: 0, fontSize: "14px", color: "#0F172A", lineHeight: "1.6", fontWeight: "500" }}>{selected.questionText}</p>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: "700", color: "#94A3B8", letterSpacing: "0.5px" }}>OPTIONS</p>
              {selected.options?.map((opt, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "10px 12px", borderRadius: "10px", marginBottom: "6px", background: opt.isCorrect ? "#ECFDF5" : "#F8FAFC", border: `1px solid ${opt.isCorrect ? "#10B981" : "#F1F5F9"}` }}>
                  <span style={{ minWidth: "22px", height: "22px", borderRadius: "50%", background: opt.isCorrect ? "#10B981" : "#E2E8F0", color: opt.isCorrect ? "white" : "#64748B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700" }}>{opt.optionKey}</span>
                  <div>
                    <p style={{ margin: 0, fontSize: "13px", color: "#0F172A", fontWeight: opt.isCorrect ? "600" : "400" }}>{opt.optionText}</p>
                    {opt.explanation && <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#94A3B8" }}>{opt.explanation}</p>}
                  </div>
                  {opt.isCorrect && <span style={{ marginLeft: "auto", fontSize: "14px" }}>✅</span>}
                </div>
              ))}
            </div>

            <div style={{ background: "#F8FAFC", borderRadius: "10px", padding: "12px", marginBottom: "16px" }}>
              {[
                { label: "Difficulty", value: difficultyLabel[selected.difficultyLevel] },
                { label: "Type", value: selected.questionType },
                { label: "Year", value: selected.yearAppeared || "N/A" },
                { label: "Chapter", value: selected.chapterName },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: i < 3 ? "1px solid #F1F5F9" : "none" }}>
                  <span style={{ fontSize: "12px", color: "#94A3B8" }}>{item.label}</span>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#0F172A" }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <button
                  onClick={() => handleEdit(selected)}
                  style={{
                    padding: "10px",
                    borderRadius: "10px",
                    background: "#EEF2FF",
                    border: "1px solid #4F46E5",
                    color: "#4F46E5",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  ✏️ Edit Question
                </button>

              {selected.status !== "APPROVED" && (
                <button onClick={() => handleApprove(selected.id)} disabled={actionLoading} style={{ padding: "10px", borderRadius: "10px", background: "#ECFDF5", border: "1px solid #10B981", color: "#10B981", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>✅ Approve</button>
              )}
              {selected.status !== "REJECTED" && (
                <button onClick={() => handleReject(selected.id)} disabled={actionLoading} style={{ padding: "10px", borderRadius: "10px", background: "#FEF2F2", border: "1px solid #EF4444", color: "#EF4444", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>❌ Reject</button>
              )}
              <button onClick={() => handleDelete(selected.id)} style={{ padding: "10px", borderRadius: "10px", background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#64748B", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>🗑 Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
