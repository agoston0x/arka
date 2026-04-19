'use client';

import { useEffect, useRef, useState } from 'react';

const rayPaths = [
  'M3 46L33 38L3 30L0 38L3 46Z',
  'M3.59808 27.3555L33.5788 35.4273L11.5981 13.4991L5 18.9273L3.59808 27.3555Z',
  'M13.5 11.5981L35.4282 33.5788L27.3564 3.59808L18.9282 5L13.5 11.5981Z',
  'M30 3L38 33L46 3L38 0L30 3Z',
  'M49 3.59808L40.9282 33.5788L62.8564 11.5981L57.4282 5L49 3.59808Z',
  'M64.981 13.5L43.0003 35.4282L72.981 27.3564L71.5791 18.9282L64.981 13.5Z',
  'M74 30L44 38L74 46L77 38L74 30Z',
];

const rayColors = ['#00AEEF', '#8DC63F', '#FFF200', '#F7941D', '#ED1C24', '#E5007D', '#662D91'];

const letterPaths = [
  'M16.5004 64.3484C15.1337 64.3484 13.8837 63.9984 12.7504 63.2984C11.6171 62.5818 10.7087 61.6318 10.0254 60.4484C9.35872 59.2484 9.02539 57.9318 9.02539 56.4984C9.02539 55.0651 9.35872 53.7568 10.0254 52.5734C10.7087 51.3734 11.6171 50.4234 12.7504 49.7234C13.8837 49.0068 15.1337 48.6484 16.5004 48.6484C17.4837 48.6484 18.3921 48.8234 19.2254 49.1734C20.0587 49.5234 20.7671 50.0151 21.3504 50.6484V48.9984H24.7754V63.9984H21.3504V62.3484C20.7671 62.9651 20.0587 63.4568 19.2254 63.8234C18.3921 64.1734 17.4837 64.3484 16.5004 64.3484ZM16.9754 60.8734C17.7754 60.8734 18.4921 60.6734 19.1254 60.2734C19.7754 59.8734 20.2921 59.3484 20.6754 58.6984C21.0587 58.0318 21.2504 57.2984 21.2504 56.4984C21.2504 55.6984 21.0587 54.9734 20.6754 54.3234C20.2921 53.6568 19.7754 53.1234 19.1254 52.7234C18.4921 52.3234 17.7837 52.1234 17.0004 52.1234C16.2004 52.1234 15.4754 52.3234 14.8254 52.7234C14.1921 53.1234 13.6837 53.6568 13.3004 54.3234C12.9171 54.9734 12.7254 55.6984 12.7254 56.4984C12.7254 57.2984 12.9171 58.0318 13.3004 58.6984C13.6837 59.3484 14.1921 59.8734 14.8254 60.2734C15.4754 60.6734 16.1921 60.8734 16.9754 60.8734Z',
  'M26.6826 64.0016V49.0016H30.2076V51.6266C30.741 50.7599 31.4076 50.0849 32.2076 49.6016C33.0243 49.1016 33.9909 48.8516 35.1076 48.8516L35.9826 52.4016C35.6659 52.3016 35.3076 52.2516 34.9076 52.2516C33.6076 52.2516 32.566 52.6682 31.7826 53.5016C30.9993 54.3349 30.6076 55.5182 30.6076 57.0516V64.0016H26.6826Z',
  'M46.2336 64L40.0336 55.75L45.1336 49H49.4086L44.4086 55.425L50.9086 64H46.2336ZM36.3086 64V40H40.2336V64H36.3086Z',
  'M56.6625 64.3484C55.2958 64.3484 54.0458 63.9984 52.9125 63.2984C51.7792 62.5818 50.8708 61.6318 50.1875 60.4484C49.5208 59.2484 49.1875 57.9318 49.1875 56.4984C49.1875 55.0651 49.5208 53.7568 50.1875 52.5734C50.8708 51.3734 51.7792 50.4234 52.9125 49.7234C54.0458 49.0068 55.2958 48.6484 56.6625 48.6484C57.6458 48.6484 58.5542 48.8234 59.3875 49.1734C60.2208 49.5234 60.9292 50.0151 61.5125 50.6484V48.9984H64.9375V63.9984H61.5125V62.3484C60.9292 62.9651 60.2208 63.4568 59.3875 63.8234C58.5542 64.1734 57.6458 64.3484 56.6625 64.3484ZM57.1375 60.8734C57.9375 60.8734 58.6542 60.6734 59.2875 60.2734C59.9375 59.8734 60.4542 59.3484 60.8375 58.6984C61.2208 58.0318 61.4125 57.2984 61.4125 56.4984C61.4125 55.6984 61.2208 54.9734 60.8375 54.3234C60.4542 53.6568 59.9375 53.1234 59.2875 52.7234C58.6542 52.3234 57.9458 52.1234 57.1625 52.1234C56.3625 52.1234 55.6375 52.3234 54.9875 52.7234C54.3542 53.1234 53.8458 53.6568 53.4625 54.3234C53.0792 54.9734 52.8875 55.6984 52.8875 56.4984C52.8875 57.2984 53.0792 58.0318 53.4625 58.6984C53.8458 59.3484 54.3542 59.8734 54.9875 60.2734C55.6375 60.6734 56.3542 60.8734 57.1375 60.8734Z',
];

