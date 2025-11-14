import { useNavigate } from "react-router-dom";
import "./BackButton.css";

interface BackButtonProps {
  to?: string;
  label?: string;
}

export const BackButton = ({
  to = "/tasks",
  label = "← Back to Tasks",
}: BackButtonProps) => {
  const navigate = useNavigate();

  return (
    <button className="btn btn-primary btn-back" onClick={() => navigate(to)}>
      {label}
    </button>
  );
};
