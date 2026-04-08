'use client';

interface WearBadgeProps {
  wearCount: number;
  lastWornAt?: string;
  size?: 'sm' | 'lg';
}

export default function WearBadge({ wearCount, lastWornAt, size = 'sm' }: WearBadgeProps) {
  const now = new Date();
  const lastWorn = lastWornAt ? new Date(lastWornAt) : null;
  const daysSinceWorn = lastWorn
    ? Math.floor((now.getTime() - lastWorn.getTime()) / (1000 * 60 * 60 * 24))
    : Infinity;

  let bgColor = 'bg-gray-100 text-gray-500';
  if (wearCount > 0 && daysSinceWorn <= 7) {
    bgColor = 'bg-amber-100 text-amber-700';
  } else if (wearCount > 0 && daysSinceWorn <= 30) {
    bgColor = 'bg-green-100 text-green-700';
  }

  const isLarge = size === 'lg';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${bgColor} ${
        isLarge ? 'px-3 py-1.5 text-sm' : 'px-2 py-0.5 text-xs'
      }`}
    >
      Porté {wearCount} fois
    </span>
  );
}