const LETTER_COLOR = '#E5007D';

// Timing (ms) — one cycle
const RAY_STAGGER = 100;
const RAY_DUR = 180;
const RAYS_TOTAL = rayPaths.length * RAY_STAGGER + RAY_DUR;
const LETTER_PAUSE = 150; // pause after rays before text
const LETTER_STAGGER = 70;
const LETTER_DUR = 350;
const LETTERS_TOTAL = letterPaths.length * LETTER_STAGGER + LETTER_DUR;
const HOLD = 400; // hold everything visible
const FADE_OUT = 300; // fade everything out before next loop
const CYCLE = RAYS_TOTAL + LETTER_PAUSE + LETTERS_TOTAL + HOLD + FADE_OUT;

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

interface Props {
  onFinished?: () => void;
}

export default function ArkaSplash({ onFinished }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fading, setFading] = useState(false);
  const readyRef = useRef(false);

  // Listen for page ready signal
  useEffect(() => {
    const handler = () => {
      readyRef.current = true;
    };
    window.addEventListener('arka-ready', handler);
    return () => window.removeEventListener('arka-ready', handler);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const DISPLAY_W = 300;
    const DISPLAY_H = 260;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = DISPLAY_W * dpr;
    canvas.height = DISPLAY_H * dpr;
    canvas.style.width = DISPLAY_W + 'px';
    canvas.style.height = DISPLAY_H + 'px';
    ctx.scale(dpr, dpr);

    const SVG_W = 77;
    const SVG_H = 65;
    const SCALE = 3.5;
    const OFFSET_X = (DISPLAY_W - SVG_W * SCALE) / 2;
    const OFFSET_Y = (DISPLAY_H - SVG_H * SCALE) / 2;

    const rayPath2Ds = rayPaths.map((d) => new Path2D(d));
    const letterPath2Ds = letterPaths.map((d) => new Path2D(d));

    let startTime: number | null = null;
    let animId = 0;

    function drawFrame(elapsed: number) {
      // Loop: get position within current cycle
      const cyclePos = elapsed % CYCLE;

      // Calculate global fade-out at end of cycle
      const fadeOutStart = CYCLE - FADE_OUT;
      const cycleFade = cyclePos > fadeOutStart ? 1 - clamp01((cyclePos - fadeOutStart) / FADE_OUT) : 1;

      ctx!.clearRect(0, 0, DISPLAY_W, DISPLAY_H);
      ctx!.save();
      ctx!.translate(OFFSET_X, OFFSET_Y);
      ctx!.scale(SCALE, SCALE);

      // Rays — animate left to right (index 0 = leftmost)
      rayPath2Ds.forEach((path, i) => {
        const t0 = i * RAY_STAGGER;
        const t = clamp01((cyclePos - t0) / RAY_DUR);
        if (t <= 0) return;
        ctx!.save();
        ctx!.globalAlpha = easeOutCubic(t) * cycleFade;
        ctx!.fillStyle = rayColors[i];
        ctx!.fill(path, 'evenodd');
        ctx!.restore();
      });

      // Letters — appear after rays
      const letterStart = RAYS_TOTAL + LETTER_PAUSE;
      letterPath2Ds.forEach((path, i) => {
        const t0 = letterStart + i * LETTER_STAGGER;
        const t = clamp01((cyclePos - t0) / LETTER_DUR);
        if (t <= 0) return;
        const eased = easeOutCubic(t);
        ctx!.save();
        ctx!.globalAlpha = eased * cycleFade;
        ctx!.translate(0, (1 - eased) * 3);
        ctx!.fillStyle = LETTER_COLOR;
        ctx!.fill(path, 'evenodd');
        ctx!.restore();
      });

      ctx!.restore();
    }

    function loop(ts: number) {
      if (startTime === null) startTime = ts;
      const elapsed = ts - startTime;
      drawFrame(elapsed);

      // Check if page is ready — only dismiss after completing current cycle
      if (readyRef.current) {
        const cyclePos = elapsed % CYCLE;
        // Wait for a natural end-of-cycle moment to fade out
        if (cyclePos > CYCLE - FADE_OUT - 50) {
          setFading(true);
          setTimeout(() => {
            onFinished?.();
          }, 500);
          return;
        }
      }

      animId = requestAnimationFrame(loop);
    }

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [onFinished]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-500 ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <canvas ref={canvasRef} aria-label="arka animated logo" />
    </div>
  );
}
