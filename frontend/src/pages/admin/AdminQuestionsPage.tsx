import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import QuestionImportExportModal from "../../components/QuestionImportExportModal";
import { getChapterById } from "../../api/chapters";
import {
  createQuestionWithOptions,
  deleteQuestion,
  getQuestionsByChapter,
  updateQuestion,
} from "../../api/questions";
import { createOption, deleteOption, getOptionsByQuestion, updateOption } from "../../api/options";
import type { QuestionType } from "../../types/question";
import type { Option } from "../../types/options";

type QuestionFormType = Extract<QuestionType, "single" | "multiple" | "true_false">;

type OptionForm = Option & {
  id: string;
};

type QuestionItem = {
  id: string;
  text: string;
  type: QuestionFormType;
  options: OptionForm[];
};

export default function AdminQuestionsPage() {
  const { id: chapterId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [chapterName, setChapterName] = useState("...");
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [originalOptionIds, setOriginalOptionIds] = useState<string[]>([]);
  const [formData, setFormData] = useState<{
    text: string;
    type: QuestionFormType;
    options: OptionForm[];
  }>({
    text: "",
    type: "single",
    options: [
      { id: "temp-1", text: "", isCorrect: true, order: 1 },
      { id: "temp-2", text: "", isCorrect: false, order: 2 },
    ],
  });

  const loadData = async () => {
    if (!chapterId) return;
    setLoading(true);
    setError(null);
    try {
      const [chapterData, questionData] = await Promise.all([
        getChapterById(chapterId),
        getQuestionsByChapter(chapterId),
      ]);
      setChapterName(chapterData.name || "Chapter");
      setSubjectId(chapterData.subjectId || null);

      const questionsWithOptions = await Promise.all(
        questionData.map(async (question) => {
          const options = await getOptionsByQuestion(question.id);
          return {
            id: question.id,
            text: question.text,
            type: (question.type || "single") as QuestionFormType,
            options: options.map((option) => ({
              ...option,
              id: option.id,
            })),
          } as QuestionItem;
        })
      );
      setQuestions(questionsWithOptions);
    } catch {
      setError("Unable to load questions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [chapterId]);

  const handleOpenModal = (question?: QuestionItem) => {
    if (question) {
      setFormData({
        text: question.text,
        type: question.type,
        options: question.options,
      });
      setEditingId(question.id);
      setOriginalOptionIds(question.options.map((option) => option.id));
      setIsEditing(true);
    } else {
      setFormData({
        text: "",
        type: "single",
        options: [
          { id: `temp-${Date.now()}`, text: "", isCorrect: true, order: 1 },
          { id: `temp-${Date.now() + 1}`, text: "", isCorrect: false, order: 2 },
        ],
      });
      setIsEditing(false);
      setEditingId(null);
      setOriginalOptionIds([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleCloseImportExport = () => {
    setIsImportExportOpen(false);
  };

  const handleAddOption = () => {
    const newOption: OptionForm = {
      id: `temp-${Date.now()}`,
      text: "",
      isCorrect: false,
      order: formData.options.length + 1,
    };
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, newOption],
    }));
  };

  const handleRemoveOption = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((opt) => opt.id !== id),
    }));
  };

  const handleOptionChange = (id: string, field: keyof OptionForm, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt) =>
        opt.id === id ? { ...opt, [field]: value } : opt
      ),
    }));
  };

  const handleSetCorrectOption = (id: string) => {
    if (formData.type === "single" || formData.type === "true_false") {
      setFormData((prev) => ({
        ...prev,
        options: prev.options.map((opt) => ({
          ...opt,
          isCorrect: opt.id === id,
        })),
      }));
    } else {
      // For multiple choice, toggle the correct status
      setFormData((prev) => ({
        ...prev,
        options: prev.options.map((opt) =>
          opt.id === id ? { ...opt, isCorrect: !opt.isCorrect } : opt
        ),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.text.trim()) {
      alert("Question text is required");
      return;
    }

    if (formData.options.length < 2) {
      alert("At least 2 options are required");
      return;
    }

    if (!formData.options.some((opt) => opt.isCorrect)) {
      alert("At least one option must be marked as correct");
      return;
    }

    if (!chapterId || !subjectId) return;

    try {
      if (isEditing && editingId) {
        await updateQuestion(editingId, {
          text: formData.text.trim(),
          type: formData.type,
        });

        const currentIds = new Set(
          formData.options.filter((opt) => !opt.id.startsWith("temp-")).map((opt) => opt.id)
        );

        await Promise.all(
          originalOptionIds
            .filter((id) => !currentIds.has(id))
            .map((id) => deleteOption(id))
        );

        await Promise.all(
          formData.options.map((option, index) => {
            const payload = {
              text: option.text,
              isCorrect: option.isCorrect,
              order: index + 1,
            };
            if (option.id.startsWith("temp-")) {
              return createOption(editingId, payload);
            }
            return updateOption(option.id, payload);
          })
        );
      } else {
        await createQuestionWithOptions({
          subjectId,
          chapterId,
          type: formData.type,
          text: formData.text.trim(),
          explanation: "",
          difficulty: 1,
          points: 1,
          media: [],
          tags: [],
          options: formData.options.map((option, index) => ({
            text: option.text,
            isCorrect: option.isCorrect,
            order: index + 1,
          })),
        });
      }

      handleCloseModal();
      await loadData();
    } catch {
      setError("Unable to save question.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    setError(null);
    try {
      await deleteQuestion(id);
      await loadData();
    } catch {
      setError("Unable to delete question.");
    }
  };

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case "single":
        return "Single Choice";
      case "multiple":
        return "Multiple Choice";
      case "true_false":
        return "True/False";
    }
  };

  return (
    <AdminLayout
      title="Questions"
      subtitle={`Manage questions for ${chapterName}.`}
      actions={
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="admin-button admin-button--muted" onClick={() => setIsImportExportOpen(true)}>
            Import / Export
          </button>
          <button className="admin-button admin-button--primary" onClick={() => handleOpenModal()}>
            <Plus size={18} style={{ marginRight: 6 }} />
            Add Question
          </button>
        </div>
      }
    >
      {error && <div className="admin-panel" style={{ color: "#b91c1c" }}>{error}</div>}
      <div className="admin-panel" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button
          onClick={() => navigate("/admin/subjects")}
          className="admin-button admin-button--muted"
        >
          <ChevronLeft size={16} style={{ marginRight: 6 }} />
          Subjects
        </button>
        <ChevronRight size={16} color="#94a3b8" />
        <button
          onClick={() =>
            subjectId ? navigate(`/admin/subjects/${subjectId}/chapters`) : navigate(-1)
          }
          className="admin-button admin-button--muted"
        >
          Chapters
        </button>
        <ChevronRight size={16} color="#94a3b8" />
        <span style={{ fontWeight: 600 }}>{chapterName}</span>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {loading ? (
          <div className="admin-panel" style={{ textAlign: "center", color: "#64748b" }}>
            Loading questions...
          </div>
        ) : questions.length === 0 ? (
          <div className="admin-panel" style={{ textAlign: "center", color: "#64748b" }}>
            No questions found. Click "Add Question" to create one.
          </div>
        ) : (
          questions.map((question) => (
            <div key={question.id} className="admin-panel">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span className="admin-tag">{getQuestionTypeLabel(question.type)}</span>
                    <span style={{ color: "#94a3b8", fontSize: 13 }}>Q#{question.id}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 12 }}>{question.text}</div>

                  <div style={{ display: "grid", gap: 8, marginLeft: 8 }}>
                    {question.options.map((option) => (
                      <div
                        key={option.id}
                        style={{
                          display: "flex",
                          gap: 10,
                          padding: 10,
                          borderRadius: 12,
                          border: `1px solid ${option.isCorrect ? "#16a34a" : "#e2e8f0"}`,
                          background: option.isCorrect ? "#f0fdf4" : "#f8fafc",
                        }}
                      >
                        <input type="checkbox" checked={option.isCorrect} readOnly disabled style={{ marginTop: 4 }} />
                        <div>
                          <div style={{ fontWeight: 600, color: option.isCorrect ? "#16a34a" : "#475569" }}>
                            {option.text}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button className="admin-button admin-button--muted" onClick={() => handleOpenModal(question)}>
                    <Edit2 size={16} style={{ marginRight: 6 }} />
                    Edit
                  </button>
                  <button className="admin-button admin-button--danger" onClick={() => handleDelete(question.id)}>
                    <Trash2 size={16} style={{ marginRight: 6 }} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h2 style={{ margin: 0 }}>{isEditing ? "Edit Question" : "Add New Question"}</h2>
              <button onClick={handleCloseModal} className="admin-button admin-button--muted">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
                  Question Text
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      text: e.target.value,
                    }))
                  }
                  placeholder="Enter the question text"
                  rows={3}
                  className="admin-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
                  Question Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    const newType = e.target.value as QuestionFormType;
                    if (newType === "true_false") {
                      setFormData((prev) => ({
                        ...prev,
                        type: newType,
                        options: [
                          {
                            id: `temp-${Date.now()}`,
                            text: "True",
                            isCorrect: true,
                            order: 1,
                          },
                          {
                            id: `temp-${Date.now() + 1}`,
                            text: "False",
                            isCorrect: false,
                            order: 2,
                          },
                        ],
                      }));
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        type: newType,
                      }));
                    }
                  }}
                  className="admin-input"
                  style={{ width: "100%" }}
                >
                  <option value="single">Single Choice</option>
                  <option value="multiple">Multiple Choice</option>
                  <option value="true_false">True/False</option>
                </select>
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <label style={{ fontWeight: 600 }}>Options</label>
                  {formData.type !== "trueFalse" && (
                    <button type="button" onClick={handleAddOption} className="admin-button admin-button--muted">
                      <Plus size={16} style={{ marginRight: 6 }} />
                      Add Option
                    </button>
                  )}
                </div>

                <div style={{ display: "grid", gap: 12 }}>
                  {formData.options.map((option, index) => (
                    <div key={option.id} style={{ display: "grid", gap: 8 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <input
                          type={formData.type === "multiple" ? "checkbox" : "radio"}
                          checked={option.isCorrect}
                          onChange={() => handleSetCorrectOption(option.id)}
                        />
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => handleOptionChange(option.id, "text", e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          disabled={formData.type === "trueFalse"}
                          className="admin-input"
                          style={{ flex: 1 }}
                        />
                        {formData.type !== "trueFalse" && formData.options.length > 2 && (
                          <button type="button" onClick={() => handleRemoveOption(option.id)} className="admin-button admin-button--muted">
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={handleCloseModal} className="admin-button admin-button--muted" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="admin-button admin-button--primary" style={{ flex: 1 }}>
                  {isEditing ? "Update Question" : "Create Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isImportExportOpen && (
        <QuestionImportExportModal
          isOpen={isImportExportOpen}
          subjectId={subjectId}
          chapterId={chapterId ?? null}
          onClose={handleCloseImportExport}
          onImported={loadData}
        />
      )}
    </AdminLayout>
  );
}
