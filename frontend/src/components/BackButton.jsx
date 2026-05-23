import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="mb-6 flex items-center gap-2 text-[#ee8585] hover:text-[#ee8585] transition"
    >
      <ArrowLeft className="w-5 h-5" />
      Назад
    </button>
  );
}