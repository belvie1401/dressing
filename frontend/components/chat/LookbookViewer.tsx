'use client';

import Image from 'next/image';
import type { Lookbook } from '@/types';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface LookbookViewerProps {
  lookbook: Lookbook;
  onFeedback?: (status: 'approve' | 'reject', feedback: string) => void;
}

export default function LookbookViewer({ lookbook, onFeedback }: LookbookViewerProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{lookbook.title}</h3>
        {lookbook.description && (
          <p className="mt-1 text-sm text-gray-500">{lookbook.description}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">
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
            <div key={lo.outfit_id} className="rounded-2xl bg-gray-50 p-3">
              <p className="mb-2 text-sm font-medium text-gray-900">{outfit.name}</p>
              <div className="grid grid-cols-3 gap-1">
                {items.map((item) =>
                  item ? (
                    <div key={item.id} className="relative aspect-square overflow-hidden rounded-lg">
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
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-green-100 py-3 text-sm font-medium text-green-700 hover:bg-green-200"
          >
            <ThumbsUp className="h-4 w-4" />
            Approuver
          </button>
          <button
            onClick={() => onFeedback('reject', '')}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-100 py-3 text-sm font-medium text-red-700 hover:bg-red-200"
          >
            <ThumbsDown className="h-4 w-4" />
            Refuser
          </button>
        </div>
      )}

      {lookbook.feedback && (
        <div className="rounded-xl bg-yellow-50 p-3">
          <p className="text-xs font-medium text-yellow-700">Retour</p>
          <p className="mt-1 text-sm text-yellow-600">{lookbook.feedback}</p>
        </div>
      )}
    </div>
  );
}
