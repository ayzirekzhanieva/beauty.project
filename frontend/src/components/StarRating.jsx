import { Star } from "lucide-react";

export default function StarRating({
  rating = 0,
  onChange,
  interactive = false,
  size = 18,
}) {
  const rounded = Math.round(rating);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= rounded;

        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(star)}
            className={interactive ? "cursor-pointer" : "cursor-default"}
          >
            <Star
              size={size}
              className={filled ? "fill-pink-400 text-pink-400" : "text-pink-200"}
            />
          </button>
        );
      })}
    </div>
  );
}