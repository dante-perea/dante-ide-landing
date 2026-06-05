/* film.jsx — Dante film: scene overlays composed over the continuous FilmCanvas.
   Letterbox + grain frame the picture; Sprites time the text beats, the voice orb,
   the decision checkpoint, the modes/primitives montage, and the logo + CTA.

   Orientation-aware: window.__DANTE_FILM (set by film_bg.jsx) tells us whether we're
   on the wide 1920×1080 landscape/desktop stage or the tall 1080×1920 portrait stage.
   The `P` layout below repositions every overlay for a vertical screen — text moves
   into a column, the cards stack, and elements scale up so they stay legible once the
   tall stage is cover-fit onto a phone. Landscape values are unchanged from the design. */
const { useState, useEffect } = React;
const FC = { ink: '#f6f1e7', ink2: '#cbc6ba', ink3: '#8a8578', ink4: '#5a564c',
  mint: '#7fdba4', aqua: '#8fd0e0', iris: '#a99bf5', amber: '#e0a458' };
const SERIF = "'Instrument Serif', serif", SANS = "'Hanken Grotesk', sans-serif", MONO = "'JetBrains Mono', monospace";
const { Sprite, useSprite, useTime, Easing, clamp } = window;
const sm = (a, b, t) => { const x = clamp((t - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };

const FILM = window.__DANTE_FILM || { portrait: false, W: 1920, H: 1080 };
const PORTRAIT = FILM.portrait === true;

// per-orientation overlay layout (positions are in the virtual stage coordinate space)
const P = PORTRAIT ? {
  sc1: { y: 740, size: 56 },
  sc2: { y: 220, size: 88, sub: 26 },
  orbTop: 980, orbScale: 1.5,
  sc3line: { y: 700, size: 38 },
  sc4: { y: 560, size: 84 },
  cardTop: 700, cardScale: 1.5,
  sc5line: { y: 430, size: 60 },
  sc6line: { y: 360, size: 60 }, chipsTop: 620, chipsScale: 1.4, chipsStack: true, chipW: 380,
  logoScale: 1.32,
} : {
  sc1: { y: 760, size: 34 },
  sc2: { y: 150, size: 66, sub: 15 },
  orbTop: 446, orbScale: 1,
  sc3line: { y: 250, size: 30 },
  sc4: { y: 150, size: 58 },
  cardTop: 372, cardScale: 1,
  sc5line: { y: 210, size: 44 },
  sc6line: { y: 210, size: 46 }, chipsTop: 392, chipsScale: 1, chipsStack: false, chipW: 320,
  logoScale: 1,
};

/* ── cinematic letterbox bars (slide in, hold, slide out) ── */
function Letterbox() {
  const t = useTime();
  if (window.DANTE_LANDING === true) return null;   // full-screen on the landing — no cinematic bars
  const inn = sm(0, 1.4, t);
  const barH = 130 * inn;
  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: barH, background: '#000', zIndex: 40 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: barH, background: '#000', zIndex: 40 }} />
    </>
  );
}

/* ── drifting film grain ── */
function Grain() {
  return <div style={{ position: 'absolute', inset: -20, zIndex: 38, pointerEvents: 'none', opacity: 0.05, mixBlendMode: 'soft-light',
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
    backgroundSize: '200px 200px', animation: 'grain 6.5s steps(7) infinite' }} />;
}

/* generic centered line that fades + drifts up, honoring its Sprite window */
function Line({ children, y, size = 40, color = FC.ink, font = SERIF, weight = 400, ls = '-0.01em', sub, subSize = 15, glow }) {
  const { localTime, duration } = useSprite();
  const fin = sm(0, 0.9, localTime), fout = 1 - sm(duration - 0.8, duration, localTime);
  const op = fin * fout;
  const ty = (1 - fin) * 22 - (1 - fout) * 14;
  return (
    <div style={{ position: 'absolute', left: '50%', top: y, transform: `translate(-50%, ${ty}px)`, opacity: op,
      textAlign: 'center', width: '90%', zIndex: 30, willChange: 'transform, opacity' }}>
      <div style={{ fontFamily: font, fontWeight: weight, fontSize: size, color, letterSpacing: ls, lineHeight: 1.08,
        textShadow: glow ? `0 0 44px ${glow}` : '0 2px 30px rgba(0,0,0,.6)' }}>{children}</div>
      {sub && <div style={{ fontFamily: MONO, fontSize: subSize, letterSpacing: '.16em', textTransform: 'uppercase', color: FC.ink3, marginTop: 16 }}>{sub}</div>}
    </div>
  );
}

