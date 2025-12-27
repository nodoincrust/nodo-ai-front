import { useState, useEffect } from "react";
import AppModal from "../common/AppModal";
import AppInput from "../common/AppInput";
import AppButton from "../common/AppButton";
import StatusToggle from "../common/StatusToggle ";

interface Company {
  id: number;
  name: string;
  email: string;
  owner: string;
  status: "Active" | "Inactive";
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    email: string;
    owner: string;
    is_active: boolean;
  }) => void;
  company: Company | null;
}

const EditCompanyModal = ({ open, onClose, onSave, company }: Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [owner, setOwner] = useState("");
  const [isActive, setIsActive] = useState<boolean>(true);

  // Pre-fill form fields when modal opens with company data
  useEffect(() => {
    if (open && company) {
      setName(company.name || "");
      setEmail(company.email || "");
      setOwner(company.owner || "");
      setIsActive(company.status === "Active");
    }
  }, [open, company]);

  return (
    <AppModal
      open={open}
      title="Edit Company"
      onClose={onClose}
      footer={
        <AppButton
          label="Save"
          variant="primary"
          onClick={() => {
            onSave({
              name,
              email,
              owner,
              is_active: isActive,
            });
          }}
        />
      }
    >
      <AppInput
        label="Company Name"
        placeholder="Enter company name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <AppInput
        label="Email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <AppInput
        label="Owner"
        placeholder="Enter owner name"
        value={owner}
        onChange={(e) => setOwner(e.target.value)}
      />

      {/* Status Toggle */}
      
    </AppModal>
  );
};

export default EditCompanyModal;
