import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const API = "http://localhost:8080/api/v1";

const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 16px",
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
  },
  card: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "40px",
    width: "100%",
    maxWidth: "520px",
    boxShadow: "0 8px 40px rgba(66, 99, 235, 0.12)",
  },
  header: {
    marginBottom: "32px",
  },
  badge: {
    display: "inline-block",
    background: "#eef2ff",
    color: "#4f46e5",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "1px",
    textTransform: "uppercase",
    padding: "4px 12px",
    borderRadius: "20px",
    marginBottom: "12px",
  },
  title: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1e1b4b",
    margin: "0 0 6px 0",
  },
  subtitle: {
    fontSize: "13px",
    color: "#6b7280",
    margin: 0,
  },
  divider: {
    height: "1px",
    background: "#f3f4f6",
    margin: "0 0 28px 0",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  fieldLabel: {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "6px",
    letterSpacing: "0.3px",
  },
  select: {
    width: "100%",
    padding: "10px 14px",
    border: "1.5px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "14px",
    color: "#374151",
    background: "#f9fafb",
    outline: "none",
    cursor: "pointer",
    transition: "border-color 0.2s, box-shadow 0.2s",
    appearance: "none",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    paddingRight: "36px",
    boxSizing: "border-box",
  },
  selectDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  fileZone: {
    border: "2px dashed #c7d2fe",
    borderRadius: "12px",
    padding: "24px",
    textAlign: "center",
    background: "#f5f3ff",
    cursor: "pointer",
    transition: "border-color 0.2s, background 0.2s",
    position: "relative",
  },
  fileZoneActive: {
    borderColor: "#4f46e5",
    background: "#eef2ff",
  },
  fileIcon: {
    fontSize: "28px",
    marginBottom: "8px",
  },
  fileZoneText: {
    fontSize: "13px",
    color: "#6b7280",
    margin: "0 0 4px 0",
  },
  fileZoneHint: {
    fontSize: "11px",
    color: "#9ca3af",
    margin: 0,
  },
  fileInput: {
    position: "absolute",
    inset: 0,
    opacity: 0,
    cursor: "pointer",
    width: "100%",
    height: "100%",
  },
  fileSelected: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    background: "#ecfdf5",
    border: "1.5px solid #a7f3d0",
    borderRadius: "10px",
    marginTop: "10px",
  },
  fileSelectedName: {
    fontSize: "13px",
    color: "#065f46",
    fontWeight: "500",
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  removeFile: {
    background: "none",
    border: "none",
    color: "#6b7280",
    cursor: "pointer",
    fontSize: "16px",
    padding: "0 2px",
    lineHeight: 1,
  },
  progressBar: {
    height: "4px",
    background: "#e0e7ff",
    borderRadius: "4px",
    overflow: "hidden",
    marginTop: "8px",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #4f46e5, #818cf8)",
    borderRadius: "4px",
    animation: "progress-anim 1.5s ease-in-out infinite",
    width: "60%",
  },
  button: {
    width: "100%",
    padding: "13px",
    background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "opacity 0.2s, transform 0.1s",
    letterSpacing: "0.2px",
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
    transform: "none",
  },
  toast: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "14px 16px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "500",
    marginTop: "16px",
    lineHeight: 1.5,
  },
  toastSuccess: {
    background: "#ecfdf5",
    border: "1px solid #a7f3d0",
    color: "#065f46",
  },
  toastError: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
  },
  stepsRow: {
    display: "flex",
    gap: "4px",
    marginBottom: "28px",
  },
  step: {
    flex: 1,
    height: "4px",
    borderRadius: "4px",
    background: "#e5e7eb",
    transition: "background 0.3s",
  },
  stepDone: {
    background: "#4f46e5",
  },
};

