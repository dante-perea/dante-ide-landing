import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

// The handoff's three .jsx files are framework-agnostic scaffold code that talk to
// each other through `window` globals (window.Stage, window.FilmCanvas, …) and use the
// classic JSX runtime (bare `React.createElement`). We don't use @vitejs/plugin-react
// here on purpose: we keep that exact contract by forcing the classic transform and
// providing React/ReactDOM as globals from src/main.js. The sign-in page (src/sign-in.jsx)
// also uses the classic transform but imports React explicitly, so it works the same way.
export default defineConfig({
  esbuild: {
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
  },
  build: {
    rollupOptions: {
      // Multi-page build: the cinematic landing, Clerk sign-in gateway, and Clerk
      // waitlist page are independent entry HTML files.
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        'sign-in': fileURLToPath(new URL('./sign-in.html', import.meta.url)),
        waitlist: fileURLToPath(new URL('./waitlist.html', import.meta.url)),
      },
    },
  },
})
