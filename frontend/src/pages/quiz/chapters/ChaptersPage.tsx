import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChaptersBySubject } from "../../../api/chapters";
import type { Chapter } from "../../../types/chapter";
import { getSubjectById } from "../../../api/subjects";
import AppHeader from "../../../components/AppHeader";

export default function ChaptersPage() {
  const { id } = useParams(); // subjectId
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectName, setSubjectName] = useState("");

  useEffect(() => {
    if (!id) return;
    getChaptersBySubject(id)
      .then(setChapters)  //thanh cong thi set chapter vao dong so 10
      .catch((err) => console.error("Lỗi khi load chapters:", err))
      .finally(() => setLoading(false));
  }, [id]);
  
  useEffect(() => {
    if (!id) return;
    getSubjectById(id)
      .then((s) => setSubjectName(s.name))
      .catch((err) => console.error("Lỗi khi load subject:", err));
  }, [id]);
  

  if (loading) return <div>Đang tải danh sách chương...</div>;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 20% 20%, #ecfccb 0%, #e0f2fe 55%, #ffffff 100%)",
        color: "#0f172a",
        fontFamily: '"Space Grotesk", "IBM Plex Sans", sans-serif',
      }}
    >
      <AppHeader />
      <style>{`
        .chapters-wrap {
          max-width: 900px;
          margin: 28px auto 60px;
          padding: 0 20px 40px;
        }
        .chapters-title {
          font-size: clamp(26px, 3vw, 36px);
          margin: 0 0 6px;
        }
        .chapters-subtitle {
          margin: 0;
          color: #475569;
        }
        .chapters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
          margin-top: 24px;
        }
        .chapter-card {
          border-radius: 16px;
          padding: 16px 18px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
          text-align: left;
          cursor: pointer;
          transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
        }
        .chapter-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 32px rgba(20, 83, 45, 0.18);
          border-color: #86efac;
        }
        .chapter-label {
          font-weight: 600;
          color: #0f172a;
        }
        .chapter-meta {
          margin-top: 6px;
          color: #64748b;
          font-size: 13px;
        }
      `}</style>
      <main className="chapters-wrap">
        <h1 className="chapters-title">Danh sách chương</h1>
        <p className="chapters-subtitle">Subject {id} · {subjectName}</p>

        <div className="chapters-grid">
          {chapters.map((c) => (
            <button
              key={c.id}
              className="chapter-card"
              onClick={() => navigate(`/subjects/${id}/chapters/${c.id}/config`)}
            >
              <div className="chapter-label">{c.name}</div>
              <div className="chapter-meta">Tap to configure attempt →</div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
