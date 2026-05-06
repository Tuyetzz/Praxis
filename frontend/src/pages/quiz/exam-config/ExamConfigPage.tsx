import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { startAttempt } from "../../../api/attempts";
import { getChapterById, getChapterQuestionCount } from "../../../api/chapters";
import { getSubjectById } from "../../../api/subjects";
import AppHeader from "../../../components/AppHeader";

export default function ExamConfigPage() {
  const { id: subjectIdParam, chapterId: chapterIdParam } = useParams();
  const navigate = useNavigate();

  // mode
  const [mode, setMode] = useState<"exam" | "practice">("practice");

  // common
  const [pageSize, setPageSize] = useState(50);
  const [questionsPerPage, setQuestionsPerPage] = useState(10);
  const [questionTimeSeconds, setQuestionTimeSeconds] = useState(30);
  const [showAnswerAfterSelect, setShowAnswerAfterSelect] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(2);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subjectName, setSubjectName] = useState("");
  const [chapterName, setChapterName] = useState("");
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const [countError, setCountError] = useState<string | null>(null);
  const [selectedChunkIndex, setSelectedChunkIndex] = useState(0);

  useEffect(() => {
    if (mode === "exam") {
      setShowAnswerAfterSelect(false);
    }
    if (mode === "practice") {
      setShuffleQuestions(false);
    }
  }, [mode]);

  const chunks = useMemo(() => {
    if (!totalQuestions || !pageSize) return [] as Array<{ start: number; end: number }>;
    const parts: Array<{ start: number; end: number }> = [];
    let start = 1;
    while (start <= totalQuestions) {
      const end = Math.min(start + pageSize - 1, totalQuestions);
      parts.push({ start, end });
      start = end + 1;
    }
    return parts;
  }, [pageSize, totalQuestions]);

  const selectedChunk = chunks[selectedChunkIndex];
  const chunkRequest = selectedChunk
    ? { limit: pageSize, offset: selectedChunk.start - 1 }
    : { limit: pageSize, offset: 0 };

  useEffect(() => {
    if (!subjectIdParam) return;
    getSubjectById(subjectIdParam)
      .then((subject) => setSubjectName(subject.name))
      .catch(() => setSubjectName(""));
  }, [subjectIdParam]);

  useEffect(() => {
    if (!chapterIdParam) return;
    getChapterById(chapterIdParam)
      .then((chapter) => setChapterName(chapter.name))
      .catch(() => setChapterName(""));
  }, [chapterIdParam]);

  useEffect(() => {
    if (!chapterIdParam) return;
    setLoadingCount(true);
    setCountError(null);
    getChapterQuestionCount(chapterIdParam)
      .then((res) => setTotalQuestions(res.totalQuestions))
      .catch(() => setCountError("Không lấy được số lượng câu hỏi."))
      .finally(() => setLoadingCount(false));
  }, [chapterIdParam]);

  useEffect(() => {
    if (chunks.length > 0) {
      setSelectedChunkIndex(0);
    }
  }, [chunks.length]);

  async function handleStart() {
    if (!subjectIdParam || !chapterIdParam) {
      setError("Thiếu hoặc sai subjectId/chapterId trên URL.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const settings: {
        paging?: string;
        questionsPerPage?: number;
        questionTimeSeconds?: number;
        showAnswerAfterSelect?: boolean;
        shuffleQuestions?: boolean;
      } = {};

      if (selectedChunk) settings.paging = `${selectedChunk.start}-${selectedChunk.end}`;
      if (questionsPerPage > 0) settings.questionsPerPage = questionsPerPage;
      if (questionTimeSeconds > 0) settings.questionTimeSeconds = questionTimeSeconds;
      settings.showAnswerAfterSelect = mode === "practice" ? showAnswerAfterSelect : false;
      settings.shuffleQuestions = mode === "exam" ? shuffleQuestions : false;

      const payload = {
        subjectId: subjectIdParam,
        chapterId: chapterIdParam,
        mode,
        settings,
        durationMinutes: durationMinutes > 0 ? durationMinutes : undefined,
      };

      const res = await startAttempt(payload);
      navigate(`/attempts/${res.attempt.id}`);
    } catch (e: unknown) {
      const message =
        typeof e === "object" &&
        e &&
        "response" in e &&
        typeof (e as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Không tạo được attempt.";
      setError(message || "Không tạo được attempt.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 12% 10%, #fef9c3 0%, #e0f2fe 55%, #ffffff 100%)",
        color: "#0f172a",
        fontFamily: '"Space Grotesk", "IBM Plex Sans", sans-serif',
      }}
    >
      <AppHeader />
      <style>{`
        .exam-wrap {
          max-width: 760px;
          margin: 28px auto 60px;
          padding: 0 20px 40px;
        }
        .exam-title {
          font-size: clamp(26px, 3vw, 36px);
          margin: 0 0 6px;
        }
        .exam-subtitle {
          margin: 0 0 18px;
          color: #475569;
        }
        .exam-panel {
          background: #ffffff;
          border-radius: 18px;
          padding: 20px 22px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
          display: grid;
          gap: 16px;
        }
        .exam-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 14px;
        }
        .exam-field label {
          font-weight: 600;
          display: block;
          margin-bottom: 8px;
        }
        .exam-input,
        .exam-select {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #cbd5f5;
          background: #f8fafc;
        }
        .exam-input:focus,
        .exam-select:focus {
          outline: none;
          border-color: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.18);
        }
        .exam-toggle {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          color: #1e293b;
        }
        .exam-hint {
          margin-top: 4px;
          color: #64748b;
          font-size: 12px;
        }
        .exam-error {
          background: #fef2f2;
          color: #b91c1c;
          padding: 10px;
          border-radius: 10px;
          font-size: 13px;
        }
        .exam-button {
          padding: 11px 18px;
          border-radius: 12px;
          border: none;
          background: #0f172a;
          color: #ffffff;
          font-weight: 600;
          cursor: pointer;
          width: fit-content;
          transition: transform 160ms ease, box-shadow 160ms ease;
        }
        .exam-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .exam-button:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(15, 23, 42, 0.2);
        }
      `}</style>
      <main className="exam-wrap">
        <h1 className="exam-title">Cấu hình lượt làm bài</h1>
        <p className="exam-subtitle">
          {subjectName || "Đang tải môn học..."} · {chapterName || "Đang tải chương..."}
        </p>

        <div className="exam-panel">
          <div className="exam-field">
            <label htmlFor="exam-mode">Chế độ</label>
            <select
              id="exam-mode"
              className="exam-select"
              value={mode}
              onChange={(e) => setMode(e.target.value as "exam" | "practice")}
            >
              <option value="exam">Thi (Exam)</option>
              <option value="practice">Luyện tập (Practice)</option>
            </select>
          </div>

          <div className="exam-field">
            <label>Tổng số câu hỏi</label>
            <div className="exam-hint">
              {loadingCount ? "Đang tải..." : totalQuestions ?? "-"}
            </div>
            {countError && <div className="exam-error">{countError}</div>}
          </div>

          <div className="exam-grid">
            <div className="exam-field">
              <label htmlFor="page-size">Số lượng câu mỗi bộ</label>
              <select
                id="page-size"
                className="exam-select"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                <option value={2}>2</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <div className="exam-hint">Chia câu hỏi thành các bộ để dễ chọn.</div>
            </div>

            <div className="exam-field">
              <label htmlFor="questions-per-page">Questions / page</label>
              <input
                id="questions-per-page"
                className="exam-input"
                type="number"
                value={questionsPerPage}
                onChange={(e) => setQuestionsPerPage(Number(e.target.value || 0))}
                min={1}
              />
            </div>

            <div className="exam-field">
              <label htmlFor="question-time">Question time (seconds)</label>
              <input
                id="question-time"
                className="exam-input"
                type="number"
                value={questionTimeSeconds}
                onChange={(e) => setQuestionTimeSeconds(Number(e.target.value || 0))}
                min={1}
              />
            </div>

            <div className="exam-field">
              <label htmlFor="duration-minutes">Duration (minutes)</label>
              <input
                id="duration-minutes"
                className="exam-input"
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value || 0))}
                min={1}
              />
            </div>
          </div>

          <div className="exam-field">
            <label>Chọn bộ câu hỏi</label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              {chunks.length === 0 ? (
                <div className="exam-hint">Chưa có dữ liệu.</div>
              ) : (
                chunks.map((chunk, index) => {
                  const isActive = index === selectedChunkIndex;
                  return (
                    <button
                      key={`${chunk.start}-${chunk.end}`}
                      type="button"
                      onClick={() => setSelectedChunkIndex(index)}
                      style={{
                        borderRadius: 12,
                        border: `1px solid ${isActive ? "#0f172a" : "#e2e8f0"}`,
                        padding: "8px 12px",
                        background: isActive ? "#0f172a" : "#ffffff",
                        color: isActive ? "#ffffff" : "#0f172a",
                        cursor: "pointer",
                        fontWeight: 600,
                        transition: "all 160ms ease",
                      }}
                    >
                      {chunk.start} - {chunk.end}
                    </button>
                  );
                })
              )}
            </div>
            <div className="exam-hint">
              Output: limit {chunkRequest.limit}, offset {chunkRequest.offset}
            </div>
          </div>

          <label className="exam-toggle">
            <input
              type="checkbox"
              checked={shuffleQuestions}
              onChange={(e) => setShuffleQuestions(e.target.checked)}
            />
            Shuffle câu hỏi
          </label>

          <label className="exam-toggle">
            <input
              type="checkbox"
              checked={showAnswerAfterSelect}
              onChange={(e) => setShowAnswerAfterSelect(e.target.checked)}
              disabled={mode !== "practice"}
            />
            Hiển thị đáp án ngay sau khi chọn
          </label>
          <div className="exam-hint">
            Chỉ áp dụng cho chế độ luyện tập (Practice).
          </div>

          {error && <div className="exam-error">{error}</div>}

          <button className="exam-button" onClick={handleStart} disabled={submitting || !selectedChunk}>
            {submitting ? "Đang tạo..." : "Bắt đầu"}
          </button>
        </div>
      </main>
    </div>
  );
}
