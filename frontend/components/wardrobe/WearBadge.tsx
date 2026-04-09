'use client';

interface WearBadgeProps {
  wearCount: number;
  lastWornAt?: string;
  size?: 'sm' | 'lg';
}

export default function WearBadge({ wearCount, lastWornAt, size = 'sm' }: WearBadgeProps) {
  const isLarge = size === 'lg';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium bg-[#F0F0F0] text-[#0D0D0D] ${
        isLarge ? 'px-3 py-1.5 text-sm' : 'px-2 py-0.5 text-xs'
      }`}
    >
      Porté {wearCount} fois
    </span>
  );
}
