import { Star } from "lucide-react";

interface RatingStarsProps {
  value: number;
  onChange?: (rating: number) => void;
  max?: number;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function RatingStars({
  value,
  onChange,
  max = 5,
  readOnly = false,
  size = "md",
}: RatingStarsProps) {
  const handleStarClick = (starValue: number) => {
    if (!readOnly && onChange) {
      onChange(starValue);
    }
  };

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= value;

        return (
          <button
            key={starValue}
            type="button"
            onClick={() => handleStarClick(starValue)}
            disabled={readOnly}
            className={`
              ${sizeClasses[size]}
              ${!readOnly ? "cursor-pointer transition-transform duration-200" : "cursor-default"}
              ${
                isFilled
                  ? "text-amber-400 fill-amber-400"
                  : "text-amber-200"
              }
              ${!readOnly ? "hover:text-amber-300 hover:fill-amber-300 hover:scale-110" : ""}
            `}
          >
            <Star className="w-full h-full" />
          </button>
        );
      })}
    </div>
  );
}
