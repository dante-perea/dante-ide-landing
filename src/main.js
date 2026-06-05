// Production entry point.
//
// The preview loaded React + ReactDOM + Babel from CDNs and ran the three .jsx files
// as in-browser `type="text/babel"` scripts that attach themselves to `window`. Here we
// bundle them instead. The lib files read `React` / `ReactDOM` as globals and depend on
// each other through `window` (animations → film_bg → film), so we must:
//   1. expose React + ReactDOM (client API, with createRoot) on `window` FIRST, then
//   2. evaluate the three modules in dependency order.
// Static `import` statements are hoisted and would run before step 1, so we use ordered
// dynamic `import()` after the globals are in place.
import React from 'react'
import * as ReactDOM from 'react-dom/client'

window.React = React
window.ReactDOM = ReactDOM

// Load the three lib modules in dependency order. Chained .then() (rather than
// top-level await) keeps the bundle compatible with Vite's default build target.
import('./lib/animations.jsx')        // defines window.Stage, Sprite, Easing, interpolate, …
  .then(() => import('./lib/film_bg.jsx'))  // defines window.FilmCanvas (uses Easing/interpolate/useTime)
  .then(() => import('./lib/film.jsx'))     // mounts the film into #film-root (uses Stage + FilmCanvas)
