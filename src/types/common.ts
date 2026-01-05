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

// AddEditRole
export interface ModuleAccess {
  module: { id: number; name: string; uniquename: string };
}
export interface AddEditRoleProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: {
    id?: number;
    name?: string;
    description?: string;
    isactive?: boolean;
    modulesAccess?: ModuleAccess[];
  };
}

export interface ModuleItem {
  id: number;
  name: string;
  uniquename: string;
  seq_no: number;
  checked?: boolean;
}

//  AddEditUser Props
export interface AddEditUserProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: UserFormData) => void;
  initialData?: UserFormData;
}

//  User Form Data (Create + Edit)
export interface UserFormData {
  id?: number;
  name?: string;
  email?: string;
  roleid?: number;
  role?: { id: number; name: string };
  role_id?: number;
  isactive?: boolean;
}

//  UserRoleItem (Role dropdown options)
export interface UserRoleItem {
  id: number;
  name: string;
  uniquename: string;
  isactive: boolean;
}

//Worker Management
export interface Vendor {
  id: number;
  name: string;
  email: string | null;
  phonenumber: string | null;
  isactive: boolean;
  sapid: string;
  locations?: string;
  address?: string;
}

export type UploadedFile = (File & { url?: string }) | { url: string; name: string };

export interface Worker {
  id: number;
  firstname: string;
  middlename?: string;
  lastname: string;
  adhar_no: string;
  worker_id: string;
  workertype?: { name: string };
  vendor: { name: string };
  essl_id?: number;
  isactive?: boolean;
  worker_category?: string | null;
  form11_url?: string | null;
  undertakinworker?: string | null;
}

// Worker Type
export interface WorkerTypeFormData {
  id?: number;
  name: string;
  minamount: number;
  maxamount: number;
  isactive: boolean;
}

export interface WorkerWithDocuments extends Worker {
  form11EnglishUrl?: string;
  form11HindiUrl?: string;
  undertakingEnglishUrl?: string;
  undertakingHindiUrl?: string;
  form11_url_signed?: string;
  undertakinworker_signed?: string;
}

export interface AddEditWorkerTypeProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: WorkerTypeFormData) => void;
  initialData?: WorkerTypeFormData;
}


// ---------------------
// Vendor Management
// ---------------------
export interface VendorData {
  id?: number;

  // UI fields (your internal form fields)
  vendor_name?: string;
  contact_person?: string;
  contact_number?: string;
  pf_code?: string;
  vendor_locations?: number[];
  vendorLocations?: {
    id: number;
    location_id: number;
    vendor_id: number;
    location: {
      id: number;
      address: string;
      isactive: boolean;
    };
  }[];

  // Backend fields (API response)
  sapid?: string;
  name?: string;
  contact_name?: string;
  phonenumber?: string;
  pf_regno?: string;
  location_id?: number[];

  // Common fields
  email?: string;
  address?: string;
  isactive?: boolean;

  // Optional additional fields returned by backend
  created_at?: string;
  updated_at?: string;
}

export interface AddEditVendorProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: VendorData) => void;
  initialData?: VendorData;
}

export interface Location {
  id: number;
  name: string;
  address?: string;
  isactive?: boolean;
}



export interface AttendanceItem {
  id?: number;
  labourcode: string;
  vendorcode?: string;
  location: string;
  date?: string | Dayjs;
  entry?: string | Dayjs;
  exit?: string | Dayjs;
}

export interface AddEditAttendanceProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: AttendanceItem) => void;
  initialData?: AttendanceItem | null;
}

//Payment Report
export interface PaymentReportPayload {
  id?: any;
  labour_id: any;
  current_employer: any;
  amount: any;
  date?: string;
  payment_receipt_file_path?: string;
  file?: { name: string; isChanged: boolean } | undefined;
}

//Preview
export interface LabourTemplateParams {
  labourid: number;
  templatename: string;
}

export type DocumentOption = | "form11_en" | "undertaking_en" | "form11_hi" | "undertaking_hi";
export interface VerifyOtpResponse {
  token: string;
  sidebar: SidebarItem[];
  is_department_head: boolean;
  department_id: number | null;
  user: {
    name: string;
    email: string;
  };
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
  user?: User;
}

// Document interface
export interface ApiDocumentVersion {
  version_number: number;
  file_name: string;
  file_size_bytes: number;
  tags: string[];
  summary?: string;
}

export interface ApiDocument {
  document_id: number;
  status: "IN_REVIEW" | "APPROVED" | "REJECTED" | "DRAFT" | "SUBMITTED";
  current_version: number;
  version: ApiDocumentVersion;
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