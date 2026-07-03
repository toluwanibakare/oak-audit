import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function NewAudit() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/app/licenses", { replace: true });
  }, [navigate]);
  return null;
}
