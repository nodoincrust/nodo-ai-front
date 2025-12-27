import "./IconButton.scss";

interface Props {
  icon: React.ReactNode;
  onClick?: () => void;
}

const IconButton = ({ icon, onClick }: Props) => (
  <button className="icon-btn" onClick={onClick}>
    {icon}
  </button>
);

export default IconButton;
