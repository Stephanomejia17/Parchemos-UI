const SIZES = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" };

export function InitialsAvatar({ initials, size = "sm" }: { initials: string; size?: keyof typeof SIZES }) {
  return (
    <div
      className={`${SIZES[size]} rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-semibold text-gray-600 flex-shrink-0`}
    >
      {initials}
    </div>
  );
}
