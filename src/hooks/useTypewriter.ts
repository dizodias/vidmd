import { useEffect, useState } from 'react';

interface UseTypewriterOptions {
  text: string;
  enabled?: boolean;
  /** Target duration for the full reveal, in ms. */
  durationMs?: number;
}

interface UseTypewriterResult {
  displayedText: string;
  isTyping: boolean;
}

export function useTypewriter({
  text,
  enabled = true,
  durationMs = 2200,
}: UseTypewriterOptions): UseTypewriterResult {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!enabled || !text) {
      setDisplayedText(text);
      setIsTyping(false);
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReducedMotion) {
      setDisplayedText(text);
      setIsTyping(false);
      return;
    }

    let index = 0;
    let frameId = 0;
    let lastTick = 0;

    const charsPerSecond = Math.max(24, Math.ceil((text.length * 1000) / durationMs));
    const msPerChar = 1000 / charsPerSecond;

    setDisplayedText('');
    setIsTyping(true);

    const tick = (timestamp: number) => {
      if (!lastTick) lastTick = timestamp;
      const elapsed = timestamp - lastTick;

      if (elapsed >= msPerChar) {
        const steps = Math.max(1, Math.floor(elapsed / msPerChar));
        index = Math.min(text.length, index + steps);
        setDisplayedText(text.slice(0, index));
        lastTick = timestamp;
      }

      if (index < text.length) {
        frameId = window.requestAnimationFrame(tick);
      } else {
        setIsTyping(false);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [text, enabled, durationMs]);

  return { displayedText, isTyping };
}
