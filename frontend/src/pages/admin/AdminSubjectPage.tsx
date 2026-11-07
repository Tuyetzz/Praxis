import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2, ChevronRight } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { createSubject, deleteSubject, getSubjects, restoreSubject, updateSubject } from "../../api/subjects";
import type { Subject } from "../../types/subject";

export default function AdminSubjectPage() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "", order: 1 });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSubjects(showDeleted ? { includeDeleted: true } : undefined);
      setSubjects(data);
    } catch {
      setError("Unable to load subjects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [showDeleted]);

  const handleOpenModal = (subject?: Subject) => {
    if (subject) {
      setFormData({ name: subject.name, slug: subject.slug, order: subject.order ?? 1 });
      setEditingId(subject.id);
      setIsEditing(true);
    } else {
      setFormData({ name: "", slug: "", order: 1 });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", slug: "", order: 1 });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Subject name is required");
      return;
    }

    try {
      if (isEditing && editingId) {
        await updateSubject(editingId, {
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          order: Number(formData.order) || 1,
        });
      } else {
        await createSubject({
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          order: Number(formData.order) || 1,
        });
      }
      handleCloseModal();
      await loadData();
    } catch {
      setError("Unable to save subject.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subject?")) return;
    setError(null);
    try {
      await deleteSubject(id);
      await loadData();
    } catch {
      setError("Unable to delete subject.");
    }
  };

  const handleRestore = async (id: string) => {
    if (!confirm("Restore this subject?")) return;
    setError(null);
    try {
      await restoreSubject(id);
      await loadData();
    } catch {
      setError("Unable to restore subject.");
    }
  };

  const handleNavigate = (subjectId: string) => {
    navigate(`/admin/subjects/${subjectId}/chapters`);
  };

  return (
    <AdminLayout
      title="Subjects"
      subtitle="Manage all subjects and their chapters."
      actions={
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="admin-button admin-button--primary" onClick={() => handleOpenModal()}>
            <Plus size={18} style={{ marginRight: 6 }} />
            Add Subject
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
      <div className="admin-panel">
        {loading ? (
          <div style={{ textAlign: "center", padding: "28px 0", color: "#64748b" }}>
            Loading subjects...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Subject Name</th>
                  <th>Slug</th>
                  <th>Order</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject.id} style={{ opacity: subject.isDeleted ? 0.6 : 1 }}>
                    <td>
                      <button
                        onClick={() => handleNavigate(subject.id)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          color: "#0f766e",
                          fontWeight: 600,
                        }}
                      >
                        {subject.name}
                        <ChevronRight size={16} />
                      </button>
                      {subject.isDeleted && (
                        <span className="admin-tag" style={{ marginLeft: 8 }}>
                          Deleted
                        </span>
                      )}
                    </td>
                    <td>{subject.slug}</td>
                    <td>
                      <span className="admin-pill">{subject.order}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                        {subject.isDeleted ? (
                          <button
                            onClick={() => handleRestore(subject.id)}
                            className="admin-button admin-button--muted"
                          >
                            Restore
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleOpenModal(subject)}
                              className="admin-button admin-button--muted"
                            >
                              <Edit2 size={16} style={{ marginRight: 6 }} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(subject.id)}
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
        {!loading && subjects.length === 0 && (
          <div style={{ textAlign: "center", padding: "28px 0", color: "#64748b" }}>
            No subjects found. Click "Add Subject" to create one.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <h2 style={{ marginTop: 0 }}>{isEditing ? "Edit Subject" : "Add New Subject"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
                  Subject Name
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
                  placeholder="e.g., Mathematics"
                  className="admin-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      slug: e.target.value,
                    }))
                  }
                  placeholder="e.g., mathematics"
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
                  className="admin-input"
                  style={{ width: "100%" }}
                  min={1}
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
