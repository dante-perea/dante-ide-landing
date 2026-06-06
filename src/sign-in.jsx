/* sign-in.jsx — dante.id sign-in gateway.
 *
 * dante.id is a Clerk SATELLITE of the perea.company production instance. Per Clerk's
 * multi-domain rules, the sign-in/sign-up FLOW must complete on the PRIMARY domain
 * (perea.company) — a satellite SPA cannot render <SignIn> itself; it redirects to the
 * primary and the user is synced back here afterward. So this page is a branded gateway:
 * one identity across Perea / Founders / Dante, with a styled hand-off to Perea.
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
  SignUpButton,
  UserButton,
  useUser,
} from '@clerk/clerk-react'

const KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const SATELLITE_DOMAIN = import.meta.env.VITE_CLERK_SATELLITE_DOMAIN || 'dante.id'
const PRIMARY_SIGN_IN_URL = import.meta.env.VITE_CLERK_PRIMARY_SIGN_IN_URL || 'https://perea.company/sign-in'
const PRIMARY_SIGN_UP_URL = import.meta.env.VITE_CLERK_PRIMARY_SIGN_UP_URL || 'https://perea.company/sign-up'
const AFTER_SIGN_IN_URL = import.meta.env.VITE_CLERK_AFTER_SIGN_IN_URL || '/'
// Treat the deployed site as the satellite; on localhost behave as a normal app so the
// dev server doesn't try to bounce across domains.
const IS_SATELLITE = import.meta.env.PROD

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
          <SignInButton mode="redirect" forceRedirectUrl={AFTER_SIGN_IN_URL} signUpForceRedirectUrl={AFTER_SIGN_IN_URL}>
            <button className="btn btn-primary">Continue with Perea ID →</button>
          </SignInButton>
          <SignUpButton mode="redirect" forceRedirectUrl={AFTER_SIGN_IN_URL} signInForceRedirectUrl={AFTER_SIGN_IN_URL}>
            <button className="btn btn-ghost">Create an account</button>
          </SignUpButton>
          <p className="foot">
            <span className="dot">●</span> You authenticate securely on Perea, then land back on dante.id.
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
  if (!KEY) return <MissingKey />
  const satellite = IS_SATELLITE ? { isSatellite: true, domain: SATELLITE_DOMAIN } : {}
  return (
    <ClerkProvider
      publishableKey={KEY}
      signInUrl={PRIMARY_SIGN_IN_URL}
      signUpUrl={PRIMARY_SIGN_UP_URL}
      afterSignOutUrl="/"
      {...satellite}
    >
      <Gateway />
    </ClerkProvider>
  )
}

createRoot(document.getElementById('sign-in-root')).render(<Root />)
