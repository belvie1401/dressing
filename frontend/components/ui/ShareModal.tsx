'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';

const APP_URL = 'https://lucent-melba-a4edb5.netlify.app';

interface Stats {
  referral_code: string;
  referral_count: number;
  free_months: number;
}

interface Props {
  onClose: () => void;
}

export default function ShareModal({ onClose }: Props) {
  const user = useAuthStore((s) => s.user);
  const fallbackCode = user?.referral_code || ('LIEN-' + (user?.id || '').slice(0, 6).toUpperCase());

  const [stats, setStats] = useState<Stats>({
    referral_code: fallbackCode,
    referral_count: user?.referral_count ?? 0,
    free_months: user?.free_months_earned ?? 0,
  });
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    api.get<Stats>('/referral/stats').then((res) => {
      if (res.success && res.data) setStats(res.data);
    });
  }, []);

  const referralUrl = `${APP_URL}/register?ref=${stats.referral_code}`;
  const shareText = `D\u00e9couvrez LIEN, l\u2019app qui connecte votre dressing \u00e0 des stylistes pro\u00a0! Inscrivez-vous avec mon code\u00a0: ${stats.referral_code} \u2192 ${referralUrl}`;

  const copyCode = async () => {
    await navigator.clipboard.writeText(stats.referral_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareWhatsApp = () => {
    window.open('https://wa.me/?text=' + encodeURIComponent(shareText), '_blank');
  };

  const shareSMS = () => {
    window.open('sms:?body=' + encodeURIComponent(shareText));
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'LIEN \u2014 Votre dressing connect\u00e9',
          text: shareText,
          url: referralUrl,
        });
      } catch {
        // user dismissed
      }
    } else {
      await copyLink();
    }
  };

  const progressPct = Math.min((stats.referral_count / 5) * 100, 100);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Fermer"
      />

      {/* Card */}
      <div className="relative z-10 bg-white rounded-t-3xl p-6 max-w-md mx-auto w-full">
        {/* Handle */}
        <div className="w-10 h-1 bg-[#CFCFCF] rounded-full mx-auto mb-6" />

        {/* Header */}
        <h2 className="font-serif text-xl text-[#111111]">
          Invitez vos proches
        </h2>
        <p className="text-sm text-[#8A8A8A] mt-2 leading-relaxed">
          Partagez LIEN avec vos amis et gagnez 1 mois gratuit pour chaque
          inscription&nbsp;!
        </p>

        {/* Referral code */}
        <div className="mt-6">
          <p className="text-xs text-[#8A8A8A] uppercase tracking-wide">
            Votre code de parrainage
          </p>
          <div className="bg-[#F0EDE8] rounded-2xl px-5 py-4 mt-2 flex justify-between items-center gap-3">
            <span
              className="font-serif text-xl text-[#111111]"
              style={{ letterSpacing: '3px' }}
            >
              {stats.referral_code}
            </span>
            <button
              type="button"
              onClick={copyCode}
              className="bg-[#111111] text-white rounded-full px-4 py-2 text-xs font-medium shrink-0 transition-all"
            >
              {copied ? 'Copi\u00e9 \u2713' : 'Copier'}
            </button>
          </div>
        </div>

        {/* Share options */}
        <div className="mt-6">
          <p className="text-xs text-[#8A8A8A] uppercase tracking-wide mb-3">
            Partager via
          </p>
          <div className="grid grid-cols-4 gap-3">
            {/* WhatsApp */}
            <button
              type="button"
              onClick={shareWhatsApp}
              className="flex flex-col items-center gap-1"
            >
              <span className="w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M11.997 0C5.374 0 0 5.373 0 11.997c0 2.117.554 4.102 1.522 5.828L.057 24l6.318-1.635A11.954 11.954 0 0 0 11.997 24C18.62 24 24 18.626 24 11.997 24 5.373 18.621 0 11.997 0zm0 21.818a9.824 9.824 0 0 1-5.011-1.373l-.36-.214-3.727.977.995-3.63-.235-.374A9.819 9.819 0 0 1 2.18 12c0-5.418 4.4-9.818 9.817-9.818 5.418 0 9.82 4.4 9.82 9.818 0 5.418-4.402 9.818-9.82 9.818z" />
                </svg>
              </span>
              <span className="text-[10px] text-[#8A8A8A]">WhatsApp</span>
            </button>

            {/* Copy link */}
            <button
              type="button"
              onClick={copyLink}
              className="flex flex-col items-center gap-1"
            >
              <span className="w-14 h-14 rounded-full bg-[#F0EDE8] flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#111111"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </span>
              <span className="text-[10px] text-[#8A8A8A]">
                {copiedLink ? 'Copi\u00e9\u00a0\u2713' : 'Lien'}
              </span>
            </button>

            {/* SMS */}
            <button
              type="button"
              onClick={shareSMS}
              className="flex flex-col items-center gap-1"
            >
              <span className="w-14 h-14 rounded-full bg-[#34C759] flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              <span className="text-[10px] text-[#8A8A8A]">SMS</span>
            </button>

            {/* Native share / fallback */}
            <button
              type="button"
              onClick={shareNative}
              className="flex flex-col items-center gap-1"
            >
              <span className="w-14 h-14 rounded-full bg-[#111111] flex items-center justify-center">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </span>
              <span className="text-[10px] text-[#8A8A8A]">Autres</span>
            </button>
          </div>
        </div>

        {/* Reward info */}
        <div className="mt-6 bg-[#F0EDE8] rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C6A47E"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 mt-0.5"
            >
              <polyline points="20 12 20 22 4 22 4 12" />
              <rect x="2" y="7" width="20" height="5" />
              <line x1="12" y1="22" x2="12" y2="7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#111111]">
                Programme de parrainage
              </p>
              <p className="text-xs text-[#8A8A8A] mt-1 leading-relaxed">
                Gagnez 1 mois gratuit pour chaque ami qui s&rsquo;inscrit avec
                votre code.
              </p>
              <div className="mt-3">
                <p className="text-xs text-[#111111] font-medium">
                  {stats.referral_count}{' '}
                  ami{stats.referral_count !== 1 ? 's' : ''} inscrit
                  {stats.referral_count !== 1 ? 's' : ''}
                </p>
                <div className="bg-[#CFCFCF] rounded-full h-1.5 w-full mt-1">
                  <div
                    className="bg-[#C6A47E] rounded-full h-full transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="w-full text-sm text-[#8A8A8A] text-center mt-6"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
