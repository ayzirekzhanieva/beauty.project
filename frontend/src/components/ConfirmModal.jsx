export default function ConfirmModal({
  isOpen,
  title = "Подтверждение",
  message = "Вы уверены?",
  onConfirm,
  onCancel,
  confirmText = "Удалить",
  cancelText = "Отмена",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-3 rounded-2xl border border-pink-200 text-pink-500 hover:bg-pink-50 transition"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className="px-5 py-3 rounded-2xl bg-pink-500 text-white hover:bg-pink-600 transition shadow-md"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}