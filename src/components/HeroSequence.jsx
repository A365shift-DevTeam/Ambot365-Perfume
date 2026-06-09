import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 240;

// Build the frame path for a given index (1-indexed)
const framePath = (index) => {
  const num = String(index).padStart(3, '0');
  return `/perfume/images-seq/ezgif-frame-${num}.webp`;
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
    let loadedCount = 0;

    // Set canvas size to match viewport
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Render a frame on the canvas (cover-fit)
    const renderFrame = (index) => {
      const img = images[index];
      if (!img || !img.complete) return;

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
    };

    // Preload all frames
    const preloadImages = () => {
      for (let i = 0; i < FRAME_COUNT; i++) {
        const img = new Image();
        img.src = framePath(i + 1);
        img.onload = () => {
          loadedCount++;
          const progress = Math.round((loadedCount / FRAME_COUNT) * 100);
          setLoadProgress(progress);
          if (loadedCount === FRAME_COUNT) {
            setLoaded(true);
            renderFrame(0);
            initScrollAnimation();
          }
        };
        images[i] = img;
      }
      imagesRef.current = images;
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
