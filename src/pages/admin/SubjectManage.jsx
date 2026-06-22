import { useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
});

const InlineForm = ({ value, onChange, onSave, onCancel, placeholder, editLabel }) => (
    <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
      <input
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
      />
      <input
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Description (optional)"
        value={value.description}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
      />
      <div className="flex gap-2">
        <button
          onClick={onSave}
          className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
        >
          {editLabel ? "Update" : "Save"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );

export default function SubjectManage() {
  // --- Subjects ---
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
 const [subjectForm, setSubjectForm] = useState({
   name: "",
   nameBn: "",
   code: ""
 });
  const [editingSubject, setEditingSubject] = useState(null);
  const [showSubjectForm, setShowSubjectForm] = useState(false);

  // --- Chapters ---
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [chapterForm, setChapterForm] = useState({ name: "", description: "" });
  const [editingChapter, setEditingChapter] = useState(null);
  const [showChapterForm, setShowChapterForm] = useState(false);

  // --- Topics ---
  const [topics, setTopics] = useState([]);
  const [topicForm, setTopicForm] = useState({ name: "", description: "" });
  const [editingTopic, setEditingTopic] = useState(null);
  const [showTopicForm, setShowTopicForm] = useState(false);

  const [loading, setLoading] = useState({ subjects: false, chapters: false, topics: false });
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type, id, name }

  // ======================== SUBJECTS ========================
  const fetchSubjects = async () => {
    setLoading((l) => ({ ...l, subjects: true }));
    try {
      const res = await axios.get(`${API}/pub/subjects`, getHeaders());
      setSubjects(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      alert("Subjects load করতে সমস্যা হয়েছে");
    }
    setLoading((l) => ({ ...l, subjects: false }));
  };

  const saveSubject = async () => {
    if (!subjectForm.name.trim()) return alert("Subject name দাও");
    try {
      if (editingSubject) {
        await axios.put(`${API}/admin/subjects/${editingSubject.id}`, subjectForm, getHeaders());
      } else {
        await axios.post(`${API}/admin/subjects`, subjectForm, getHeaders());
      }
      setSubjectForm({
        name: "",
        nameBn: "",
        code: ""
      });
      setEditingSubject(null);
      setShowSubjectForm(false);
      fetchSubjects();
    } catch (err) {
        console.log("SAVE SUBJECT ERROR =", err);

        if (err.response) {
          console.log("STATUS =", err.response.status);
          console.log("DATA =", err.response.data);
        }

        alert("Subject save করতে সমস্যা হয়েছে");
      }
  };

  const deleteSubject = async (id) => {
    try {
      await axios.delete(`${API}/admin/subjects/${id}`, getHeaders());
      if (selectedSubject?.id === id) {
        setSelectedSubject(null);
        setChapters([]);
        setSelectedChapter(null);
        setTopics([]);
      }
      fetchSubjects();
    } catch {
      alert("Delete করতে সমস্যা হয়েছে");
    }
    setDeleteConfirm(null);
  };

 const startEditSubject = (s) => {
   setEditingSubject(s);

   setSubjectForm({
     name: s.name || "",
     nameBn: s.nameBn || "",
     code: s.code || ""
   });

   setShowSubjectForm(true);
 };

  // ======================== CHAPTERS ========================
  const fetchChapters = async (subjectId) => {
    setLoading((l) => ({ ...l, chapters: true }));
    setSelectedChapter(null);
    setTopics([]);
    try {
      const res = await axios.get(
        `${API}/pub/subjects/${subjectId}/chapters`,
        getHeaders()
      );

      setChapters(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      setChapters([]);
    }
    setLoading((l) => ({ ...l, chapters: false }));
  };

  const selectSubject = (s) => {
    setSelectedSubject(s);
    setSelectedChapter(null);
    setTopics([]);
    setChapters([]);
    setShowChapterForm(false);
    setShowSubjectForm(false);
    fetchChapters(s.id);
  };

  const saveChapter = async () => {
    if (!chapterForm.name.trim()) return alert("Chapter name দাও");
    try {
      if (editingChapter) {
        await axios.put(`${API}/admin/chapters/${editingChapter.id}`, chapterForm, getHeaders());
      } else {
        await axios.post(
          `${API}/admin/chapters`,
          { ...chapterForm, subjectId: selectedSubject.id },
          getHeaders()
        );
      }
      setChapterForm({ name: "", description: "" });
      setEditingChapter(null);
      setShowChapterForm(false);
      fetchChapters(selectedSubject.id);
    } catch {
      alert("Chapter save করতে সমস্যা হয়েছে");
    }
  };

  const deleteChapter = async (id) => {
    try {
      await axios.delete(`${API}/admin/chapters/${id}`, getHeaders());
      if (selectedChapter?.id === id) {
        setSelectedChapter(null);
        setTopics([]);
      }
      fetchChapters(selectedSubject.id);
    } catch {
      alert("Delete করতে সমস্যা হয়েছে");
    }
    setDeleteConfirm(null);
  };

  const startEditChapter = (c) => {
    setEditingChapter(c);
    setChapterForm({ name: c.name, description: c.description || "" });
    setShowChapterForm(true);
  };

  // ======================== TOPICS ========================
const fetchTopics = async (chapterId) => {
  setLoading((l) => ({ ...l, topics: true }));

  try {
    const res = await axios.get(
      `${API}/pub/chapters/${chapterId}/topics`,
      getHeaders()
    );

    setTopics(
      Array.isArray(res.data.data)
        ? res.data.data
        : []
    );
  } catch {
    setTopics([]);
  }

  setLoading((l) => ({ ...l, topics: false }));
};

  const selectChapter = (c) => {
    setSelectedChapter(c);
    setTopics([]);
    setShowTopicForm(false);
    fetchTopics(c.id);
  };

  const saveTopic = async () => {
    if (!topicForm.name.trim()) return alert("Topic name দাও");
    try {
      if (editingTopic) {
        await axios.put(`${API}/admin/topics/${editingTopic.id}`, topicForm, getHeaders());
      } else {
        await axios.post(
          `${API}/admin/topics`,
          { ...topicForm, chapterId: selectedChapter.id },
          getHeaders()
        );
      }
      setTopicForm({ name: "", description: "" });
      setEditingTopic(null);
      setShowTopicForm(false);
      fetchTopics(selectedChapter.id);
    } catch {
      alert("Topic save করতে সমস্যা হয়েছে");
    }
  };

  const deleteTopic = async (id) => {
    try {
      await axios.delete(`${API}/admin/topics/${id}`, getHeaders());
      fetchTopics(selectedChapter.id);
    } catch {
      alert("Delete করতে সমস্যা হয়েছে");
    }
    setDeleteConfirm(null);
  };

  const startEditTopic = (t) => {
    setEditingTopic(t);
    setTopicForm({ name: t.name, description: t.description || "" });
    setShowTopicForm(true);
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // ======================== REUSABLE COMPONENTS ========================


  const DeleteModal = () => {
    if (!deleteConfirm) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-80 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Confirm</h3>
          <p className="text-sm text-gray-600 mb-4">
            <span className="font-medium text-red-600">"{deleteConfirm.name}"</span> delete করবে?
            এটা undo করা যাবে না।
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (deleteConfirm.type === "subject") deleteSubject(deleteConfirm.id);
                else if (deleteConfirm.type === "chapter") deleteChapter(deleteConfirm.id);
                else deleteTopic(deleteConfirm.id);
              }}
              className="flex-1 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
            >
              হ্যাঁ, Delete করো
            </button>
            <button
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ======================== RENDER ========================
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <DeleteModal />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📚 Subject Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Subject → Chapter → Topic hierarchy manage করো
        </p>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-4 text-gray-600">
        <span className="font-medium text-blue-600">Subjects</span>
        {selectedSubject && (
          <>
            <span>›</span>
            <span className="font-medium text-blue-600">{selectedSubject.name}</span>
          </>
        )}
        {selectedChapter && (
          <>
            <span>›</span>
            <span className="font-medium text-blue-600">{selectedChapter.name}</span>
          </>
        )}
      </div>

      {/* 3-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ===== PANEL 1: SUBJECTS ===== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700">
              📖 Subjects
              <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                {subjects.length}
              </span>
            </h2>
            <button
              onClick={() => {
                setShowSubjectForm(!showSubjectForm);
                setEditingSubject(null);
                setSubjectForm({
                  name: "",
                  nameBn: "",
                  code: ""
                });
              }}
              className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Add
            </button>
          </div>

          <div className="p-3">
           {showSubjectForm && (
             <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">

               <input
                 className="w-full px-3 py-2 border border-gray-300 rounded-md"
                 placeholder="Subject Name"
                 value={subjectForm.name}
                 onChange={(e) =>
                   setSubjectForm({
                     ...subjectForm,
                     name: e.target.value
                   })
                 }
               />

               <input
                 className="w-full px-3 py-2 border border-gray-300 rounded-md"
                 placeholder="বাংলা নাম"
                 value={subjectForm.nameBn}
                 onChange={(e) =>
                   setSubjectForm({
                     ...subjectForm,
                     nameBn: e.target.value
                   })
                 }
               />

               <input
                 className="w-full px-3 py-2 border border-gray-300 rounded-md"
                 placeholder="CODE (BANGLA)"
                 value={subjectForm.code}
                 onChange={(e) =>
                   setSubjectForm({
                     ...subjectForm,
                     code: e.target.value.toUpperCase()
                   })
                 }
               />

               <div className="flex gap-2">
                 <button
                   type="button"
                   onClick={saveSubject}
                   className="px-4 py-2 bg-blue-600 text-white rounded-md"
                 >
                   {editingSubject ? "Update" : "Save"}
                 </button>

                 <button
                   type="button"
                   onClick={() => {
                     setShowSubjectForm(false);
                     setEditingSubject(null);
                   }}
                   className="px-4 py-2 bg-gray-200 rounded-md"
                 >
                   Cancel
                 </button>
               </div>

             </div>
           )}

            {loading.subjects ? (
              <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
            ) : subjects.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">কোনো subject নেই</div>
            ) : (
              <ul className="mt-2 space-y-1">
                {(subjects || []).map((s) => (
                  <li
                    key={s.id}
                    onClick={() => selectSubject(s)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer group transition-colors ${
                      selectedSubject?.id === s.id
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>

                      <p className="text-xs text-gray-400">
                        {s.nameBn}
                      </p>

                    </div>
                    <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); startEditSubject(s); }}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm({ type: "subject", id: s.id, name: s.name });
                        }}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ===== PANEL 2: CHAPTERS ===== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700">
              📑 Chapters
              {selectedSubject && (
                <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                  {chapters.length}
                </span>
              )}
            </h2>
            {selectedSubject && (
              <button
                onClick={() => {
                  setShowChapterForm(!showChapterForm);
                  setEditingChapter(null);
                  setChapterForm({ name: "", description: "" });
                }}
                className="text-sm px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                + Add
              </button>
            )}
          </div>

          <div className="p-3">
            {!selectedSubject ? (
              <div className="text-center py-12 text-gray-300">
                <p className="text-3xl mb-2">👈</p>
                <p className="text-sm">Subject select করো</p>
              </div>
            ) : (
              <>
                {showChapterForm && (
                  <InlineForm
                    value={chapterForm}
                    onChange={setChapterForm}
                    onSave={saveChapter}
                    onCancel={() => { setShowChapterForm(false); setEditingChapter(null); }}
                    placeholder={`Chapter name (${selectedSubject.name})`}
                    editLabel={!!editingChapter}
                  />
                )}

                {loading.chapters ? (
                  <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
                ) : chapters.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">কোনো chapter নেই</div>
                ) : (
                  <ul className="mt-2 space-y-1">
                    {(chapters || []).map((c) => (
                      <li
                        key={c.id}
                        onClick={() => selectChapter(c)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer group transition-colors ${
                          selectedChapter?.id === c.id
                            ? "bg-green-50 border border-green-200"
                            : "hover:bg-gray-50 border border-transparent"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                          {c.description && (
                            <p className="text-xs text-gray-400 truncate">{c.description}</p>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); startEditChapter(c); }}
                            className="p-1 text-gray-400 hover:text-blue-600"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm({ type: "chapter", id: c.id, name: c.name });
                            }}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            🗑️
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>

        {/* ===== PANEL 3: TOPICS ===== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700">
              🏷️ Topics
              {selectedChapter && (
                <span className="ml-2 text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                  {topics.length}
                </span>
              )}
            </h2>
            {selectedChapter && (
              <button
                onClick={() => {
                  setShowTopicForm(!showTopicForm);
                  setEditingTopic(null);
                  setTopicForm({ name: "", description: "" });
                }}
                className="text-sm px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                + Add
              </button>
            )}
          </div>

          <div className="p-3">
            {!selectedChapter ? (
              <div className="text-center py-12 text-gray-300">
                <p className="text-3xl mb-2">👈</p>
                <p className="text-sm">Chapter select করো</p>
              </div>
            ) : (
              <>
                {showTopicForm && (
                  <InlineForm
                    value={topicForm}
                    onChange={setTopicForm}
                    onSave={saveTopic}
                    onCancel={() => { setShowTopicForm(false); setEditingTopic(null); }}
                    placeholder={`Topic name (${selectedChapter.name})`}
                    editLabel={!!editingTopic}
                  />
                )}

                {loading.topics ? (
                  <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
                ) : topics.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">কোনো topic নেই</div>
                ) : (
                  <ul className="mt-2 space-y-1">
                    {(topics || []).map((t) => (
                      <li
                        key={t.id}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg group hover:bg-gray-50 border border-transparent transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{t.name}</p>
                          {t.description && (
                            <p className="text-xs text-gray-400 truncate">{t.description}</p>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEditTopic(t)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm({ type: "topic", id: t.id, name: t.name })
                            }
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            🗑️
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
