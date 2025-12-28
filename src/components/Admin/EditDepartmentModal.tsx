import { useState, useEffect } from "react";
import AppModal from "../common/AppModal";
import AppInput from "../common/AppInput";
import AppButton from "../common/AppButton";
import StatusToggle from "../common/StatusToggle ";

interface Department {
  id: number;
  name: string;
  contact_person?: string | null;
  contact: string;
  contact_email: string;
  status: "Active" | "Inactive";
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    reporting_department_id?: number | null;
    contact_person?: string | null;
    contact: string;
    contact_email: string;
    is_active: boolean;
  }) => void;
  department: Department | null;
}

const EditDepartmentModal = ({ open, onClose, onSave, department }: Props) => {
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contact, setContact] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    if (open && department) {
      setName(department.name || "");
      setContactPerson(department.contact_person || "");
      setContact(department.contact || "");
      setContactEmail(department.contact_email || "");
      setIsActive(department.status === "Active");
    }
  }, [open, department]);

  return (
    <AppModal
      open={open}
      title="Edit Department"
      onClose={onClose}
      footer={
        <AppButton
          label="Save"
          variant="primary"
          onClick={() => {
            if (!contact || !contactEmail) {
              alert("Contact and Contact Email are required fields");
              return;
            }
            onSave({
              name,
              contact_person: contactPerson || undefined,
              contact,
              contact_email: contactEmail,
              is_active: isActive,
            });
          }}
        />
      }
    >
      <AppInput
        label="Department Name"
        placeholder="Enter department name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <AppInput
        label="Contact Person"
        placeholder="Enter contact person name (optional)"
        value={contactPerson}
        onChange={(e) => setContactPerson(e.target.value)}
      />
      <AppInput
        label="Contact"
        placeholder="Enter contact number"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        required
      />
      <AppInput
        label="Contact Email"
        placeholder="Enter contact email"
        type="email"
        value={contactEmail}
        onChange={(e) => setContactEmail(e.target.value)}
        required
      />

      {/* Status Toggle */}
      <div style={{ marginTop: "12px" }}>
        <label style={{ display: "block", marginBottom: "6px" }}>Status</label>
        <StatusToggle
          value={isActive}
          onChange={(val) => setIsActive(val)}
        />
      </div>
    </AppModal>
  );
};

export default EditDepartmentModal;

