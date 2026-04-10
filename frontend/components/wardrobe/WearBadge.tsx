'use client';

interface WearBadgeProps {
  wearCount: number;
  lastWornAt?: string;
  size?: 'sm' | 'lg';
}

export default function WearBadge({ wearCount, lastWornAt, size = 'sm' }: WearBadgeProps) {
  const isLarge = size === 'lg';
  const neverWorn = wearCount === 0;

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${
        neverWorn ? 'bg-[#F0F0F0] text-[#8A8A8A]' : 'bg-green-50 text-green-700'
      } ${isLarge ? 'px-3 py-1.5 text-sm' : 'px-2 py-0.5 text-xs'}`}
    >
      {neverWorn ? 'Jamais porté' : `Porté ${wearCount} fois`}
    </span>
  );
}
