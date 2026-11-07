import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCcw, Search } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { getUsers } from "../../api/users";
import { assignRoleToUser, getRoles, removeUserRole, type Role } from "../../api/roles";
import type { User } from "../../types/user";

export default function AdminAccountsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleSelections, setRoleSelections] = useState<Record<string, string>>({});
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [userData, roleData] = await Promise.all([
        getUsers(search ? { search } : undefined),
        getRoles(),
      ]);
      setUsers(userData);
      setRoles(roleData);
    } catch {
      setError("Unable to load users.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const roleMap = useMemo(() => {
    const map = new Map<string, Role>();
    roles.forEach((role) => {
      map.set(role.id, role);
      map.set(role.name, role);
    });
    return map;
  }, [roles]);

  const handleAssignRole = async (userId: string) => {
    const roleId = roleSelections[userId];
    if (!roleId) return;
    setUpdatingUserId(userId);
    setError(null);
    try {
      await assignRoleToUser(roleId, userId);
      await loadData();
    } catch {
      setError("Unable to assign role.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleRemoveRole = async (userId: string, roleValue: string) => {
    const roleId = roleMap.get(roleValue)?.id;
    if (!roleId) return;
    setUpdatingUserId(userId);
    setError(null);
    try {
      await removeUserRole(roleId, userId);
      await loadData();
    } catch {
      setError("Unable to remove role.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <AdminLayout
      title="Accounts"
      subtitle="Search accounts and manage their roles."
      actions={
        <button className="admin-button admin-button--muted" onClick={loadData}>
          <RefreshCcw size={16} style={{ marginRight: 6 }} />
          Refresh
        </button>
      }
    >
      <div className="admin-panel" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            className="admin-input"
            style={{ width: "100%", paddingLeft: 36 }}
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="admin-button admin-button--primary" onClick={loadData}>
          Search
        </button>
      </div>

      {error && <div className="admin-panel" style={{ color: "#b91c1c" }}>{error}</div>}

      <div className="admin-panel">
        {loading ? (
          <p style={{ color: "#64748b" }}>Loading accounts...</p>
        ) : users.length === 0 ? (
          <p style={{ color: "#64748b" }}>No users found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Roles</th>
                  <th>Assign Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const userId = String(user.id);
                  const roleList = user.roles || (user.role ? [user.role] : []);
                  return (
                    <tr key={userId}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {roleList.length === 0 && <span className="admin-tag">No roles</span>}
                          {roleList.map((roleValue) => {
                            const roleId = roleMap.get(roleValue)?.id;
                            return (
                              <span key={roleValue} className="admin-tag" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                {roleValue}
                                {roleId && (
                                  <button
                                    style={{ border: "none", background: "transparent", cursor: "pointer" }}
                                    onClick={() => handleRemoveRole(userId, roleValue)}
                                    disabled={updatingUserId === userId}
                                  >
                                    ✕
                                  </button>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <select
                            className="admin-input"
                            value={roleSelections[userId] || ""}
                            onChange={(e) =>
                              setRoleSelections((prev) => ({ ...prev, [userId]: e.target.value }))
                            }
                          >
                            <option value="">Select role</option>
                            {roles.map((role) => (
                              <option key={role.id} value={role.id}>
                                {role.name}
                              </option>
                            ))}
                          </select>
                          <button
                            className="admin-button admin-button--primary"
                            onClick={() => handleAssignRole(userId)}
                            disabled={!roleSelections[userId] || updatingUserId === userId}
                          >
                            Assign
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
