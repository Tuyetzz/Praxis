import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import AdminLayout from "./AdminLayout";
import {
  assignRolePermission,
  getRolePermissions,
  getRoles,
  removeRolePermission,
  type Role,
} from "../../api/roles";
import { getPermissions, type Permission } from "../../api/permissions";

type PermissionGroup = {
  key: string;
  label: string;
  permissions: Permission[];
};

const ACTION_ORDER = ["view", "create", "update", "delete", "submit", "manage"];

const toTitleCase = (value: string) =>
  value
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const parsePermission = (permission: Permission) => {
  const raw = permission.slug || permission.name || "";

  if (raw.includes(":")) {
    const [resource, action] = raw.split(":");
    return {
      resourceKey: resource || "other",
      actionKey: action || "",
      resourceLabel: toTitleCase(resource || "Other"),
      actionLabel: toTitleCase(action || "Other"),
    };
  }

  const nameParts = raw.split(" ").filter(Boolean);
  const actionCandidate = nameParts[nameParts.length - 1] || "";
  const resourceCandidate = nameParts.slice(0, -1).join(" ") || raw;

  return {
    resourceKey: resourceCandidate.toLowerCase().replace(/\s+/g, "_"),
    actionKey: actionCandidate.toLowerCase(),
    resourceLabel: toTitleCase(resourceCandidate || "Other"),
    actionLabel: toTitleCase(actionCandidate || "Other"),
  };
};

export default function AdminRolePermissionsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingPermissionId, setUpdatingPermissionId] = useState<string | null>(null);

  const roleId = id || null;

  const loadData = async () => {
    if (!roleId) return;
    setLoading(true);
    setError(null);
    try {
      const [rolesData, permissionsData, rolePermissionsData] = await Promise.all([
        getRoles(),
        getPermissions(),
        getRolePermissions(roleId),
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
      setRolePermissions(rolePermissionsData);
    } catch {
      setError("Unable to load permissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [roleId]);

  const rolePermissionIds = useMemo(
    () => new Set(rolePermissions.map((perm) => perm.id)),
    [rolePermissions]
  );

  const groupedPermissions = useMemo(() => {
    const map = new Map<string, PermissionGroup>();

    permissions.forEach((permission) => {
      const parsed = parsePermission(permission);
      const existing = map.get(parsed.resourceKey);
      if (existing) {
        existing.permissions.push(permission);
      } else {
        map.set(parsed.resourceKey, {
          key: parsed.resourceKey,
          label: parsed.resourceLabel,
          permissions: [permission],
        });
      }
    });

    return Array.from(map.values()).
      map((group) => {
        const ordered = [...group.permissions].sort((a, b) => {
          const aParsed = parsePermission(a);
          const bParsed = parsePermission(b);
          const aIndex = ACTION_ORDER.indexOf(aParsed.actionKey);
          const bIndex = ACTION_ORDER.indexOf(bParsed.actionKey);
          const normalizedA = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
          const normalizedB = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
          return normalizedA - normalizedB || aParsed.actionKey.localeCompare(bParsed.actionKey);
        });
        return { ...group, permissions: ordered };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [permissions]);

  const roleName = roles.find((role) => role.id === roleId)?.name || "";

  const handleTogglePermission = async (permission: Permission) => {
    if (!roleId) return;
    setUpdatingPermissionId(permission.id);
    setError(null);
    try {
      if (rolePermissionIds.has(permission.id)) {
        await removeRolePermission(roleId, permission.id);
      } else {
        await assignRolePermission(roleId, permission.id);
      }
      const updated = await getRolePermissions(roleId);
      setRolePermissions(updated);
    } catch {
      setError("Unable to update role permissions.");
    } finally {
      setUpdatingPermissionId(null);
    }
  };

  return (
    <AdminLayout
      title="Role Permissions"
      subtitle="Assign permissions for the selected role."
      actions={
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            className="admin-button admin-button--muted"
            onClick={() => navigate("/admin/roles")}
          >
            <ArrowLeft size={16} style={{ marginRight: 6 }} />
            Back to roles
          </button>
          <button className="admin-button admin-button--muted" onClick={loadData}>
            <RefreshCcw size={16} style={{ marginRight: 6 }} />
            Refresh
          </button>
        </div>
      }
    >
      <style>{`
        .permission-row {
          display: grid;
          grid-template-columns: minmax(160px, 220px) 1fr;
          gap: 12px;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .permission-row:last-child {
          border-bottom: none;
        }
        .permission-actions {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 6px;
        }
        .permission-actions::-webkit-scrollbar {
          height: 6px;
        }
        .permission-actions::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.6);
          border-radius: 999px;
        }
        .permission-toggle {
          border-radius: 999px;
          padding: 8px 14px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          font-weight: 600;
          white-space: nowrap;
        }
        .permission-toggle--active {
          background: #0f172a;
          border-color: #0f172a;
          color: #ffffff;
        }
      `}</style>

      {error && <div className="admin-panel" style={{ color: "#b91c1c" }}>{error}</div>}

      {!roleId ? (
        <div className="admin-panel">
          <p style={{ color: "#64748b" }}>Select a role to manage permissions.</p>
        </div>
      ) : (
        <div className="admin-panel">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 600 }}>Permissions</div>
              <div style={{ color: "#64748b", fontSize: 14 }}>
                Toggle permissions for the selected role.
              </div>
            </div>
            {roleName && <span className="admin-pill">{roleName}</span>}
          </div>

          {loading ? (
            <p style={{ color: "#64748b", marginTop: 12 }}>Loading permissions...</p>
          ) : groupedPermissions.length === 0 ? (
            <p style={{ color: "#64748b", marginTop: 12 }}>No permissions available.</p>
          ) : (
            <div style={{ marginTop: 12 }}>
              {groupedPermissions.map((group) => (
                <div key={group.key} className="permission-row">
                  <div style={{ fontWeight: 600 }}>{group.label}</div>
                  <div className="permission-actions">
                    {group.permissions.map((permission) => {
                      const parsed = parsePermission(permission);
                      const active = rolePermissionIds.has(permission.id);
                      return (
                        <button
                          key={permission.id}
                          disabled={updatingPermissionId === permission.id}
                          onClick={() => handleTogglePermission(permission)}
                          className={`permission-toggle${active ? " permission-toggle--active" : ""}`}
                        >
                          {parsed.actionLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
