import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import AdminLayout from "./AdminLayout";
import {
  createRole,
  deleteRole,
  getRoles,
  restoreRole,
  updateRole,
  type Role,
} from "../../api/roles";

type RoleForm = {
  name: string;
  description: string;
};

const EMPTY_FORM: RoleForm = {
  name: "",
  description: "",
};

export default function AdminRolePermissionPage() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<RoleForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const rolesData = await getRoles(showDeleted ? { includeDeleted: true } : undefined);
      setRoles(rolesData);
    } catch {
      setError("Unable to load roles.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [showDeleted]);

  const handleEdit = (role: Role) => {
    setEditingId(role.id);
    setForm({
      name: role.name,
      description: role.description || "",
    });
  };

  const handleDelete = async (role: Role) => {
    if (!window.confirm(`Delete role "${role.name}"?`)) return;
    setError(null);
    try {
      await deleteRole(role.id);
      await loadData();
    } catch {
      setError("Unable to delete role.");
    }
  };

  const handleRestore = async (role: Role) => {
    if (!window.confirm(`Restore role "${role.name}"?`)) return;
    setError(null);
    try {
      await restoreRole(role.id);
      await loadData();
    } catch {
      setError("Unable to restore role.");
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Role name is required.");
      return;
    }

    setError(null);
    setSaving(true);
    try {
      if (editingId) {
        await updateRole(editingId, { name: form.name.trim(), description: form.description.trim() });
      } else {
        await createRole({ name: form.name.trim(), description: form.description.trim() });
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      await loadData();
    } catch {
      setError("Unable to save role.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Roles"
      subtitle="Create and manage roles."
      actions={
        <button
          className="admin-button admin-button--muted"
          onClick={() => setShowDeleted((prev) => !prev)}
        >
          {showDeleted ? "Hide Deleted" : "Show Deleted"}
        </button>
      }
    >
      {error && <div className="admin-panel" style={{ color: "#b91c1c" }}>{error}</div>}

      <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        <div className="admin-panel">
          <div style={{ fontWeight: 600, marginBottom: 10 }}>
            {editingId ? "Update Role" : "Create Role"}
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            <input
              className="admin-input"
              placeholder="Role name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <textarea
              className="admin-input"
              style={{ minHeight: 100 }}
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <button className="admin-button admin-button--primary" onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Save Changes" : "Create Role"}
            </button>
            {editingId && (
              <button className="admin-button admin-button--muted" onClick={() => {
                setEditingId(null);
                setForm(EMPTY_FORM);
              }}>
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="admin-panel">
          <div style={{ fontWeight: 600, marginBottom: 10 }}>Roles</div>
          {loading ? (
            <p style={{ color: "#64748b" }}>Loading roles...</p>
          ) : roles.length === 0 ? (
            <p style={{ color: "#64748b" }}>No roles created yet.</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {roles.map((role) => (
                <div
                  key={role.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: 12,
                    display: "grid",
                    gap: 6,
                    background: "#ffffff",
                    opacity: role.isDeleted ? 0.6 : 1,
                  }}
                >
                  <button
                    style={{ textAlign: "left", fontWeight: 600 }}
                    onClick={() => navigate(`/admin/roles/${role.id}/permissions`)}
                  >
                    {role.name}
                  </button>
                  <div style={{ color: "#64748b", fontSize: 14 }}>{role.description || "No description"}</div>
                  {role.isDeleted && <span className="admin-tag">Deleted</span>}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {role.isDeleted ? (
                      <button className="admin-button admin-button--muted" onClick={() => handleRestore(role)}>
                        Restore
                      </button>
                    ) : (
                      <>
                        <button className="admin-button admin-button--muted" onClick={() => handleEdit(role)}>
                          <Pencil size={14} style={{ marginRight: 6 }} />
                          Edit
                        </button>
                        <button className="admin-button admin-button--danger" onClick={() => handleDelete(role)}>
                          <Trash2 size={14} style={{ marginRight: 6 }} />
                          Delete
                        </button>
                        <button
                          className="admin-button admin-button--primary"
                          onClick={() => navigate(`/admin/roles/${role.id}/permissions`)}
                        >
                          Permissions
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
