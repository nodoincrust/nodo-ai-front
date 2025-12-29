import "./StatusBadge.scss";

interface Props {
  status: "Active" | "Inactive";
}

const StatusBadge = ({ status }: Props) => {
  return (
    <span className={`status ${status.toLowerCase()}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
