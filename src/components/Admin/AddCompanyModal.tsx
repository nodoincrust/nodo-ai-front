import { useState, useEffect } from "react";
import AppModal from "../common/AppModal";
import AppInput from "../common/AppInput";
import AppButton from "../common/AppButton";
import StatusToggle from "../common/StatusToggle ";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    email: string;
    owner: string;
    is_active: boolean;
  }) => void;
}

const AddCompanyModal = ({ open, onClose, onSave }: Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [owner, setOwner] = useState("");
  const [isActive, setIsActive] = useState<boolean>(true); // ✅ boolean

  // Reset form fields when modal opens or closes
  useEffect(() => {
    if (open) {
      // Reset form when modal opens
      setName("");
      setEmail("");
      setOwner("");
      setIsActive(true);
    }
  }, [open]);

  return (
    <AppModal
      open={open}
      title="Add Company"
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
            // Reset form after save
            setName("");
            setEmail("");
            setOwner("");
            setIsActive(true);
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

      {/* ✅ Status Toggle */}
      <div style={{ marginTop: "12px" }}>
        <label style={{ display: "block", marginBottom: "6px", color:"#344054" }}>Status</label>
        <StatusToggle
          value={isActive}
          onChange={(val) => setIsActive(val)}
        />
      </div>
    </AppModal>
  );
};

export default AddCompanyModal;
