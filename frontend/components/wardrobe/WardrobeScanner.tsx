'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, Loader2, X, Check } from 'lucide-react';
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
            className="flex h-64 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-gray-400 hover:bg-gray-100"
          >
            <div className="rounded-full bg-white p-3 shadow-sm">
              <Camera className="h-6 w-6 text-gray-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">Prendre une photo</p>
              <p className="text-xs text-gray-500">ou importer depuis la galerie</p>
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
            className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-600 hover:bg-gray-200"
          >
            <Upload className="h-4 w-4" />
            Importer un fichier
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img src={preview} alt="Aperçu" className="w-full rounded-2xl object-cover" />
            <button
              onClick={handleReset}
              className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {!scanResult ? (
            <button
              onClick={handleScan}
              disabled={scanning}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-black py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {scanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                'Analyser avec l\'IA'
              )}
            </button>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Tags détectés</h3>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                  {scanResult.category}
                </span>
                <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                  {scanResult.primary_color}
                </span>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  {scanResult.material_guess}
                </span>
                {scanResult.style_tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    {tag}
                  </span>
                ))}
              </div>

              <button
                onClick={handleConfirm}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-black py-3 text-sm font-medium text-white hover:bg-gray-800"
              >
                <Check className="h-4 w-4" />
                Ajouter au dressing
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
