import "./StatusToggle .scss";

interface StatusToggleProps {
  value: boolean; // true = active, false = inactive
  onChange: (newValue: boolean) => void;
  disabled?: boolean;
}

const StatusToggle = ({ value, onChange, disabled }: StatusToggleProps) => {
  return (
    <button
      className={`status-toggle ${value ? "active" : "inactive"} ${
        disabled ? "disabled" : ""
      }`}
      onClick={() => !disabled && onChange(!value)}
      type="button"
    >
      <span className="toggle-thumb" />
      <span className="toggle-label"></span>
    </button>
  );
};

export default StatusToggle;
