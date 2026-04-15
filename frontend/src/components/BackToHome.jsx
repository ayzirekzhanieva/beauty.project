import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BackToHome() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-2 text-pink-500 font-medium hover:text-pink-600 transition mb-6"
    >
      <ArrowLeft className="w-4 h-4" />
      На главную
    </Link>
  );
}