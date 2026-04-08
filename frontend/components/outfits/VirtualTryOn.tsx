'use client';

import { useState } from 'react';
import { Eye, Loader2 } from 'lucide-react';

interface VirtualTryOnProps {
  outfitId: string;
  tryOnUrl?: string;
}

export default function VirtualTryOn({ outfitId, tryOnUrl }: VirtualTryOnProps) {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(tryOnUrl || '');

  const handleGenerate = async () => {
    setLoading(true);
    // Virtual try-on API integration placeholder
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      {imageUrl ? (
        <div className="relative overflow-hidden rounded-2xl">
          <img src={imageUrl} alt="Essayage virtuel" className="w-full" />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 py-12">
          <Eye className="h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">Essayage virtuel</p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Génération...
              </>
            ) : (
              'Essayer virtuellement'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
