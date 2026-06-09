import React, { useEffect } from 'react';
import Lenis from 'lenis';
import HeroSequence from './components/HeroSequence';

const Perfume = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      smooth: true,
    });
    const raf = (t) => {
      lenis.raf(t);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  const perfumeImages = {
    topNotes:
      'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80',
    heartNotes:
      'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    baseNotes:
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
  };

  return (
    <div className="perfume-page">
      {/* Navigation */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: '1.5rem 4rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(5,8,7,0.8)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          style={{
            fontFamily: 'Cinzel,serif',
            fontSize: '1.5rem',
            letterSpacing: '0.1em',
          }}
        >
          Ambot365
        </div>
        <div
          style={{
            display: 'flex',
            gap: '2.5rem',
            fontSize: '0.85rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          <a href="#notes">Notes</a>
          <a href="#ingredients">Ingredients</a>
          <a href="#gallery">Gallery</a>
        </div>
        <button
          style={{
            border: '1px solid #6B8E78',
            padding: '0.6rem 1.6rem',
            fontSize: '0.8rem',
            letterSpacing: '0.1em',
            background: 'transparent',
            color: '#EAEAEA',
            cursor: 'pointer',
          }}
        >
          Shop Now
        </button>
      </nav>

      {/* Hero with scroll-driven 3D animation */}
      <HeroSequence />

      {/* Notes Section */}
      <section id="notes" style={{ padding: '8rem 4rem', background: '#050807' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'Cinzel,serif',
              fontSize: '3rem',
              textAlign: 'center',
              marginBottom: '4rem',
            }}
          >
            The Olfactory Journey
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(350px,1fr))',
              gap: '2rem',
            }}
          >
            {[
              {
                title: 'Top Notes',
                img: perfumeImages.topNotes,
                desc: 'Bergamot, Pink Pepper, and Yuzu.',
              },
              {
                title: 'Heart Notes',
                img: perfumeImages.heartNotes,
                desc: 'Damascena Rose, Jasmine Sambac.',
              },
              {
                title: 'Base Notes',
                img: perfumeImages.baseNotes,
                desc: 'Oud Wood, Ambergris, Tahitian Vanilla.',
              },
            ].map((n, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: 280,
                    backgroundImage: `url(${n.img})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div style={{ padding: '2rem' }}>
                  <h3
                    style={{
                      fontFamily: 'Cinzel,serif',
                      color: '#6B8E78',
                      fontSize: '1.5rem',
                    }}
                  >
                    {n.title}
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)' }}>{n.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '3rem 4rem',
          background: '#050807',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'rgba(255,255,255,0.4)',
        }}
      >
        © Ambot365 — {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default Perfume;