/* ── the voice orb (Siri pill) ── */
function Orb() {
  const { localTime, duration } = useSprite();
  const inn = sm(0, 0.7, localTime), out = 1 - sm(duration - 0.7, duration, localTime);
  const op = inn * out, sc = 0.8 + 0.2 * Easing.easeOutBack(clamp(localTime / 0.7, 0, 1));
  return (
    <div style={{ position: 'absolute', left: '50%', top: P.orbTop, transform: `translate(-50%,0) scale(${sc * P.orbScale})`, transformOrigin: 'center top', opacity: op, zIndex: 30,
      display: 'flex', alignItems: 'center', gap: 16, padding: '14px 26px 14px 16px', borderRadius: 999, whiteSpace: 'nowrap',
      background: 'rgba(14,14,20,.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,.14)', boxShadow: '0 20px 60px -16px rgba(0,0,0,.7)' }}>
      <span style={{ width: 46, height: 46, borderRadius: 999, background: `radial-gradient(circle at 35% 30%, ${FC.aqua}, ${FC.iris} 72%)`, boxShadow: `0 0 26px -2px ${FC.aqua}`, display: 'grid', placeItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3, height: 20 }}>
          {[0,1,2,3,4].map((i) => {
            const hgt = 30 + 70 * Math.abs(Math.sin(localTime * 5 + i * 0.7));
            return <span key={i} style={{ width: 3, height: hgt + '%', borderRadius: 3, background: 'rgba(255,255,255,.92)' }} />;
          })}
        </span>
      </span>
      <span style={{ fontFamily: SERIF, fontSize: 30, fontStyle: 'italic', color: FC.ink }}>“What needs me right now?”</span>
    </div>
  );
}

/* ── decision checkpoint card that surfaces, then gets approved ── */
function DecisionCard() {
  const { localTime, duration } = useSprite();
  const rise = Easing.easeOutCubic(clamp(localTime / 0.9, 0, 1));
  const out = 1 - sm(duration - 0.7, duration, localTime);
  const approve = sm(duration - 2.2, duration - 1.2, localTime); // mint flash near the end
  const op = rise * out;
  const ty = (1 - rise) * 60;
  const tint = approve > 0.02 ? FC.mint : FC.amber;
  return (
    <div style={{ position: 'absolute', left: '50%', top: P.cardTop, transform: `translate(-50%, ${ty}px) scale(${P.cardScale})`, transformOrigin: 'center top', opacity: op, zIndex: 30, width: 520,
      borderRadius: 18, background: 'rgba(18,18,26,.82)', backdropFilter: 'blur(18px)',
      border: `1px solid ${approve > 0.3 ? FC.mint : 'rgba(255,255,255,.14)'}`,
      boxShadow: `0 40px 90px -30px rgba(0,0,0,.85), 0 0 ${40*approve}px -6px ${FC.mint}` }}>
      <div style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 22, height: 22, borderRadius: 7, border: `1px solid ${tint}`, color: tint, fontFamily: MONO, fontSize: 11, display: 'grid', placeItems: 'center' }}>1</span>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: tint }}>{approve > 0.3 ? 'Shipped ✓' : 'Ready to ship'}</span>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 27, color: FC.ink, marginTop: 14, lineHeight: 1.12 }}>Merge refund idempotency to production</div>
        <div style={{ fontFamily: SANS, fontSize: 15, color: FC.ink3, marginTop: 8 }}>Agent-12 · Payments · 5 files · all tests green in sandbox.</div>
        <div style={{ display: 'flex', gap: 9, marginTop: 18 }}>
          <span style={{ flex: 1, textAlign: 'center', fontFamily: SANS, fontSize: 14, fontWeight: 700, padding: '11px 0', borderRadius: 10,
            background: approve > 0.3 ? FC.mint : 'rgba(127,219,164,.16)', color: approve > 0.3 ? '#0a160e' : FC.mint, border: `1px solid ${FC.mint}66` }}>Approve</span>
          <span style={{ padding: '11px 18px', fontFamily: SANS, fontSize: 14, fontWeight: 600, borderRadius: 10, color: FC.ink2, border: '1px solid rgba(255,255,255,.14)' }}>Reject</span>
          <span style={{ padding: '11px 18px', fontFamily: SANS, fontSize: 14, fontWeight: 600, borderRadius: 10, color: FC.ink2, border: '1px solid rgba(255,255,255,.14)' }}>Mark</span>
        </div>
      </div>
    </div>
  );
}

