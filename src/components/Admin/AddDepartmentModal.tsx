import { useState, useEffect } from "react";
import AppModal from "../common/AppModal";
import AppInput from "../common/AppInput";
import AppButton from "../common/AppButton";

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
}

const AddDepartmentModal = ({ open, onClose, onSave }: Props) => {
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contact, setContact] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // Reset form fields when modal opens or closes
  useEffect(() => {
    if (open) {
      setName("");
      setContactPerson("");
      setContact("");
      setContactEmail("");
    }
  }, [open]);

  return (
    <AppModal
      open={open}
      title="Add Department"
      onClose={onClose}
      footer={
        <AppButton
          label="Save"
          variant="primary"
          onClick={() => {
            if (!name || !contact || !contactEmail) {
              alert("Department Name, Contact, and Contact Email are required fields");
              return;
            }
            onSave({
              name,
              contact_person: contactPerson || undefined,
              contact,
              contact_email: contactEmail,
              is_active: true, // Default to active, can be changed later
            });
            setName("");
            setContactPerson("");
            setContact("");
            setContactEmail("");
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
        placeholder="Enter contact person name (optional - will create user account)"
        value={contactPerson}
        onChange={(e) => setContactPerson(e.target.value)}
      />
      {contactPerson && (
        <p style={{ fontSize: "12px", color: "#667085", marginTop: "-8px", marginBottom: "8px" }}>
          Note: Providing contact person will create a user account. Ensure "DEPARTMENT_HEAD" role exists in backend.
        </p>
      )}
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
    </AppModal>
  );
};

export default AddDepartmentModal;

