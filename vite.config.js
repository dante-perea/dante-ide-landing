import { defineConfig } from 'vite'

// The handoff's three .jsx files are framework-agnostic scaffold code that talk to
// each other through `window` globals (window.Stage, window.FilmCanvas, …) and use the
// classic JSX runtime (bare `React.createElement`). We don't use @vitejs/plugin-react
// here on purpose: we keep that exact contract by forcing the classic transform and
// providing React/ReactDOM as globals from src/main.js. This precompiles the JSX
// (replacing the in-browser Babel from the preview) with zero behavioural change.
export default defineConfig({
  esbuild: {
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
  },
})