/* ── modes + primitives montage chips ── */
function ModesChips() {
  const { localTime } = useSprite();
  const modes = [
    { k: 'PRODUCT', d: 'ship software with a fleet', c: FC.mint, tabs: ['Chat','Watch','Missions'] },
    { k: 'DISTRIBUTION', d: 'understand the market, reach it', c: FC.aqua, tabs: ['Feed','Outreach','Content'] },
  ];
  return (
    <div style={{ position: 'absolute', left: '50%', top: P.chipsTop, transform: `translate(-50%,0) scale(${P.chipsScale})`, transformOrigin: 'center top', zIndex: 30, display: 'flex', flexDirection: P.chipsStack ? 'column' : 'row', gap: 22 }}>
      {modes.map((m, i) => {
        const inn = sm(0.2 + i * 0.35, 1.0 + i * 0.35, localTime);
        return (
          <div key={m.k} style={{ width: P.chipW, opacity: inn, transform: `translateY(${(1-inn)*26}px)`,
            borderRadius: 16, border: `1px solid ${m.c}44`, background: 'rgba(16,16,22,.6)', backdropFilter: 'blur(12px)', padding: 22, textAlign: 'left',
            boxShadow: `0 30px 70px -34px rgba(0,0,0,.8), 0 0 50px -30px ${m.c}` }}>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.14em', color: m.c }}>{m.k}</div>
            <div style={{ fontFamily: SERIF, fontSize: 24, color: FC.ink, marginTop: 8 }}>{m.d}</div>
            <div style={{ display: 'flex', gap: 7, marginTop: 16, flexWrap: 'wrap' }}>
              {m.tabs.map((tb) => <span key={tb} style={{ fontFamily: MONO, fontSize: 11, color: FC.ink2, padding: '5px 10px', borderRadius: 7, border: '1px solid rgba(255,255,255,.12)' }}>{tb}</span>)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── final logo lockup + CTA ── */
function Logo() {
  const { localTime, duration } = useSprite();
  const glyph = Easing.easeOutBack(clamp(localTime / 0.8, 0, 1));
  const word = sm(0.5, 1.4, localTime);
  const tag = sm(1.2, 2.1, localTime);
  const head = sm(1.9, 2.9, localTime);
  const cta = sm(2.6, 3.4, localTime);
  const LANDING = window.DANTE_LANDING === true;
  const out = LANDING ? 1 : (1 - sm(duration - 0.8, duration, localTime));
  const grow = (LANDING ? (1 + 0.05 * sm(1.4, duration, localTime)) : 1) * P.logoScale;   // expands gently into the landing
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 30, opacity: out, transform: `scale(${grow})`, transformOrigin: 'center 44%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, transform: `scale(${0.6 + 0.4 * glyph})`, opacity: glyph }}>
        <span style={{ width: 56, height: 56, borderRadius: 16, background: `radial-gradient(circle at 34% 30%, ${FC.aqua}, ${FC.iris} 72%)`, boxShadow: `0 0 40px -4px ${FC.aqua}`, display: 'grid', placeItems: 'center' }}>
          <span style={{ width: 14, height: 14, borderRadius: 999, background: '#0a0a10' }} />
        </span>
        <span style={{ fontFamily: SERIF, fontSize: 76, color: FC.ink, opacity: word, letterSpacing: '.01em' }}>Dante</span>
      </div>
      <div style={{ fontFamily: MONO, fontSize: 14, letterSpacing: '.2em', textTransform: 'uppercase', color: FC.ink3, marginTop: 18, opacity: tag, textAlign: 'center' }}>by Perea · the founder’s command deck</div>
      <div style={{ fontFamily: SERIF, fontSize: 38, color: FC.ink, marginTop: 40, opacity: head, textAlign: 'center', lineHeight: 1.12 }}>
        <span style={{ color: '#b9b3a6' }}>Stop managing agents.</span><br />Start <span style={{ fontStyle: 'italic', color: FC.mint, textShadow: `0 0 38px ${FC.mint}66` }}>commanding</span> a fleet.
      </div>
      <div style={{ marginTop: 34, opacity: cta, transform: `translateY(${(1-cta)*12}px)` }}>
        <span style={{ fontFamily: SANS, fontSize: 17, fontWeight: 700, color: '#0a160e', background: FC.mint, borderRadius: 12, padding: '14px 26px', boxShadow: `0 0 40px -8px ${FC.mint}` }}>Request access →</span>
      </div>
    </div>
  );
}

function FadeController() {
  const t = useTime();
  useEffect(() => {
    if (window.DANTE_LANDING !== true) return;
    const ov = document.getElementById('film-overlay'); if (!ov) return;
    ov.style.opacity = String(1 - sm(50, 51.4, t));   // quick cross-fade so the landing emerges sooner
    ov.style.pointerEvents = t > 50 ? 'none' : 'auto';
    if (t >= 51.4) ov.style.display = 'none';          // fully handed off → stop rendering the film beneath
  }, [t]);
  return null;
}

function Film() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#050509', overflow: 'hidden' }}>
      <window.FilmCanvas />
      <FadeController />

      {/* SC1 — cold open */}
      <Sprite start={2.4} end={4.9}><Line y={P.sc1.y} size={P.sc1.size} font={SERIF} color={FC.ink2}>You started with one.</Line></Sprite>

      {/* SC2 — the overwhelm */}
      <Sprite start={7.4} end={11.6}><Line y={P.sc2.y} size={P.sc2.size} color={FC.ink} sub="a hundred agents · a thousand decisions" subSize={P.sc2.sub}>Then there were a hundred.</Line></Sprite>

      {/* SC3 — the turn (orb + voice) */}
      <Sprite start={13.0} end={18.6}><Orb /></Sprite>
      <Sprite start={13.4} end={18.6}><Line y={P.sc3line.y} size={P.sc3line.size} font={MONO} color={FC.ink3} ls=".06em">the noise stills. the fleet finds order.</Line></Sprite>

      {/* SC4 — the fleet */}
      <Sprite start={21.0} end={29.0}><Line y={P.sc4.y} size={P.sc4.size} color={FC.ink}>One deck. Every agent.</Line></Sprite>

      {/* SC5 — the decision */}
      <Sprite start={30.4} end={37.6}><DecisionCard /></Sprite>
      <Sprite start={30.8} end={37.6}><Line y={P.sc5line.y} size={P.sc5line.size} color={FC.ink} glow="rgba(127,219,164,.25)">It surfaces only what needs you.</Line></Sprite>

      {/* SC6 — the deck */}
      <Sprite start={38.8} end={44.6}><Line y={P.sc6line.y} size={P.sc6line.size} color={FC.ink}>Build the product. Take it to market.</Line></Sprite>
      <Sprite start={39.0} end={44.6}><ModesChips /></Sprite>

      {/* SC7 — logo + CTA */}
      <Sprite start={45.4} end={54}><Logo /></Sprite>

      <Letterbox />
      <Grain />
    </div>
  );
}

(function () {
  const EXPORT = window.DANTE_EXPORT === true;   // clean one-pass build for video capture
  const LANDING = window.DANTE_LANDING === true; // plays once, then hands off to the landing beneath
  const params = new URLSearchParams(location.search);
  const seekT = params.get('t');
  const forceSeek = seekT !== null && params.has('pause');   // QA: deep-link/scrub a paused frame, even in landing mode
  if ((EXPORT || LANDING) && !forceSeek) { try { localStorage.setItem('danteFilm:t', '0'); } catch {} }
  else if (seekT !== null) { try { localStorage.setItem('danteFilm:t', String(parseFloat(seekT))); } catch {} }
  const autoplay = forceSeek ? false : (EXPORT || LANDING ? true : !params.has('pause'));
  const rootEl = document.getElementById('film-root') || document.getElementById('root');
  ReactDOM.createRoot(rootEl).render(
    React.createElement(window.Stage, { width: FILM.W, height: FILM.H, duration: 54, background: '#050509', persistKey: 'danteFilm', autoplay, loop: !(EXPORT || LANDING), fit: LANDING ? 'cover' : 'contain' },
      React.createElement(Film))
  );
})();
