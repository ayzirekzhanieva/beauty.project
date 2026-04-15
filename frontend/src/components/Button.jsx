export default function Button({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
}) {
  const baseStyles =
    "px-5 py-3 rounded-2xl font-medium transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed";

  const isSecondary =
    className.includes("bg-white") || className.includes("border");

  const secondaryStyles =
    "bg-white text-pink-500 border border-pink-300 hover:bg-pink-50";

  const primaryStyles =
    "bg-pink-500 text-white hover:bg-pink-600";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${
        isSecondary ? secondaryStyles : primaryStyles
      } ${className}`}
    >
      {children}
    </button>
  );
}