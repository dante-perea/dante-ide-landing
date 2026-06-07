/* sign-in.jsx — dante.id sign-in gateway.
 *
 * dante.id is a Clerk SATELLITE of the perea.company production instance. Per Clerk's
 * multi-domain rules, the sign-in FLOW must complete on the PRIMARY domain
 * (perea.company) — a satellite SPA cannot render <SignIn> itself; it redirects to the
 * primary and the user is synced back here afterward. So this page is a branded gateway:
 * one identity across Perea / Founders / Dante, with a styled hand-off to Perea.
 * Sign-up is intentionally replaced by Clerk Waitlist mode.
 *
 * To make dante.id self-host the actual sign-in FORM instead, it must become its own
 * Clerk primary (not a satellite) — then this file can render <SignIn /> directly.
 *
 * Classic JSX runtime (vite.config.js forces React.createElement), so React must be in
 * scope — hence the explicit `import React`.
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import {
  ClerkProvider,
  ClerkLoading,
  ClerkLoaded,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from '@clerk/clerk-react'
import {
  AFTER_SIGN_IN_URL,
  CLERK_PRIMARY_SIGN_IN_URL,
  CLERK_PUBLISHABLE_KEY,
  CLERK_WAITLIST_URL,
  clerkProviderProps,
} from './clerk-config'

function Mark() {
  return (
    <div className="mark">
      <span />
    </div>
  )
}

function Gateway() {
  const { user } = useUser()
  const name = user?.firstName || user?.username || user?.primaryEmailAddress?.emailAddress
  return (
    <section className="card">
      <Mark />
      <div className="eyebrow">Perea ID · Secure sign-in</div>
      <h1 className="title">Sign in</h1>
      <p className="sub">Continue to your command deck. One identity across Perea, Founders, and Dante.</p>

      <ClerkLoading>
        <div className="loading">CONNECTING…</div>
      </ClerkLoading>

      <ClerkLoaded>
        <SignedOut>
          <SignInButton mode="redirect" forceRedirectUrl={AFTER_SIGN_IN_URL}>
            <button className="btn btn-primary">Continue with Perea ID →</button>
          </SignInButton>
          <a className="btn btn-ghost" href={CLERK_WAITLIST_URL}>Join waitlist</a>
          <p className="foot">
            <span className="dot">●</span> Approved founders authenticate securely on Perea, then land back on dante.id.
          </p>
        </SignedOut>

        <SignedIn>
          <div className="signed">
            <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: { width: 52, height: 52 } } }} />
            <div className="who">{name ? <>Signed in as <b>{name}</b></> : 'You are signed in'}</div>
            <a className="btn btn-primary" href={AFTER_SIGN_IN_URL}>Enter Dante →</a>
          </div>
        </SignedIn>
      </ClerkLoaded>
    </section>
  )
}

function MissingKey() {
  return (
    <section className="card config">
      <Mark />
      <div className="eyebrow">Configuration</div>
      <h1 className="title">Almost there</h1>
      <p className="sub">
        Set <code>VITE_CLERK_PUBLISHABLE_KEY</code> (the perea.company instance key) plus the satellite
        vars in your environment, then redeploy to enable sign-in. See <code>.env.example</code>.
      </p>
    </section>
  )
}

function Root() {
  if (!CLERK_PUBLISHABLE_KEY) return <MissingKey />
  const urls = {}
  if (CLERK_PRIMARY_SIGN_IN_URL) urls.signInUrl = CLERK_PRIMARY_SIGN_IN_URL
  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      waitlistUrl={CLERK_WAITLIST_URL}
      {...urls}
      {...clerkProviderProps()}
    >
      <Gateway />
    </ClerkProvider>
  )
}

createRoot(document.getElementById('sign-in-root')).render(<Root />)
