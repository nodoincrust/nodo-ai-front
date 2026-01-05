import "./AppModal.scss";

interface AppModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
  height?:string
}

const AppModal = ({
  open,
  title,
  onClose,
  children,
  footer,
  width = "750px",


}: AppModalProps) => {
  if (!open) return null;

  return (
    <div className="app-modal-overlay">
      <div className="app-modal" style={{ width }}>
        <div className="app-modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="app-modal-body">{children}</div>

        {footer && <div className="app-modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default AppModal;
