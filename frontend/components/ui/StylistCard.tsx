'use client';

import Image from 'next/image';
import type { User } from '@/types';
import { UserPlus, Check } from 'lucide-react';

interface StylistCardProps {
  stylist: User;
  isConnected?: boolean;
  onInvite?: (stylistId: string) => void;
}

export default function StylistCard({ stylist, isConnected, onInvite }: StylistCardProps) {
  const specialties = (stylist.style_profile as Record<string, unknown>)?.specialties as string[] | undefined;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100">
          {stylist.avatar_url ? (
            <Image
              src={stylist.avatar_url}
              alt={stylist.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-lg font-semibold text-gray-400">
              {stylist.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">{stylist.name}</h3>
          {stylist.location && (
            <p className="text-xs text-gray-500">{stylist.location}</p>
          )}
        </div>
      </div>

      {specialties && specialties.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {specialties.map((s) => (
            <span key={s} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
              {s}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={() => !isConnected && onInvite?.(stylist.id)}
        disabled={isConnected}
        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-full py-2 text-xs font-medium transition-colors ${
          isConnected
            ? 'bg-green-100 text-green-700'
            : 'bg-black text-white hover:bg-gray-800'
        }`}
      >
        {isConnected ? (
          <>
            <Check className="h-3 w-3" />
            Connecté
          </>
        ) : (
          <>
            <UserPlus className="h-3 w-3" />
            Inviter comme styliste
          </>
        )}
      </button>
    </div>
  );
}
