import { Sparkles } from "lucide-react";

export default function EmptyState({
  title = "Пока пусто",
  description = "Здесь пока нет данных.",
}) {
  return (
    <div className="bg-white rounded-3xl shadow-md p-10 text-center">
      <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-7 h-7 text-pink-500" />
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  );
}