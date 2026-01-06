import type { ButtonProps, MenuProps } from "antd";

import { Dayjs } from "dayjs";
import type { ReactNode } from "react";
export interface VerifyOtpResponse {
  token: string;
  sidebar: any[];
  is_department_head: boolean;
  department_id: number | null;
  user: {
    id: number;
    email: string;
    name?: string;
    role_id?: number;
    [key: string]: any;
  };
}

//CommomComponent
// Breadcrumb.tsximport type { ButtonProps, MenuProps } from "antd";
//Attendance Report
// types/common.d.ts or types/attendance.d.ts

import { Dayjs } from "dayjs";
import type { ReactNode } from "react";
import type { User } from "../pages/companyDashboard/compDashboard";
import type { ButtonProps } from "antd";
export interface BreadcrumbItem {
  text: string;
  path?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  title?: string;
  backPath?: string;
}

//Buttons
// PrimaryButton.tsx

export interface PrimaryButtonProps extends ButtonProps {
  text: string;
  imgSrc?: string;
  imgAlt?: string;
  imgPosition?: "before" | "after";
  className?: string;
}
// SecondaryButton.tsx
export interface SecondaryButtonProps extends ButtonProps {
  text?: React.ReactNode;
  imgSrc?: string;
  imgAlt?: string;
  imgPosition?: "before" | "after";
}

// Pagination.tsx
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  totalRecords?: number;
}

// PageItem type for pagination numbers
export type PageItem = number | "...";

// ConfirmModal.tsx
export interface ConfirmModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
  cancelText?: string;
  icon?: string;
  confirmType?: "danger" | "primary";
}

// DropdownOptionsModal.tsx
export interface DropdownOptionsModalProps {
  open: boolean;
  onCancel: () => void;
  columns?: string[];
  data?: (string | React.ReactNode)[][];
  options?: string[];
  maxWidth?: number;
}

// Header.tsx
export interface HeaderProps {
  title: string;
  description?: string;
  count?: number | string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onAddClick?: () => void;
  addButtonText?: string;
  onFilterClick?: () => void;
  filterButtonText?: string;
  onCategorySelect?: (value: string) => void;
  categoryButtonText?: string;
  categoryMenu?: MenuProps;
  categoryButtonClassName?: string;
  categoryButtonTextClassName?: string;
  filtersApplied?: boolean;
  onClearFilters?: () => void;
  searchPlaceholder?: string
}

// Document detail header
export type DocumentStatus = "IN_REVIEW" | "APPROVED" | "REJECTED" | "DRAFT" | "SUBMITTED";

export interface DocumentBreadcrumbItem {
  label: string;
  path?: string;
}

export interface DocumentHeaderProps {
  breadcrumb: DocumentBreadcrumbItem[];
  fileName: string;
  status?: DocumentStatus;
  onBackClick?: () => void;
  versionOptions?: { label: string; value: string }[];
  selectedVersion?: string;
  onVersionChange?: (value: string) => void;
  onSubmit?: () => void;
}

// Sidebar.tsx
export interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

export interface ProfileProps {
  open: boolean;
  onClose: () => void;
  user?: any;
}

//Table.tsx
export interface Column<T> {
  title: string;
  render: (row: T, index?: number) => React.ReactNode;
  className?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: (row: T) => React.ReactNode;
  actionsTitle?: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSize?: number;
  totalRecords?: number;
  emptyText?: string;
  rowClassName?: (row: T, index?: number) => string;
}

// --- Filter Types ---
export interface Filters {
  Status: string[];
  // Status?: { id: string; label: string }[];
  Date?: [string, string] | [];
  "Role Permissions"?: string[];
  "Role Name"?: string[];
  "Project Name"?: string[];
  "Vendor Name"?: string[];
  "Device List"?: any[];
  "Worker Category"?: { label: string; value: "new" | "old" }[];
  [key: string]:
  | { id: string | number; label: string }[]
  | string[]
  | [string, string]
  | { label: string; value: "new" | "old" }[]
  | undefined;
}

export interface ApiFilters {
  university_id?: number[];
  category_id?: number[];
  isactive?: boolean[];
  order_status?: string[];
  isfeatured?: boolean[];
  rating?: string[];
  date?: { start: string; end: string };
}

// --- Default Values ---
export const DEFAULT_FILTERS: Filters = {
  Status: [],
  "Role Permissions": [],
  "Role Name": [],
  "Project Name": [],
  "Vendor Name": [],
  "Device List": [],
  "Worker Category": [],
  Date: [],
};

export interface UseFiltersProps {
  initialFilters?: Filters;
  onApply?: (filters: Filters, apiFilters: ApiFilters) => void;
}

//Pages
// ProtectedRoute.tsx
export interface ProtectedRouteProps {
  children: ReactNode;
}

// ResetPassword
export interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  confirmpassword: string;
}

export interface ApiPayload {
  page?: number;
  pagelimit?: number;
  search?: string;
  [key: string]: unknown;
}

// LogoutModal.tsx
export interface LogoutModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

// OtpRoute.route.tsx
export interface OtpRouteProps {
  children: ReactNode;
}

//Sidebar
export interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export interface SidebarItem {
  id: number | string;
  label: string;
  path: string;
  icon?: string | null;
  icon_active?: string | null;
}

export interface AuthData {
  token?: string;
  sidebar?: SidebarItem[];
  user_name?: string;
  is_department_head?: boolean;
  department_id?: number | null;
  user?: any;
}