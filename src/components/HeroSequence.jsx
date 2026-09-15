import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 240;
// Every Nth frame loads first so the hero can render before the rest arrive.
const KEYFRAME_STEP = 8;

// Frames live on Cloudinary (uploaded by scripts/upload-frames-cloudinary.mjs).
// The cloud name is public, so a default keeps deploys working without env vars.
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dghhdz3et';
// Source frames are 1920x1080 WebP; re-encoding at full width comes out larger
// than the originals, so the ladder stops at 1280 (the canvas upscales on big screens).
const FRAME_WIDTHS = [960, 1280];

// Smallest width that still covers the viewport once cover-fit crops the frame.
const pickFrameWidth = () => {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const needed = Math.max(window.innerWidth, window.innerHeight * (16 / 9)) * dpr;
  return FRAME_WIDTHS.find((w) => w >= needed) ?? FRAME_WIDTHS[FRAME_WIDTHS.length - 1];
};

// Build the frame URL for a given index (1-indexed)
const framePath = (index, width) => {
  const num = String(index).padStart(3, '0');
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto:eco,w_${width}/perfume-demo/frames/frame-${num}`;
};

const HeroSequence = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const imagesRef = useRef([]);
  const frameIndexRef = useRef({ value: 0 });
  const [loadProgress, setLoadProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const images = [];
    let cancelled = false;

    // Set canvas size to match viewport (resizing clears the canvas, so redraw)
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      renderFrame(Math.round(frameIndexRef.current.value));
    };
    const isReady = (img) => img && img.complete && img.naturalWidth > 0;

    // Render a frame on the canvas (cover-fit). If it hasn't loaded yet,
    // fall back to the nearest loaded frame so scrubbing never goes blank.
    function renderFrame(index) {
      let img = images[index];
      for (let d = 1; !isReady(img) && d < FRAME_COUNT; d++) {
        img = isReady(images[index - d]) ? images[index - d] : images[index + d];
      }
      if (!isReady(img)) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate cover fit
      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.max(cw / iw, ch / ih);
      const sw = iw * scale;
      const sh = ih * scale;
      const sx = (cw - sw) / 2;
      const sy = (ch - sh) / 2;

      ctx.drawImage(img, sx, sy, sw, sh);
    }

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    const loadFrame = (i, width) =>
      new Promise((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = img.onerror = () => resolve();
        img.src = framePath(i + 1, width);
        images[i] = img;
      });

    // Load keyframes first (drives the loader), then backfill the rest
    const preloadImages = async () => {
      const width = pickFrameWidth();
      const keyframes = [];
      const others = [];
      for (let i = 0; i < FRAME_COUNT; i++) {
        (i % KEYFRAME_STEP === 0 || i === FRAME_COUNT - 1 ? keyframes : others).push(i);
      }
      imagesRef.current = images;

      let keyLoaded = 0;
      await Promise.all(
        keyframes.map((i) =>
          loadFrame(i, width).then(() => {
            keyLoaded++;
            if (!cancelled) setLoadProgress(Math.round((keyLoaded / keyframes.length) * 100));
          })
        )
      );
      if (cancelled) return;

      setLoaded(true);
      renderFrame(0);
      initScrollAnimation();

      // Backfill a few at a time so it doesn't compete with scrolling
      const BATCH = 6;
      for (let b = 0; b < others.length && !cancelled; b += BATCH) {
        await Promise.all(others.slice(b, b + BATCH).map((i) => loadFrame(i, width)));
      }
    };

    // Initialize GSAP ScrollTrigger animation
    const initScrollAnimation = () => {
      const obj = frameIndexRef.current;

      // Main frame scrubber
      gsap.to(obj, {
        value: FRAME_COUNT - 1,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          onUpdate: () => {
            const frameIdx = Math.round(obj.value);
            renderFrame(frameIdx);
          },
        },
      });


    };

    preloadImages();

    return () => {
      cancelled = true;
      window.removeEventListener('resize', setCanvasSize);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="hero-sequence-container"
      style={{ height: '500vh', position: 'relative' }}
    >
      {/* Sticky canvas viewport */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* Loading state */}
        {!loaded && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#050807',
              zIndex: 100,
            }}
          >
            <div
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '1.5rem',
                color: '#6B8E78',
                marginBottom: '2rem',
                letterSpacing: '0.2em',
              }}
            >
              Ambot365
            </div>
            <div
              style={{
                width: '200px',
                height: '2px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${loadProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #4a7c59, #6B8E78, #8fb89e)',
                  borderRadius: '2px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <div
              style={{
                marginTop: '1rem',
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.15em',
              }}
            >
              {loadProgress}%
            </div>
          </div>
        )}

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
          }}
        />

        {/* Subtle vignette overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at center, transparent 40%, rgba(5,8,7,0.6) 100%)',
            pointerEvents: 'none',
          }}
        />


      </div>
    </div>
  );
};

export default HeroSequence;
