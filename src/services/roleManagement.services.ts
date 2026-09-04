import axios from "../api/axios";
import { API_URL } from "../utils/API";

export interface RoleListPayload {
  search?: string;
  page?: number;
  pagelimit?: number;
}

export interface RolePermissionChip {
  sidebar_menu_id?: number;
  label: string;
}

export interface RoleListItem {
  id: number;
  name: string;
  is_editable: boolean;
  reporting_role: { id: number; name: string } | null;
  permissions: RolePermissionChip[];
}

export interface RoleModuleOption {
  sidebar_menu_id: number;
  label: string;
  actions: Array<"add" | "edit" | "delete" | string>;
}

export interface RoleReportingOption {
  id: number;
  name: string;
}

export interface RolePermissionPayload {
  sidebar_menu_id: number;
  selected: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
}

export interface RolePermissionDetail extends RolePermissionPayload {
  label: string;
  view: boolean;
}

export interface RoleDetail {
  id: number;
  name: string;
  is_editable: boolean;
  reporting_role_id: number | null;
  reporting_role: { id: number; name: string } | null;
  permissions: RolePermissionDetail[];
}

export interface RoleSavePayload {
  name: string;
  reporting_role_id: number | null;
  permissions: RolePermissionPayload[];
}

export const getRolesList = async (payload: RoleListPayload = {}) => {
  const response = await axios.post(API_URL.getRolesList, payload);
  return response.data;
};

export const getRoleModules = async () => {
  const response = await axios.get(API_URL.getRoleModules);
  return response.data;
};

export const getRoleReportingOptions = async () => {
  const response = await axios.get(API_URL.getRoleReportingOptions);
  return response.data;
};

export const getRoleById = async (roleId: number) => {
  const response = await axios.get(API_URL.getRoleById(roleId));
  return response.data;
};

export const addRole = async (payload: RoleSavePayload) => {
  const response = await axios.post(API_URL.addRole, payload);
  return response.data;
};

export const updateRole = async (roleId: number, payload: RoleSavePayload) => {
  const response = await axios.put(API_URL.updateRole(roleId), payload);
  return response.data;
};

export const deleteRole = async (roleId: number) => {
  const response = await axios.delete(API_URL.deleteRole(roleId));
  return response.data;
};
