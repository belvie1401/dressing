'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface View360Props {
  frontUrl: string;
  backUrl: string;
  alt?: string;
  className?: string;
  /** Object-fit applied to the images (default: "cover") */
  fit?: 'cover' | 'contain';
}

/**
 * View360 — simulated 360° view using two still photos (front + back).
 *
 * Users rotate by swiping (touch) or dragging (mouse) horizontally. After
 * crossing a 50px threshold, the view snaps to the other face, fires a short
 * haptic vibration (when supported) and the drag offset resets.
 *
 * A small first-time hint ("← Glissez pour faire pivoter →") is overlaid once
 * per device and persisted in localStorage under `lien-360-hint`.
 */
export default function View360({
  frontUrl,
  backUrl,
  alt = 'Vue 360°',
  className = '',
  fit = 'cover',
}: View360Props) {
  // 0 = front, 1 = back
  const [rotation, setRotation] = useState<0 | 1>(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const startXRef = useRef<number | null>(null);
  const switchedRef = useRef(false);

  // Show first-time hint once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seen = localStorage.getItem('lien-360-hint');
    if (!seen) {
      setShowHint(true);
      const t = setTimeout(() => {
        setShowHint(false);
        localStorage.setItem('lien-360-hint', '1');
      }, 3500);
      return () => clearTimeout(t);
    }
  }, []);

  const THRESHOLD = 50;

  const commitSwitch = useCallback(() => {
    if (switchedRef.current) return;
    switchedRef.current = true;
    setRotation((r) => (r === 0 ? 1 : 0));
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // ignore
      }
    }
  }, []);

  const onPointerDown = (clientX: number) => {
    startXRef.current = clientX;
    switchedRef.current = false;
    setDragging(true);
    if (showHint) {
      setShowHint(false);
      localStorage.setItem('lien-360-hint', '1');
    }
  };

  const onPointerMove = (clientX: number) => {
    if (startXRef.current === null) return;
    const delta = clientX - startXRef.current;
    setDragOffset(delta);
    if (Math.abs(delta) >= THRESHOLD) {
      commitSwitch();
    }
  };

  const onPointerEnd = () => {
    startXRef.current = null;
    setDragging(false);
    setDragOffset(0);
  };

  // Touch
  const handleTouchStart = (e: React.TouchEvent) => {
    onPointerDown(e.touches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    onPointerMove(e.touches[0].clientX);
  };
  const handleTouchEnd = () => onPointerEnd();

  // Mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onPointerDown(e.clientX);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (startXRef.current === null) return;
    onPointerMove(e.clientX);
  };
  const handleMouseUp = () => onPointerEnd();
  const handleMouseLeave = () => {
    if (startXRef.current !== null) onPointerEnd();
  };

  // Drag progress in [-1, 1] used for subtle 3D tilt
  const dragProgress = Math.max(-1, Math.min(1, dragOffset / THRESHOLD));
  const tiltDeg = dragProgress * 0.3 * 30; // scaled for visible effect

  const fitClass = fit === 'cover' ? 'object-cover' : 'object-contain';

  return (
    <div
      className={`relative h-full w-full overflow-hidden select-none ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ touchAction: 'pan-y', cursor: dragging ? 'grabbing' : 'grab' }}
    >
      {/* 3D wrapper — applies tilt during drag */}
      <div
        className="absolute inset-0"
        style={{
          transform: dragging
            ? `perspective(400px) rotateY(${tiltDeg}deg)`
            : undefined,
          transition: dragging ? 'none' : 'transform 260ms ease-out',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Front image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={frontUrl}
          alt={`${alt} — face`}
          draggable={false}
          className={`absolute inset-0 h-full w-full ${fitClass} transition-opacity duration-200`}
          style={{ opacity: rotation === 0 ? 1 : 0 }}
        />
        {/* Back image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={backUrl}
          alt={`${alt} — dos`}
          draggable={false}
          className={`absolute inset-0 h-full w-full ${fitClass} transition-opacity duration-200`}
          style={{ opacity: rotation === 1 ? 1 : 0 }}
        />
      </div>

      {/* 360° pill indicator (top-right) */}
      <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 backdrop-blur-sm">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin-slow">
          <circle cx="12" cy="12" r="9" opacity="0.35" />
          <path d="M21 12a9 9 0 0 1-9 9" />
        </svg>
        <span className="text-[9px] font-semibold uppercase tracking-wider text-white">
          360°
        </span>
      </div>

      {/* Current face label (bottom) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-7">
        <span className="rounded-full bg-black/55 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-sm">
          {rotation === 0 ? 'Face' : 'Dos'}
        </span>
      </div>

      {/* Rotation dots (bottom center) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
        <span
          className={`h-1.5 w-1.5 rounded-full transition-colors ${
            rotation === 0 ? 'bg-white' : 'bg-white/40'
          }`}
        />
        <span
          className={`h-1.5 w-1.5 rounded-full transition-colors ${
            rotation === 1 ? 'bg-white' : 'bg-white/40'
          }`}
        />
      </div>

      {/* First-time hint overlay */}
      {showHint && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="flex items-center gap-3 rounded-full bg-white/95 px-4 py-2 shadow-lg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce-left">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="text-[11px] font-medium text-[#111111]">
              Glissez pour faire pivoter
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce-right">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
