# Dante — Landing Page

Marketing landing page for **Dante**, the founder's command deck by Perea. A single
screen with a ~52-second cinematic intro film that plays once on load, then cross-fades
to reveal the interactive landing beneath it.

This is the production build of the Claude Design handoff: the three `.jsx` scaffold
files are precompiled by Vite (replacing the preview's in-browser Babel + React CDNs).

## Stack

- **Vite 6** — bundles the film, no in-browser Babel.
- **React 18** — exposed on `window` so the framework-agnostic film scaffold keeps its
  original `window.Stage` / `window.FilmCanvas` contract (see `src/main.js`).
- Fonts: Instrument Serif · Hanken Grotesk · JetBrains Mono (Google Fonts).
- No backend.

## Architecture

- **Two layers.** The interactive landing (headline, stats, buttons) is plain HTML/CSS
  in `index.html`, with its own lightweight starfield on `<canvas id="stars">`. On top
  sits `#film-overlay` containing the React film.
- **The film** is a `Stage` (1920×1080, 54s) rendered with `fit: 'cover'`. `film_bg.jsx`
  draws the whole star world to a canvas as a pure function of the playhead `t` (so it's
  deterministic and seekable). `film.jsx` layers timed text / orb / decision-card / logo
  sprites over it.
- **Handoff.** A `FadeController` inside the film watches `t`; from **t=50 → 51.4s** it
  ramps `#film-overlay` opacity 1→0, revealing the landing. `window.DANTE_LANDING = true`
  tells the film to play once (no loop), skip the cinematic bars, and use cover-fit.
- **Skip intro →** / **Watch the film** call `window.__danteSkip()` / `watchFilm()`.
- **Request access** links to `/waitlist`, which renders a first-party Clerk-backed
  waitlist form using `clerk.joinWaitlist()`. Email entries live in Clerk Dashboard →
  Waitlist. The extra "What are you building?" answer is stored separately in Supabase
  `public.dante_waitlist_context` because Clerk waitlist entries only accept email.
  Direct sign-up stays disabled; approved users sign in through the Perea primary domain.

```
dante-ide-landing/
├─ index.html          ← markup, styles, starfield canvas, film-overlay wiring
├─ waitlist.html       ← Clerk waitlist page
├─ sign-in.html        ← Clerk sign-in gateway for approved users
├─ src/
│  ├─ main.js          ← entry: exposes React on window, loads the lib in dependency order
│  ├─ waitlist.jsx     ← custom Clerk-backed waitlist form
│  ├─ sign-in.jsx      ← approved-user sign-in handoff
│  ├─ clerk-config.js  ← shared Clerk satellite / URL config
│  └─ lib/
│     ├─ animations.jsx ← timeline engine (Stage / Sprite / easing), fit="cover" mode
│     ├─ film_bg.jsx    ← continuous starfield / aurora / camera engine (pure fn of t)
│     └─ film.jsx       ← the film: scene overlays + 54s timeline + landing handoff
└─ vite.config.js      ← classic JSX transform + multipage build inputs
```

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/
npm run preview  # serve the production build locally
```

## Tuning knobs (all in code, commented)

- **Intro length / fade:** `FadeController` window in `src/lib/film.jsx` (`sm(50, 51.4, t)`),
  Stage `duration` (54), and the Logo sprite end.
- **Camera moves:** `camera(t)` in `src/lib/film_bg.jsx`.
- **Star count / clusters / names:** top of `src/lib/film_bg.jsx`.
- **Copy & CTAs:** the landing markup near the bottom of `index.html`.
- **Waitlist:** enable Waitlist mode in the active Clerk production instance, then manage
  pending users in Clerk Dashboard → Waitlist. The public entry point is `/waitlist`.
- **Waitlist context:** extra answers are inserted into Supabase via the public REST API
  using insert-only RLS. There is no public select/update/delete policy on
  `public.dante_waitlist_context`.

---

Deployed on Vercel.
