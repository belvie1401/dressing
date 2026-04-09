'use client';

import { useState, useRef } from 'react';
import { api } from '@/lib/api';

export interface ScanResult {
  category: string;
  primary_color: string;
  secondary_colors: string[];
  material_guess: string;
  occasion_tags: string[];
  season_tags: string[];
  style_tags: string[];
}

interface WardrobeScannerProps {
  onScanComplete: (result: ScanResult, imageBase64: string) => void;
}

export default function WardrobeScanner({ onScanComplete }: WardrobeScannerProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreview(dataUrl);
      setImageBase64(dataUrl.split(',')[1]);
      setScanResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!imageBase64) return;
    setScanning(true);
    try {
      const res = await api.post<ScanResult>('/ai/scan-clothing', { image_base64: imageBase64 });
      if (res.success && res.data) {
        setScanResult(res.data);
      }
    } catch {
      // Error handled by api wrapper
    } finally {
      setScanning(false);
    }
  };

  const handleConfirm = () => {
    if (scanResult && imageBase64) {
      onScanComplete(scanResult, imageBase64);
    }
  };

  const handleReset = () => {
    setPreview(null);
    setImageBase64(null);
    setScanResult(null);
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-64 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#E5E5E5] bg-white transition-colors"
          >
            <div className="rounded-full bg-[#F0F0F0] p-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[#0D0D0D]">Prendre une photo</p>
              <p className="text-xs text-[#8A8A8A]">ou importer depuis la galerie</p>
            </div>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-full bg-[#F0F0F0] px-4 py-2 text-sm text-[#0D0D0D]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Importer un fichier
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img src={preview} alt="Aperçu" className="w-full rounded-2xl object-cover" />
            <button
              onClick={handleReset}
              className="absolute right-2 top-2 rounded-full bg-[#0D0D0D]/50 p-1.5 text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {!scanResult ? (
            <button
              onClick={handleScan}
              disabled={scanning}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0D0D0D] py-3 text-sm font-medium text-white disabled:opacity-50"
            >
              {scanning ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Analyse en cours...
                </>
              ) : (
                'Analyser avec l\'IA'
              )}
            </button>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[#0D0D0D]">Tags détectés</h3>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-[#F0F0F0] px-3 py-1 text-xs font-medium text-[#0D0D0D]">
                  {scanResult.category}
                </span>
                <span className="rounded-full bg-[#F0F0F0] px-3 py-1 text-xs font-medium text-[#0D0D0D]">
                  {scanResult.primary_color}
                </span>
                <span className="rounded-full bg-[#F0F0F0] px-3 py-1 text-xs font-medium text-[#0D0D0D]">
                  {scanResult.material_guess}
                </span>
                {scanResult.style_tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-[#F0F0F0] px-3 py-1 text-xs font-medium text-[#0D0D0D]">
                    {tag}
                  </span>
                ))}
              </div>

              <button
                onClick={handleConfirm}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0D0D0D] py-3 text-sm font-medium text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Ajouter au dressing
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
