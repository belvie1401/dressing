'use client';

import Image from 'next/image';
import type { Lookbook } from '@/types';

interface LookbookViewerProps {
  lookbook: Lookbook;
  onFeedback?: (status: 'approve' | 'reject', feedback: string) => void;
}

export default function LookbookViewer({ lookbook, onFeedback }: LookbookViewerProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-[#0D0D0D]">{lookbook.title}</h3>
        {lookbook.description && (
          <p className="mt-1 text-sm text-[#8A8A8A]">{lookbook.description}</p>
        )}
        <p className="mt-1 text-xs text-[#8A8A8A]">
          Par {lookbook.stylist?.name || 'Styliste'}
        </p>
      </div>

      {/* Outfits */}
      <div className="space-y-4">
        {lookbook.outfits?.map((lo) => {
          const outfit = lo.outfit;
          if (!outfit) return null;
          const items = outfit.items?.map((oi) => oi.item).filter(Boolean) || [];

          return (
            <div key={lo.outfit_id} className="rounded-2xl bg-[#F0F0F0] p-3">
              <p className="mb-2 text-sm font-medium text-[#0D0D0D]">{outfit.name}</p>
              <div className="grid grid-cols-3 gap-1">
                {items.map((item) =>
                  item ? (
                    <div key={item.id} className="relative aspect-square overflow-hidden rounded-xl">
                      <Image
                        src={item.bg_removed_url || item.photo_url}
                        alt={item.category}
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                    </div>
                  ) : null
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feedback actions */}
      {lookbook.status === 'SENT' && onFeedback && (
        <div className="flex gap-3">
          <button
            onClick={() => onFeedback('approve', '')}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#0D0D0D] py-3 text-sm font-medium text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" /><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
            Approuver
          </button>
          <button
            onClick={() => onFeedback('reject', '')}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#F0F0F0] py-3 text-sm font-medium text-[#0D0D0D]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" /><path d="M17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
            </svg>
            Refuser
          </button>
        </div>
      )}

      {lookbook.feedback && (
        <div className="rounded-2xl bg-[#F0F0F0] p-3">
          <p className="text-xs font-medium text-[#0D0D0D]">Retour</p>
          <p className="mt-1 text-sm text-[#8A8A8A]">{lookbook.feedback}</p>
        </div>
      )}
    </div>
  );
}
