import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  size?: "sm" | "md";
}

const StarRating = ({ rating, onRate, size = "sm" }: StarRatingProps) => {
  const starSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            starSize,
            "transition-colors",
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30",
            onRate && "cursor-pointer hover:text-yellow-400"
          )}
          onClick={() => onRate?.(star)}
        />
      ))}
    </div>
  );
};

export default StarRating;
