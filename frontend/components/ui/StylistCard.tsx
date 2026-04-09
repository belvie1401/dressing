'use client';

import Image from 'next/image';
import type { User } from '@/types';

interface StylistCardProps {
  stylist: User;
  isConnected?: boolean;
  onInvite?: (stylistId: string) => void;
}

export default function StylistCard({ stylist, isConnected, onInvite }: StylistCardProps) {
  const specialties = (stylist.style_profile as Record<string, unknown>)?.specialties as string[] | undefined;

  return (
    <div className="overflow-hidden rounded-2xl bg-white p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#F0F0F0]">
          {stylist.avatar_url ? (
            <Image
              src={stylist.avatar_url}
              alt={stylist.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-lg font-semibold text-[#8A8A8A]">
              {stylist.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-[#0D0D0D]">{stylist.name}</h3>
          {stylist.location && (
            <p className="text-xs text-[#8A8A8A]">{stylist.location}</p>
          )}
        </div>
      </div>

      {specialties && specialties.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {specialties.map((s) => (
            <span key={s} className="rounded-full bg-[#F0F0F0] px-2.5 py-0.5 text-[10px] font-medium text-[#0D0D0D]">
              {s}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={() => !isConnected && onInvite?.(stylist.id)}
        disabled={isConnected}
        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-xs font-medium transition-colors ${
          isConnected
            ? 'bg-[#F0F0F0] text-[#0D0D0D]'
            : 'bg-[#0D0D0D] text-white'
        }`}
      >
        {isConnected ? (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Connecté
          </>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            Inviter comme styliste
          </>
        )}
      </button>
    </div>
  );
}