export default function BulkUpload({ token }) {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);

  const [subjectId, setSubjectId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [topicId, setTopicId] = useState("");

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null); // { type: "success"|"error", message }

  useEffect(() => {
    fetchSubjects();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${API}/pub/subjects`);
      setSubjects(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchChapters = async (id) => {
    try {
      const res = await axios.get(`${API}/pub/subjects/${id}/chapters`);
      setChapters(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTopics = async (id) => {
    try {
      const res = await axios.get(`${API}/pub/chapters/${id}/topics`);
      setTopics(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const downloadDemo = () => {
    const headers = [
      "Question", "QuestionType", "Difficulty", "CognitiveLevel",
      "OptionA", "OptionB", "OptionC", "OptionD",
      "CorrectOption",
      "ExplanationA", "ExplanationB", "ExplanationC", "ExplanationD",
      "SourceReference", "YearAppeared"
    ];

    const sampleRows = [
      [
        "What does CPU stand for?",
        "MCQ_SINGLE", "1", "REMEMBER",
        "Central Processing Unit",
        "Central Program Utility",
        "Computer Processing Unit",
        "Core Processing Unit",
        "A",
        "Correct. CPU = Central Processing Unit.",
        "Incorrect. No such term.",
        "Incorrect. No such term.",
        "Incorrect. No such term.",
        "Computer Basics", "2024"
      ],
      [
        "Which of the following is a volatile memory?",
        "MCQ_SINGLE", "2", "UNDERSTAND",
        "ROM", "Hard Disk", "RAM", "SSD",
        "C",
        "Incorrect. ROM is non-volatile.",
        "Incorrect. Hard Disk is non-volatile.",
        "Correct. RAM loses data when power is off — volatile memory.",
        "Incorrect. SSD is non-volatile.",
        "Computer Hardware", "2023"
      ]
    ];

    const wsData = [headers, ...sampleRows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Column widths
    ws["!cols"] = [
      { wch: 55 }, { wch: 14 }, { wch: 12 }, { wch: 16 },
      { wch: 35 }, { wch: 35 }, { wch: 35 }, { wch: 35 },
      { wch: 14 },
      { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 },
      { wch: 22 }, { wch: 12 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Questions");

    // Legend sheet
    const legendData = [
      ["Field", "Values / Notes"],
      ["QuestionType", "MCQ_SINGLE"],
      ["Difficulty", "1 = Easy, 2 = Medium, 3 = Hard"],
      ["CognitiveLevel", "REMEMBER / UNDERSTAND / APPLY / ANALYZE / EVALUATE / CREATE"],
      ["CorrectOption", "A / B / C / D"],
      ["SourceReference", "Topic or book reference"],
      ["YearAppeared", "Year the question appeared"],
    ];
    const legendWs = XLSX.utils.aoa_to_sheet(legendData);
    legendWs["!cols"] = [{ wch: 20 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, legendWs, "Legend");

    XLSX.writeFile(wb, "Bulk_Question_Demo.xlsx");
  };

  const handleUpload = async () => {
      if (!subjectId) return showToast("error", "একটি Subject সিলেক্ট করুন।");
      if (!chapterId) return showToast("error", "একটি Chapter সিলেক্ট করুন।");
      if (!topicId) return showToast("error", "একটি Topic সিলেক্ট করুন।");
      if (!file) return showToast("error", "একটি Excel (.xlsx) ফাইল বেছে নিন।");

      try {
        setUploading(true);
        setToast(null);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("subjectId", subjectId);
        formData.append("chapterId", chapterId);
        formData.append("topicId", topicId);

        const res = await axios.post(`${API}/admin/bulk-upload`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ সব reset করো
        setSubjectId("");
        setChapterId("");
        setTopicId("");
        setChapters([]);
        setTopics([]);
        setFile(null);

        showToast("success", res.data.message || "✅ প্রশ্নগুলো সফলভাবে আপলোড হয়েছে! নতুন করে সিলেক্ট করুন।");

      } catch (e) {
        console.error(e);
        showToast(
          "error",
          e?.response?.data?.message || "আপলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।"
        );
      } finally {
        setUploading(false);
      }
    };

  // progress indicator: count how many steps done
  const steps = [
    !!subjectId,
    !!chapterId,
    !!topicId,
    !!file,
  ];

  return (
    <>
      <style>{`
        @keyframes progress-anim {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        .bulk-select:focus {
          border-color: #4f46e5 !important;
          box-shadow: 0 0 0 3px rgba(79,70,229,0.12);
          background: #fff !important;
        }
        .bulk-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
        }
        .bulk-file-zone:hover {
          border-color: #4f46e5;
          background: #eef2ff;
        }
      `}</style>

      <div style={styles.wrapper}>
        <div style={styles.card}>

          {/* Header */}
          <div style={styles.header}>
            <div style={styles.badge}>Admin Panel</div>
            <h2 style={styles.title}>Bulk Question Upload</h2>
            <p style={styles.subtitle}>
              Excel ফাইল আপলোড করে একসাথে অনেক প্রশ্ন যোগ করুন
            </p>
          </div>

          {/* Progress Steps */}
          <div style={styles.stepsRow}>
            {steps.map((done, i) => (
              <div
                key={i}
                style={{ ...styles.step, ...(done ? styles.stepDone : {}) }}
              />
            ))}
          </div>

          <div style={styles.divider} />

          <div style={styles.fieldGroup}>

            {/* Subject */}
            <div>
              <label style={styles.fieldLabel}>📚 Subject</label>
              <select
                className="bulk-select"
                style={styles.select}
                value={subjectId}
                onChange={(e) => {
                  const v = e.target.value;
                  setSubjectId(v);
                  setChapterId("");
                  setTopicId("");
                  setChapters([]);
                  setTopics([]);
                  if (v) fetchChapters(v);
                }}
              >
                <option value="">— Subject বেছে নিন —</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Chapter */}
            <div>
              <label style={styles.fieldLabel}>📖 Chapter</label>
              <select
                className="bulk-select"
                style={{
                  ...styles.select,
                  ...(!subjectId ? styles.selectDisabled : {}),
                }}
                value={chapterId}
                disabled={!subjectId}
                onChange={(e) => {
                  const v = e.target.value;
                  setChapterId(v);
                  setTopicId("");
                  setTopics([]);
                  if (v) fetchTopics(v);
                }}
              >
                <option value="">— Chapter বেছে নিন —</option>
                {chapters.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Topic */}
            <div>
              <label style={styles.fieldLabel}>🏷️ Topic</label>
              <select
                className="bulk-select"
                style={{
                  ...styles.select,
                  ...(!chapterId ? styles.selectDisabled : {}),
                }}
                value={topicId}
                disabled={!chapterId}
                onChange={(e) => setTopicId(e.target.value)}
              >
                <option value="">— Topic বেছে নিন —</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* File Upload */}
            <div>
              <label style={styles.fieldLabel}>📎 Excel ফাইল (.xlsx)</label>

              {!file ? (
                <div className="bulk-file-zone" style={styles.fileZone}>
                  <input
                    type="file"
                    accept=".xlsx"
                    style={styles.fileInput}
                    onChange={(e) => setFile(e.target.files[0] || null)}
                  />
                  <div style={styles.fileIcon}>📂</div>
                  <p style={styles.fileZoneText}>ফাইল এখানে টেনে আনুন বা ক্লিক করুন</p>
                  <p style={styles.fileZoneHint}>শুধুমাত্র .xlsx ফরম্যাট সাপোর্টেড</p>
                </div>
              ) : (
                <div style={styles.fileSelected}>
                  <span>✅</span>
                  <span style={styles.fileSelectedName}>{file.name}</span>
                  <button
                    style={styles.removeFile}
                    onClick={() => setFile(null)}
                    title="Remove file"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Download Demo Button */}
            <button
              onClick={downloadDemo}
              style={{
                width: "100%",
                padding: "11px",
                background: "transparent",
                color: "#4f46e5",
                border: "1.5px solid #4f46e5",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#eef2ff"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              📥 Demo Excel ডাউনলোড করুন
            </button>



            {/* Upload Button */}
            <button
              className="bulk-btn"
              style={{
                ...styles.button,
                ...(uploading ? styles.buttonDisabled : {}),
              }}
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <span>⏳</span> আপলোড হচ্ছে...
                </>
              ) : (
                <>
                  <span>🚀</span> প্রশ্ন আপলোড করুন
                </>
              )}
            </button>

            {/* Uploading progress bar */}
            {uploading && (
              <div style={styles.progressBar}>
                <div style={styles.progressFill} />
              </div>
            )}

            {/* Toast */}
            {toast && (
              <div
                style={{
                  ...styles.toast,
                  ...(toast.type === "success"
                    ? styles.toastSuccess
                    : styles.toastError),
                }}
              >
                <span>{toast.type === "success" ? "✅" : "❌"}</span>
                <span>{toast.message}</span>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}