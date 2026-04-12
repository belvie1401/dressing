/**
 * Plays a subtle two-tone notification chime using the Web Audio API.
 * No external audio file needed — the sound is generated in real-time.
 * Silently fails if the browser doesn't support AudioContext or the user
 * hasn't interacted with the page yet (autoplay policy).
 */
export function playNotificationSound(): void {
  try {
    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);

    // Clean up the context after the sound finishes
    setTimeout(() => {
      ctx.close();
    }, 500);
  } catch {
    // Silent fail — audio not available or blocked by autoplay policy
  }
}
