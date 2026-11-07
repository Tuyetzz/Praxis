import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2, ChevronRight, ChevronLeft } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { createChapter, deleteChapter, getChaptersBySubject, restoreChapter, updateChapter } from "../../api/chapters";
import { getSubjectById } from "../../api/subjects";
import type { Chapter } from "../../types/chapter";

export default function AdminChapterPage() {
  const { id: subjectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [subjectName, setSubjectName] = useState("...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", order: 1 });

  const loadData = async () => {
    if (!subjectId) return;
    setLoading(true);
    setError(null);
    try {
      const [chapterData, subjectData] = await Promise.all([
        getChaptersBySubject(subjectId, showDeleted ? { includeDeleted: true } : undefined),
        getSubjectById(subjectId).catch(() => null)
      ]);
      setChapters(chapterData);
      setSubjectName(subjectData?.name || "Subject");
    } catch {
      setError("Unable to load chapters.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [subjectId, showDeleted]);

  const handleOpenModal = (chapter?: Chapter) => {
    if (chapter) {
      setFormData({
        name: chapter.name,
        order: chapter.order ?? 1,
      });
      setEditingId(chapter.id);
      setIsEditing(true);
    } else {
      setFormData({ name: "", order: 1 });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", order: 1 });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Chapter name is required");
      return;
    }

    if (!subjectId) return;

    try {
      if (isEditing && editingId) {
        await updateChapter(editingId, {
          name: formData.name.trim(),
          order: Number(formData.order) || 1,
          subjectId,
        });
      } else {
        await createChapter({
          name: formData.name.trim(),
          order: Number(formData.order) || 1,
          subjectId,
        });
      }
      handleCloseModal();
      await loadData();
    } catch {
      setError("Unable to save chapter.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this chapter?")) return;
    setError(null);
    try {
      await deleteChapter(id);
      await loadData();
    } catch {
      setError("Unable to delete chapter.");
    }
  };

  const handleRestore = async (id: string) => {
    if (!confirm("Restore this chapter?")) return;
    setError(null);
    try {
      await restoreChapter(id);
      await loadData();
    } catch {
      setError("Unable to restore chapter.");
    }
  };

  const handleNavigateToQuestions = (chapterId: string) => {
    navigate(`/admin/chapters/${chapterId}/questions`);
  };

  return (
    <AdminLayout
      title="Chapters"
      subtitle={`Manage chapters for ${subjectName}.`}
      actions={
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="admin-button admin-button--primary" onClick={() => handleOpenModal()}>
            <Plus size={18} style={{ marginRight: 6 }} />
            Add Chapter
          </button>
          <button
            className="admin-button admin-button--muted"
            onClick={() => setShowDeleted((prev) => !prev)}
          >
            {showDeleted ? "Hide Deleted" : "Show Deleted"}
          </button>
        </div>
      }
    >
      {error && <div className="admin-panel" style={{ color: "#b91c1c" }}>{error}</div>}
      <div className="admin-panel" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={() => navigate("/admin/subjects")}
          className="admin-button admin-button--muted"
        >
          <ChevronLeft size={16} style={{ marginRight: 6 }} />
          Subjects
        </button>
        <ChevronRight size={16} color="#94a3b8" />
        <span style={{ fontWeight: 600 }}>{subjectName}</span>
      </div>

      <div className="admin-panel">
        {loading ? (
          <div style={{ textAlign: "center", padding: "28px 0", color: "#64748b" }}>
            Loading chapters...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Chapter Name</th>
                  <th>Order</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {chapters.map((chapter) => (
                  <tr key={chapter.id} style={{ opacity: chapter.isDeleted ? 0.6 : 1 }}>
                    <td>
                      <button
                        onClick={() => handleNavigateToQuestions(chapter.id)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          color: "#0f766e",
                          fontWeight: 600,
                        }}
                      >
                        {chapter.name}
                        <ChevronRight size={16} />
                      </button>
                      {chapter.isDeleted && (
                        <span className="admin-tag" style={{ marginLeft: 8 }}>
                          Deleted
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="admin-pill">{chapter.order}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                        {chapter.isDeleted ? (
                          <button
                            onClick={() => handleRestore(chapter.id)}
                            className="admin-button admin-button--muted"
                          >
                            Restore
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleOpenModal(chapter)}
                              className="admin-button admin-button--muted"
                            >
                              <Edit2 size={16} style={{ marginRight: 6 }} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(chapter.id)}
                              className="admin-button admin-button--danger"
                            >
                              <Trash2 size={16} style={{ marginRight: 6 }} />
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && chapters.length === 0 && (
          <div style={{ textAlign: "center", padding: "28px 0", color: "#64748b" }}>
            No chapters found. Click "Add Chapter" to create one.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <h2 style={{ marginTop: 0 }}>{isEditing ? "Edit Chapter" : "Add New Chapter"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
                  Chapter Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="e.g., Basic Algebra"
                  className="admin-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      order: Number(e.target.value) || 1,
                    }))
                  }
                  min={1}
                  className="admin-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={handleCloseModal} className="admin-button admin-button--muted" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="admin-button admin-button--primary" style={{ flex: 1 }}>
                  {isEditing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
