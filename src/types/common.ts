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
// Breadcrumb.tsx
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
  text?: React.ReactNode;
  imgSrc?: string;
  imgAlt?: string;
  imgPosition?: "before" | "after";
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
  showDropdown?: boolean;
  status?: StatusType;
  onStatusChange?: (status: StatusType) => void;
}

export type StatusType = "all" | "active" | "inactive";

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
  storage?: StorageInfo;
}

export interface StorageInfo {
  show_storage?: boolean;
  used_gb?: number;
  total_gb?: number;
}

//Employees
export type Employee = {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  department_id: number;
  role: string | null;
  profile_image?: string;
};

export interface AddEditEmployeeProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: any;
}

//Comapanies
export interface AddEditCompanyProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: any;
}

//Departments
export interface AddEditDepartmentProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: any;
}

//Profile
export interface ProfileProps {
  open: boolean;
  onClose: () => void;
}

export const statusItems: { key: StatusType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
];

