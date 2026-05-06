import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSubjects } from "../../../api/subjects";
import type { Subject } from "../../../types/subject";
import AppHeader from "../../../components/AppHeader";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getSubjects()
      .then((data) => setSubjects(data))
      .catch((err) => console.error("Lỗi khi load subjects:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Đang tải danh sách môn...</div>;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 10% 10%, #ecfeff 0%, #fff7ed 55%, #ffffff 100%)",
        color: "#0f172a",
        fontFamily: '"Space Grotesk", "IBM Plex Sans", sans-serif',
      }}
    >
      <AppHeader />
      <style>{`
        .subjects-wrap {
          max-width: 900px;
          margin: 28px auto 60px;
          padding: 0 20px 40px;
        }
        .subjects-title {
          font-size: clamp(26px, 3vw, 36px);
          margin: 0 0 6px;
        }
        .subjects-subtitle {
          margin: 0;
          color: #475569;
        }
        .subjects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-top: 24px;
        }
        .subject-card {
          border-radius: 16px;
          padding: 16px 18px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
          text-align: left;
          cursor: pointer;
          transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
        }
        .subject-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 32px rgba(14, 116, 144, 0.18);
          border-color: #5eead4;
        }
        .subject-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #0f172a;
        }
        .subject-meta {
          margin-top: 6px;
          color: #64748b;
          font-size: 13px;
        }
      `}</style>
      <main className="subjects-wrap">
        <h1 className="subjects-title">Danh sách môn</h1>
        <p className="subjects-subtitle">Chọn môn để xem chương và tạo lượt làm bài.</p>

        <div className="subjects-grid">
          {subjects.map((s) => (
            <button
              key={s.id}
              className="subject-card"
              onClick={() => navigate(`/subjects/${s.id}/chapters`)}
            >
              <div className="subject-label">{s.name}</div>
              <div className="subject-meta">Tap to view chapters →</div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
