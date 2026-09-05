import { Star } from "lucide-react";

export function StarRating({ rating, count }: { rating: number; count?: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
      <span className="text-sm font-semibold text-gray-900">{rating}</span>
      {count && <span className="text-xs text-muted-foreground">({count.toLocaleString()})</span>}
    </div>
  );
}
