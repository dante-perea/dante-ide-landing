/* film_bg.jsx — the continuous cinematic background for the Dante film.
   ONE deep-space world with a moving camera, rendered as a pure function of the
   Stage playhead (so it scrubs perfectly). Choreographs: a lone star → a chaotic
   storm of a hundred → settling into a four-workspace constellation → camera push
   to a decision → collapse into the logo. Exports <FilmCanvas/> to window.

   Orientation-aware: landscape / desktop use the original wide 1920×1080 stage; a
   portrait phone gets a re-composed tall 1080×1920 stage — the four workspaces stack
   into a narrower 2×2 and the camera moves are retuned — so the intro fills a vertical
   screen instead of being cropped. The choreography (timings, narrative) is identical;
   only the spatial layout differs. */
(function () {
  const { useRef, useEffect } = React;

  // ── orientation-aware layout ────────────────────────────────────────────────
  const PORTRAIT = (window.DANTE_LANDING === true) && (window.innerWidth < window.innerHeight);
  const LANDSCAPE_L = {
    W: 1920, H: 1080, CX: 960, CY: 540,
    clusters: [ {x:556,y:400}, {x:1364,y:400}, {x:556,y:700}, {x:1364,y:700} ],
    zoomKeys: [0,2,6,11,30,33.5,38,44,47,50],
    zoomVals: [2.3,2.2,1.45,1.0,1.0,1.5,1.55,1.16,1.06,1.0],
    panFactor: 0.62, labelDy: 168, labelFont: "500 21px 'JetBrains Mono', monospace", labelLS: '5px',
    auroraR: 560, bgR: 1300, vigInner: 200, vigOuter: 1180,
  };
  const PORTRAIT_L = {
    W: 1080, H: 1920, CX: 540, CY: 960,
    // tall, narrow 2×2 — the same four workspaces stacked for a vertical screen
    clusters: [ {x:316,y:900}, {x:764,y:900}, {x:316,y:1320}, {x:764,y:1320} ],
    zoomKeys: [0,2,6,11,30,33.5,38,44,47,50],
    // gentler decision push than landscape: on a narrow frame a big zoom+pan slices the
    // left workspace labels off-edge, so we keep the fleet in-frame behind the card.
    zoomVals: [2.45,2.35,1.55,1.04,1.04,1.16,1.18,1.10,1.06,1.04],
    panFactor: 0.15, labelDy: 156, labelFont: "500 30px 'JetBrains Mono', monospace", labelLS: '5px',
    auroraR: 440, bgR: 1500, vigInner: 260, vigOuter: 1380,
  };
  const L = PORTRAIT ? PORTRAIT_L : LANDSCAPE_L;
  const { W, H, CX, CY } = L;
  const CLUSTERS = L.clusters;
  window.__DANTE_FILM = { portrait: PORTRAIT, W, H };   // film.jsx reads this for Stage dims + layout

  const CREAM = '#f6f1e7', COOL = '#cfe4f2', WARM = '#f2e4cf', AMBER = '#e0a458';
  const AUR = ['#7fdba4', '#8fd0e0', '#6f8ff5', '#34c0a0'];
  // every star gets a fixed VIVID color at birth — always bright, never recolored
  const STARCOLS = ['#fbf6ec', '#fdf9f0', '#d6e9f6', '#cfe2f5', '#f2dca6', '#bfe8cf', '#cdd6f7'];
  const CLUSTER_NAMES = ['WEB APP', 'MOBILE', 'PAYMENTS', 'GROWTH'];

  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;
  const smooth = (a, b, t) => { const x = clamp01((t - a) / (b - a)); return x * x * (3 - 2 * x); };
  const eInOut = (t) => (t < 0.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1);
  const eIn = (t) => t*t*t;
  function hexA(hex, a) { const n = parseInt(hex.slice(1),16); return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${clamp01(a)})`; }
  function mix(h1, h2, t) {
    const a = parseInt(h1.slice(1),16), b = parseInt(h2.slice(1),16);
    const r = Math.round(lerp((a>>16)&255,(b>>16)&255,t)), g = Math.round(lerp((a>>8)&255,(b>>8)&255,t)), bl = Math.round(lerp(a&255,b&255,t));
    return `rgb(${r},${g},${bl})`;
  }

  // deterministic seeded RNG so positions are stable for a session
  function makeRng(seed) { let s = seed >>> 0; return () => { s = (s*1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  function buildWorld() {
    const rng = makeRng(20260605);
    const agents = [];
    const perCluster = 25;
    for (let c = 0; c < 4; c++) {
      const cc = CLUSTERS[c];
      for (let i = 0; i < perCluster; i++) {
        const idx = c * perCluster + i;
        const ang = rng() * Math.PI * 2;
        const rad = Math.pow(rng(), 0.62) * 128;
        const cx = cc.x + Math.cos(ang) * rad, cy = cc.y + Math.sin(ang) * rad * 0.92;
        const hero = idx === 0;
        const needs = !hero && rng() < 0.09;             // ~9 persistent "needs you"
        agents.push({
          idx, cluster: c, hero, needs,
          cx, cy,
          chx: W*0.15 + rng() * W*0.70, chy: H*0.13 + rng() * H*0.74,   // scatter kept inside the visible frame (no edge pop-in)
          birth: hero ? 0.3 : 4.2 + rng() * 5.2,
          r: hero ? 4.2 : (needs ? 2.4 : 0.9 + rng() * 1.7),
          ph: rng() * 6.28, sp: 0.5 + rng() * 1.0,
          driftPh: rng() * 6.28, driftAmp: 4 + rng() * 9,
          alert: false,
          tint: needs ? AMBER : STARCOLS[Math.floor(rng() * STARCOLS.length)],
          spike: hero || needs || rng() < 0.18,
        });
      }
    }
    // overwhelm motes — extra noise that floods in then clears
    const motes = Array.from({ length: 170 }, () => ({
      x: W*0.12 + rng() * W*0.76, y: H*0.1 + rng() * H*0.8, r: 0.5 + rng() * 1.4, ph: rng() * 6.28, sp: 2 + rng() * 4,
      birth: 4.5 + rng() * 3.5, tint: rng() < 0.5 ? AMBER : CREAM,
    }));
    return { agents, motes };
  }

  // camera as a function of time
  function camera(t) {
    const E = window.Easing;
    // pull back to reveal the fleet, then the decision: zoom toward the top-right
    // cluster while the checkpoint confirms; ease back and settle calm for the landing.
    const Z = window.interpolate(L.zoomKeys, L.zoomVals, E.easeInOutCubic)(t);
    const px = CX + (CLUSTERS[1].x - CX) * L.panFactor, py = CY + (CLUSTERS[1].y - CY) * L.panFactor;
    let cx = window.interpolate([0,30,34,38,44],[CX,CX,px,px,CX], E.easeInOutCubic)(t);
    let cy = window.interpolate([0,30,34,38,44],[CY,CY,py,py,CY], E.easeInOutCubic)(t);
    const life = smooth(18,22,t) * (1 - smooth(37,40,t));
    cx += Math.sin(t * 0.16) * 14 * life;
    cy += Math.cos(t * 0.13) * 10 * life;
    return { Z, cx, cy };
  }

  function agentState(a, t) {
    const settleE = eInOut(smooth(10.5, 16, t));   // camera is already at full view by ~11, so the fleet forms on-screen — no pop
    const collapseE = eIn(clamp01((t - 45.5) / 4));
    let bx, by;
    if (a.hero) {
      const toChaos = eInOut(clamp01((t - 5) / 6));
      bx = lerp(lerp(CX, a.chx, toChaos), a.cx, settleE);
      by = lerp(lerp(CY, a.chy, toChaos), a.cy, settleE);
    } else {
      bx = lerp(a.chx, a.cx, settleE);
      by = lerp(a.chy, a.cy, settleE);
    }
    // storm jitter (decays as it settles)
    const jit = (1 - settleE) * smooth(5, 6.2, t);
    bx += Math.sin(t * 3.1 + a.ph) * 16 * jit;
    by += Math.cos(t * 2.7 + a.ph * 1.3) * 16 * jit;
    // gentle formed drift
    const formed = settleE * (1 - collapseE);
    bx += Math.sin(t * 0.5 + a.driftPh) * a.driftAmp * formed;
    by += Math.cos(t * 0.4 + a.driftPh) * a.driftAmp * formed;
    // collapse into the logo
    bx = lerp(bx, CX, collapseE); by = lerp(by, CY, collapseE);

    // ignition alpha + birth flash
    const born = smooth(a.birth, a.birth + 0.55, t);
    const flash = a.hero ? smooth(0.3,0.8,t) * (1 - smooth(0.8,2.4,t)) : born * (1 - smooth(a.birth+0.1, a.birth+0.9, t));
    const alpha = born * (1 - collapseE * 0.15);

    // color is constant + vivid from birth — no storm-amber takeover, no recolor at settle
    const tint = a.tint;

    const tw = 0.72 + 0.28 * Math.sin(t * (a.needs ? 2.2 : a.sp) + a.ph);   // gentle twinkle that never goes dark
    const r = (a.hero ? lerp(4.2, 1.8, settleE) : a.r) * (a.needs ? (1 + 0.22 * Math.sin(t*3 + a.ph)) : 1);
    return { x: bx, y: by, alpha, tint, tw, r, flash, settleE };
  }

  function draw(ctx, t, world) {
    // base space gradient
    const bg = ctx.createRadialGradient(CX, CY*0.7, 0, CX, CY, L.bgR);
    bg.addColorStop(0, '#0b0b14'); bg.addColorStop(0.5, '#08080e'); bg.addColorStop(1, '#050509');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    const { Z, cx, cy } = camera(t);
    ctx.save();
    ctx.translate(CX, CY); ctx.scale(Z, Z); ctx.translate(-cx, -cy);

    // ── aurora (additive) — blooms in as the fleet forms ──
    const aur = smooth(13, 16.5, t) * (1 - smooth(44, 48, t));
    if (aur > 0.01) {
      ctx.globalCompositeOperation = 'lighter';
      CLUSTERS.forEach((c, i) => {
        const tint = AUR[i % AUR.length];
        const rr = L.auroraR + Math.sin(t * 0.2 + i) * 40;
        const al = (0.07 + 0.03 * Math.sin(t * 0.25 + i)) * aur;
        const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, rr);
        g.addColorStop(0, hexA(tint, al)); g.addColorStop(0.5, hexA(tint, al * 0.4)); g.addColorStop(1, hexA(tint, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c.x, c.y, rr, 0, 6.28); ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';
    }

    // ── overwhelm motes ──
    world.motes.forEach((m) => {
      const on = smooth(m.birth, m.birth + 0.5, t) * (1 - smooth(12.5, 15.5, t));
      if (on <= 0.01) return;
      const fl = 0.4 + 0.6 * Math.sin(t * m.sp + m.ph);
      ctx.fillStyle = hexA(m.tint, on * fl * 0.7);
      ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.28); ctx.fill();
    });

    // ── agents ──
    const drawStar = (x, y, r, a, tint, spike) => {
      const gr = r * 6;
      const g = ctx.createRadialGradient(x, y, 0, x, y, gr);
      g.addColorStop(0, hexA(tint, 0.5 * a)); g.addColorStop(1, hexA(tint, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, gr, 0, 6.28); ctx.fill();
      if (spike) {
        const Ls = r * 9 * (0.6 + a * 0.6), th = Math.max(0.5, r * 0.28);
        let lg = ctx.createLinearGradient(x - Ls, y, x + Ls, y);
        lg.addColorStop(0, hexA(tint,0)); lg.addColorStop(0.5, hexA(tint, a*0.7)); lg.addColorStop(1, hexA(tint,0));
        ctx.fillStyle = lg; ctx.fillRect(x - Ls, y - th/2, Ls*2, th);
        let vg = ctx.createLinearGradient(x, y - Ls, x, y + Ls);
        vg.addColorStop(0, hexA(tint,0)); vg.addColorStop(0.5, hexA(tint, a*0.7)); vg.addColorStop(1, hexA(tint,0));
        ctx.fillStyle = vg; ctx.fillRect(x - th/2, y - Ls, th, Ls*2);
      }
      ctx.fillStyle = hexA(tint, Math.min(1, 0.7 + a * 0.3));
      ctx.beginPath(); ctx.arc(x, y, r, 0, 6.28); ctx.fill();
    };
    world.agents.forEach((a) => {
      const s = agentState(a, t);
      if (s.alpha <= 0.01) return;
      const aa = Math.max(0.5, s.tw) * s.alpha;   // bright floor — no dark/dead-looking stars
      drawStar(s.x, s.y, s.r + s.flash * 2.5, Math.min(1, aa + s.flash), s.tint, a.spike || s.flash > 0.1);
    });

    // ── workspace labels (canvas-space so they ride the camera) ──
    const lbl = smooth(22.5, 24.5, t) * (1 - smooth(33, 35, t));
    if (lbl > 0.01) {
      ctx.textAlign = 'center';
      ctx.font = L.labelFont;
      ctx.letterSpacing = L.labelLS;
      CLUSTERS.forEach((c, i) => {
        const y = c.y + L.labelDy;
        ctx.fillStyle = hexA('#ece7dc', lbl * 0.95);
        ctx.fillText(CLUSTER_NAMES[i], c.x + 2.5, y);            // +2.5 visually centers the tracked text
        const uw = Math.min(PORTRAIT ? 190 : 150, CLUSTER_NAMES[i].length * (PORTRAIT ? 21 : 17) + 24);
        const ug = ctx.createLinearGradient(c.x - uw / 2, 0, c.x + uw / 2, 0);
        ug.addColorStop(0, hexA(AUR[i], 0)); ug.addColorStop(0.5, hexA(AUR[i], lbl * 0.85)); ug.addColorStop(1, hexA(AUR[i], 0));
        ctx.fillStyle = ug; ctx.fillRect(c.x - uw / 2, y + 14, uw, 1.5);
      });
      ctx.letterSpacing = '0px';
    }
    ctx.restore();

    // ── vignette (screen space); deepens during the decision push ──
    const vig = 0.5 + 0.32 * smooth(30, 36, t) * (1 - smooth(43, 46, t));
    const vg = ctx.createRadialGradient(CX, CY * 0.95, L.vigInner, CX, CY, L.vigOuter);
    vg.addColorStop(0, 'rgba(5,5,9,0)'); vg.addColorStop(0.62, `rgba(5,5,9,${vig * 0.4})`); vg.addColorStop(1, `rgba(5,5,9,${vig})`);
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  }

  function FilmCanvas() {
    const t = window.useTime();
    const ref = useRef(null);
    const worldRef = useRef(null);
    if (!worldRef.current) worldRef.current = buildWorld();
    useEffect(() => {
      const cv = ref.current; if (!cv) return;
      const ctx = cv.getContext('2d');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (cv.width !== W * dpr) { cv.width = W * dpr; cv.height = H * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(ctx, t, worldRef.current);
    }, [t]);
    return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: W, height: H }} />;
  }

  window.FilmCanvas = FilmCanvas;
})();
