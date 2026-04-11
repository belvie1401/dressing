'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function RoleSwitcher() {
  const router = useRouter();
  const activeRole = useAuthStore((s) => s.activeRole);
  const isDualRole = useAuthStore((s) => s.isDualRole);
  const switchRole = useAuthStore((s) => s.switchRole);

  if (!isDualRole) return null;

  const handleSwitch = async () => {
    const newRole = activeRole === 'CLIENT' ? 'STYLIST' : 'CLIENT';
    await switchRole(newRole);
    router.push(newRole === 'STYLIST' ? '/stylist-dashboard' : '/dashboard');
  };

  return (
    <button
      type="button"
      onClick={handleSwitch}
      className="fixed top-5 right-5 z-50 bg-white shadow-lg rounded-full border border-[#EFEFEF] px-4 py-2 flex items-center gap-2"
    >
      {activeRole === 'CLIENT' ? (
        <>
          {/* Hanger icon */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#111111"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2C12 2 8 2 8 6H4l1 14h14l1-14h-4c0-4-4-4-4-4z" />
            <line x1="8" y1="6" x2="8" y2="8" />
            <line x1="16" y1="6" x2="16" y2="8" />
          </svg>
          <span className="text-sm text-[#111111] font-medium">Mode Styliste</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8A8A8A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </>
      ) : (
        <>
          {/* Person icon */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#111111"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="text-sm text-[#111111] font-medium">Mode Cliente</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8A8A8A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </>
      )}
    </button>
  );
}
