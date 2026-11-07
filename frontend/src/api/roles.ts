import { http } from "./http";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

function unwrapData<T>(payload: T | ApiEnvelope<T>): T {
  const maybeEnvelope = payload as ApiEnvelope<T>;
  if (maybeEnvelope && typeof maybeEnvelope === "object" && "data" in maybeEnvelope && maybeEnvelope.data) {
    return maybeEnvelope.data;
  }
  return payload as T;
}

export type RolePayload = {
  name: string;
  description?: string;
};

export type Role = {
  id: string;
  name: string;
  description?: string;
  isDeleted?: boolean;
};

export async function getRoles(params?: Record<string, string | number | boolean>) {
  const { data } = await http.get("/roles", { params });
  return unwrapData<Role[]>(data);
}

export async function createRole(payload: RolePayload) {
  const { data } = await http.post("/roles", payload);
  return unwrapData<Role>(data);
}

export async function updateRole(id: string, payload: RolePayload) {
  const { data } = await http.put(`/roles/${id}`, payload);
  return unwrapData<Role>(data);
}

export async function deleteRole(id: string) {
  await http.delete(`/roles/${id}`);
}

export async function restoreRole(id: string) {
  await http.patch(`/roles/${id}/restore`);
}

export async function getRolePermissions(roleId: string) {
  const { data } = await http.get(`/roles/${roleId}/permissions`);
  const payload = unwrapData<
    Array<{ id: string; name: string; description?: string }>
    | { permissions?: Array<{ id: string; name: string; description?: string }> }
  >(data);

  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.permissions)) {
    return payload.permissions;
  }

  return [];
}

export async function assignRolePermission(roleId: string, permissionId: string) {
  const { data } = await http.post(`/roles/${roleId}/permissions`, { permissionId });
  return unwrapData(data);
}

export async function removeRolePermission(roleId: string, permissionId: string) {
  const { data } = await http.delete(`/roles/${roleId}/permissions`, { data: { permissionId } });
  return unwrapData(data);
}

export async function assignRoleToUser(roleId: string, userId: string) {
  const { data } = await http.post(`/roles/${roleId}/users`, { userId });
  return unwrapData(data);
}

export async function removeUserRole(roleId: string, userId: string) {
  const { data } = await http.delete(`/roles/${roleId}/users/${userId}`);
  return unwrapData(data);
}
