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
  confirmType?: "danger" | "primary" | "approve";
  confirmBtnClassName?: string;
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

type Breadcrumb = {
  parent: string;
  parentPath?: string;
  current?: string;
};

// Header.tsx
type HeaderCommonProps = {
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
  showDropdown?: boolean;
  status?: StatusType;
  onStatusChange?: (status: StatusType) => void;
  documentFilterValue?: "MY_DOCUMENTS" | "AWAITING";
  onDocumentFilterChange?: (value: "MY_DOCUMENTS" | "AWAITING") => void;
}
export type HeaderProps =
  | (HeaderCommonProps & {
      title: string;
      breadcrumb?: never;
    })
  | (HeaderCommonProps & {
      breadcrumb: Breadcrumb;
      title?: never;
    });
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

// Document interface
export interface ApiDocumentVersion {
  version_number: number;
  file_name: string;
  file_size_bytes: number;
  tags?: string[];
  summary?: string;
  file_url?: string;
}

// Actual API response structure
export interface ApiDocumentDetailResponse {
  statusCode: number;
  data: {
    document: {
      id: number;
      status: "IN_REVIEW" | "APPROVED" | "REJECTED" | "DRAFT" | "SUBMITTED";
      display_status?: string;
      remark?: string;
      is_active: boolean;
      created_at: string;
      current_version: number;
      uploaded_by: number;
      department_id: number;
      company_id: number;
    };
    file: {
      file_name: string;
      file_url?: string;
      file_path?: string;
      file_size_bytes: number;
      version_number: number;
    };
    ai: {
      ai_document_id: number;
      session_id: string;
      file_type: string;
      file_size_mb: number;
    };
    summary: {
      text: string | null;
      tags: string[];
      citations: any[];
      is_self_generated?: boolean;
    };
    review: {
      status: string | null;
      reviewed_by: number | null;
    };
  };
}

export type DocumentStatus =
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "DRAFT"
  | "SUBMITTED"
  | "all"
  | "PENDING"
  | "REUPLOADED";

export interface DocumentBreadcrumbItem {
  label: string;
  path?: string;
    onClick?: () => void;
  isActive?: boolean; // last item
}

export interface DocumentHeaderProps {
  breadcrumb: DocumentBreadcrumbItem[];
  fileName: string;
  status?: DocumentStatus;
  rejectionRemark?: string;
  displayStatus?: string;
  onBackClick?: () => void;
  versionOptions?: { label: string; value: string }[];
  selectedVersion?: string;
  onVersionChange?: (value: string) => void;
  onSubmit?: () => void;
  submitDisabled?: boolean;
  extraActions?: DocumentHeaderAction[];
  onReject?: (reason: string) => void;
  tracking?: {
    final_status: string;
    steps: {
      role: string;
      status: "APPROVED" | "REJECTED" | "PENDING";
      display: string;
      timestamp?: string;
    }[];
  };
}

// Awaiting header props
export interface AwaitingDocumentHeaderProps extends DocumentHeaderProps {
  extraActions?: DocumentHeaderAction[];
}

// Normalized document interface for UI
export interface ApiDocument {
  document_id: number;
  status: string;
  display_status?: string;
  current_version: number;
  version: ApiDocumentVersion;
  remark?: string;
  is_actionable?: boolean;
  summary?: {
    text?: string;
    tags?: string[];
    citations?: any[];
    is_self_generated?: boolean;
  };
  tracking?: {
    final_status: string;
    steps: {
      role: string;
      status: "APPROVED" | "REJECTED" | "PENDING";
      display: string;
      timestamp?: string;
    }[];
  };
}

export interface DocumentsListResponse {
  data: ApiDocument[];
  total: number;
  page: number;
  size: number;
}

// Document UI type (normalized from ApiDocument for display)
export interface Document {
  document_id: number;
  status: "IN_REVIEW" | "APPROVED" | "REJECTED" | "DRAFT" | "SUBMITTED";
  current_version: number;
  // Normalized fields for UI
  name: string;
  size: number;
  tags: string[];
  file_type: string;
}

// Parameters for getting documents list
export interface GetDocumentsParams {
  page?: number;
  size?: number;
  search?: string;
  status?: "IN_REVIEW" | "APPROVED" | "REJECTED" | "DRAFT" | "SUBMITTED";
  version?: number;
  tag?: string;
}

export interface AssignableEmployee {
  user_id: number;
  name: string;
  role: string;
  is_department_head: boolean;
  order: number;
  self?: boolean;
}

export interface AssignableEmployeeResponse {
  status: number;
  data: AssignableEmployee[];
}

export interface AiChatResponse {
  document_id: number;
  session_id: string;
  answer: string;
  citations: any[];
}

// Awaiting Approval
export interface DocumentHeaderAction {
  label: string;
  onClick: () => Promise<void> | void;
  type?: "primary" | "default" | "danger";
  disabled?: boolean;
}

export interface AddEditBouquetProps {
  open: boolean;
  initialData?: any;
  onClose: () => void;
  onSave: () => void;
}
