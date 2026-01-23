import React, { useMemo, useState, useEffect, useRef } from "react";
import AppModal from "../../../components/common/AppModal";
import "./Styles/ShareDocuments.scss";
import { getEmployeesListForShare } from "../../../services/employees.services";
import { shareDocument } from "../../../services/documents.service";
import { notification } from "antd";
import { getInitials, getAvatarColorIndex } from "../../../utils/utilFunctions";
import {
  getDepartmentsList,
  getDepartmentEmployees,
} from "../../../services/departments.services";
interface Employee {
  id: number;
  name: string;
  email: string;
  department_id: number;
  department_name: string;
  is_active: boolean;
  role: string | null;
}

interface Department {
  id: number;
  name: string;
  is_active: boolean;
  showRecord: boolean;
}

interface ShareDocumentsProp {
  open: boolean;
  onClose: () => void;
  documentId?: number | null;
  bouquetId?: number | null;
}

const ShareDocuments: React.FC<ShareDocumentsProp> = ({
  open,
  onClose,
  documentId,
  bouquetId,
}) => {
  const [activeTab, setActiveTab] = useState<"User" | "department">("User");
  const isDocumentShare = !!documentId;
  const isBouquetShare = !!bouquetId;
  const [selectedDepartmentsList, setSelectedDepartmentsList] = useState<
    Department[]
  >([]);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<number[]>(
    [],
  );
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
  // Store selected employee objects as array to ensure we can display them
  const [selectedEmployeesList, setSelectedEmployeesList] = useState<
    Employee[]
  >([]);
  const selectedEmployees = selectedEmployeesList;

  const [isCompanySelected, setIsCompanySelected] = useState(false);

  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [search, setSearch] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalTitle = isBouquetShare ? "Share Bouquet" : "Share Document";

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedEmployeeIds([]);
      setSelectedDepartmentIds([]);
      setIsCompanySelected(false);
      setSearch("");
      setInputFocused(false);
      setSelectedEmployeesList([]);
    }
  }, [open]);

  // FETCH DEPARTMENTS (ON MODAL OPEN)

  useEffect(() => {
    if (!open) return;

    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true);
        const res = await getDepartmentsList({ search, showRecord: false });

        if (res?.data) {
          setDepartments(res.data.filter((d: any) => d.is_active));
        }
      } catch (err) {
        console.error("Failed to fetch departments", err);
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, [open]);

  // FETCH EMPLOYEES (COMPANY LEVEL)
  useEffect(() => {
    if (!open || activeTab !== "User") return;

    const fetchAllEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const res: any = await getEmployeesListForShare({
          page: 1,
          size: 100,
          search: search.trim() || undefined,
        });
        if (res?.statusCode === 200 && Array.isArray(res.data)) {
          setEmployees(res.data as Employee[]);
        } else {
          setEmployees([]);
        }
      } catch (err) {
        console.error("Failed to fetch employees", err);
        setEmployees([]);
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchAllEmployees();
  }, [open, activeTab, search]);

  //FETCH EMPLOYEES BY DEPARTMENT (IMPORTANT PART)
  useEffect(() => {
    if (!open || activeTab !== "department") return;

    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true);

        const res = await getDepartmentsList({
          search: search.trim() || undefined,
          showRecord: false,
        });

        if (res?.data) {
          setDepartments(res.data.filter((d: any) => d.is_active));
        } else {
          
        }
      } catch (err) {
        console.error("Failed to fetch departments", err);
        setDepartments([]);
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, [open, activeTab, search]);

  // Filter out already selected employees from suggestions
  const filteredEmployees = useMemo(() => {
    let list = employees.filter((e) => !selectedEmployeeIds.includes(e.id));

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q),
      );
    }

    return list;
  }, [employees, search, selectedEmployeeIds]);

  // Filter out already selected departments from suggestions
  const filteredDepartments = useMemo(() => {
    let list = departments.filter((d) => !selectedDepartmentIds.includes(d.id));

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((d) => d.name.toLowerCase().includes(q));
    }

    return list;
  }, [departments, search, selectedDepartmentIds]);
  const selectedDepartments = selectedDepartmentsList;

  const toggleEmployee = (id: number, employeeData?: Employee) => {
    // Try to get employee from passed data, then from employees array, then from stored list
    const employee =
      employeeData ||
      employees.find((e) => e.id === id) ||
      selectedEmployeesList.find((e) => e.id === id);

    if (!employee) {
      console.warn(`Employee with id ${id} not found`, {
        employeeData,
        employees,
        selectedEmployeesList,
      });
      return;
    }

    if (selectedEmployeeIds.includes(id)) {
      // Remove employee
      setSelectedEmployeeIds((prev) => prev.filter((eid) => eid !== id));
      setSelectedEmployeesList((prev) => prev.filter((e) => e.id !== id));
    } else {
      // Add employee - use functional updates to ensure we get the latest state
      setSelectedEmployeeIds((prev) => {
        if (prev.includes(id)) return prev;
        console.log("Adding employee ID:", id, "Employee:", employee);
        return [...prev, id];
      });
      setSelectedEmployeesList((prev) => {
        // Check if already in list
        if (prev.some((e) => e.id === id)) return prev;
        console.log("Adding employee to list:", employee);
        return [...prev, employee];
      });
    }
    setSearch(""); // Clear search after selection
    // Keep input focused - use longer delay to ensure state updates first
    setTimeout(() => {
      searchInputRef.current?.focus();
      setInputFocused(true);
    }, 150);
  };

  const removeEmployee = (id: number) => {
    setSelectedEmployeeIds((prev) => prev.filter((eid) => eid !== id));
    setSelectedEmployeesList((prev) => prev.filter((e) => e.id !== id));
    setIsCompanySelected(false);
  };

  const toggleDepartment = (id: number, departmentData?: Department) => {
    const department =
      departmentData ||
      departments.find((d) => d.id === id) ||
      selectedDepartmentsList.find((d) => d.id === id);
    if (!department) return;

    if (selectedDepartmentIds.includes(id)) {
      // Remove department
      setSelectedDepartmentIds((prev) => prev.filter((did) => did !== id));
      setSelectedDepartmentsList((prev) => prev.filter((d) => d.id !== id));
    } else {
      // Add department
      setSelectedDepartmentIds((prev) => [...prev, id]);
      setSelectedDepartmentsList((prev) => [...prev, department]);
    }
    setSearch(""); // Clear search after selection
    setTimeout(() => {
      searchInputRef.current?.focus();
      setInputFocused(true);
    }, 150);
  };

  const removeDepartment = (id: number) => {
    setSelectedDepartmentIds((prev) => prev.filter((did) => did !== id));
    setSelectedDepartmentsList((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSubmit = async () => {
    if (!documentId && !bouquetId) {
      notification.error({
        message: "Nothing to share",
      });
      return;
    }

    try {
      const isCompanyMode = activeTab === "User";
      const isDepartmentMode = activeTab === "department";

      const payload: any = {
        users:
          activeTab === "User" && isCompanySelected
            ? []
            : activeTab === "User"
              ? selectedEmployeesList.map((e) => e.id)
              : [],

        departments: activeTab === "department" ? selectedDepartmentIds : [],

        company: activeTab === "User" && isCompanySelected,

        showRecord: activeTab === "department" ? false : true,
      };

      if (documentId) payload.document_id = documentId;
      if (bouquetId) payload.bouquet_id = bouquetId;

      await shareDocument(payload);

      notification.success({
        message: "Document shared successfully",
      });

      onClose();
    } catch (error) {
      console.error("Share failed", error);
      notification.error({
        message: "Failed to share document",
      });
    }
  };

  const footer = (
    <div className="share-documents-footer">
      <button className="btn-secondary" onClick={onClose}>
        Cancel
      </button>
      <button
        className="btn-primary"
        onClick={handleSubmit}
        disabled={
          activeTab === "User"
            ? !isCompanySelected && selectedEmployees.length === 0
            : selectedDepartments.length === 0
        }
      >
        Share
      </button>
    </div>
  );

  return (
    <AppModal open={open} onClose={onClose} title={modalTitle} footer={footer}>
      <div className="share-documents-modal">
        <div className="people-access-header">
          <h4>People with access</h4>
          <div className="share-tabs">
            <button
              className={activeTab === "User" ? "active" : ""}
              onClick={() => {
                setActiveTab("User");
                setSelectedDepartmentIds([]);
                setSearch("");
              }}
            >
              User
            </button>
            <button
              className={activeTab === "department" ? "active" : ""}
              onClick={() => {
                setActiveTab("department");
                setIsCompanySelected(false);
                setSelectedEmployeeIds([]);
                setSelectedEmployeesList([]);
                setSearch("");
              }}
            >
              Department
            </button>
          </div>
        </div>

        <div className="share-layout">
          {activeTab === "User" && (
            <div className="share-input-container">
              <div
                className="share-input-wrapper"
                onClick={() => searchInputRef.current?.focus()}
              >
                {isCompanySelected ? (
                  <div className="share-chip company-chip">
                    <span className="chip-text">All users</span>
                    <button
                      className="chip-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCompanySelected(false);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  selectedEmployees.map((emp) => (
                    <div key={emp.id} className="share-chip">
                      <div
                        className={`avatar color-${getAvatarColorIndex(emp.email)}`}
                      >
                        {getInitials(emp.name)}
                      </div>
                      <span className="chip-text">{emp.name}</span>
                      <button
                        className="chip-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeEmployee(emp.id);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}

                <input
                  ref={searchInputRef}
                  className="share-input"
                  placeholder={
                    isCompanySelected
                      ? ""
                      : selectedEmployees.length === 0
                        ? "Search and add people"
                        : ""
                  }
                  value={search}
                  disabled={isCompanySelected}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setInputFocused(true)}
                />
              </div>
              {!isCompanySelected && selectedEmployees.length === 0 && (
                <div className="select-all-wrapper">
                  <a
                    href="#"
                    className="select-all-link"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsCompanySelected(true);
                      setSelectedEmployeeIds([]);
                      setSelectedEmployeesList([]);
                      setSearch("");
                    }}
                  >
                    Select all users
                  </a>
                </div>
              )}

              {inputFocused && search && filteredEmployees.length > 0 && (
                <div className="suggestions-dropdown">
                  {filteredEmployees.map((emp) => (
                    <div
                      key={emp.id}
                      className="suggestion-row"
                      onMouseDown={(e) => {
                        e.preventDefault(); // keep input focused
                        toggleEmployee(emp.id, emp); // add employee
                      }}
                    >
                      <div
                        className={`avatar color-${getAvatarColorIndex(emp.email)}`}
                      >
                        {getInitials(emp.name)}
                      </div>

                      <div className="suggestion-text">
                        <div className="name">{emp.name}</div>
                        <div className="email">{emp.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "department" && (
            <div className="share-input-container">
              <div
                className="share-input-wrapper"
                onClick={() => searchInputRef.current?.focus()}
              >
                {selectedDepartments.map((dept) => (
                  <div key={dept.id} className="share-chip department-chip">
                    <span className="chip-text">{dept.name}</span>
                    <button
                      className="chip-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeDepartment(dept.id);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}

                <input
                  ref={searchInputRef}
                  className="share-input"
                  placeholder={
                    selectedDepartments.length === 0
                      ? "Search and add departments"
                      : ""
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setInputFocused(true)}
                />
              </div>

              {inputFocused && search && filteredDepartments.length > 0 && (
                <div className="suggestions-dropdown">
                  {filteredDepartments.map((dept) => (
                    <div
                      key={dept.id}
                      className="suggestion-row"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        toggleDepartment(dept.id, dept);
                      }}
                    >
                      <div className="suggestion-text">
                        <div className="name">{dept.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppModal>
  );
};

export default ShareDocuments;
