/* waitlist.jsx — real Clerk-backed request-access flow for dante.id. */
import React from 'react'
import { createRoot } from 'react-dom/client'
import {
  ClerkLoaded,
  ClerkLoading,
  ClerkProvider,
  Waitlist,
} from '@clerk/clerk-react'
import {
  AFTER_SIGN_IN_URL,
  CLERK_PRIMARY_SIGN_IN_URL,
  CLERK_PUBLISHABLE_KEY,
  CLERK_WAITLIST_URL,
  clerkProviderProps,
} from './clerk-config'

const signInUrl = CLERK_PRIMARY_SIGN_IN_URL || '/sign-in'

const waitlistAppearance = {
  variables: {
    colorPrimary: '#7fdba4',
    colorBackground: 'rgba(18,18,26,.88)',
    colorText: '#f3ede4',
    colorTextSecondary: '#cbc6ba',
    colorInputBackground: 'rgba(255,255,255,.04)',
    colorInputText: '#f3ede4',
    borderRadius: '14px',
    fontFamily: 'Hanken Grotesk, sans-serif',
  },
  elements: {
    rootBox: {
      width: '100%',
    },
    cardBox: {
      width: '100%',
      boxShadow: 'none',
    },
    card: {
      width: '100%',
      background: 'transparent',
      boxShadow: 'none',
      border: '0',
      padding: '0',
    },
    headerTitle: {
      fontFamily: 'Instrument Serif, serif',
      fontSize: '34px',
      fontWeight: '400',
      color: '#f3ede4',
    },
    headerSubtitle: {
      color: '#cbc6ba',
      fontSize: '14.5px',
      lineHeight: '1.55',
    },
    formFieldLabel: {
      color: '#8a8578',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '10px',
      letterSpacing: '.1em',
      textTransform: 'uppercase',
    },
    formFieldInput: {
      color: '#f3ede4',
      borderColor: 'rgba(255,255,255,.12)',
    },
    formButtonPrimary: {
      color: '#07140d',
      background: 'linear-gradient(180deg, #7fdba4, #4fc59a)',
      boxShadow: '0 10px 30px -10px rgba(127,219,164,.6)',
      fontFamily: 'Hanken Grotesk, sans-serif',
      fontWeight: '650',
    },
    footerActionText: {
      color: '#8a8578',
    },
    footerActionLink: {
      color: '#7fdba4',
    },
  },
}

function Mark() {
  return (
    <div className="mark">
      <span />
    </div>
  )
}

function MissingKey() {
  return (
    <section className="card config">
      <Mark />
      <div className="eyebrow">Configuration</div>
      <h1 className="title">Almost there</h1>
      <p className="sub">
        Set <code>VITE_CLERK_PUBLISHABLE_KEY</code> and Clerk waitlist mode in the dashboard,
        then redeploy to enable request access.
      </p>
    </section>
  )
}

function WaitlistPage() {
  if (!CLERK_PUBLISHABLE_KEY) return <MissingKey />

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      signInUrl={signInUrl}
      waitlistUrl={CLERK_WAITLIST_URL}
      afterSignOutUrl="/"
      {...clerkProviderProps()}
    >
      <section className="card waitlist-card">
        <Mark />
        <div className="eyebrow">Dante early access</div>
        <ClerkLoading>
          <div className="loading">CONNECTING…</div>
        </ClerkLoading>
        <ClerkLoaded>
          <Waitlist
            afterJoinWaitlistUrl={AFTER_SIGN_IN_URL}
            signInUrl={signInUrl}
            appearance={waitlistAppearance}
          />
        </ClerkLoaded>
      </section>
    </ClerkProvider>
  )
}

createRoot(document.getElementById('waitlist-root')).render(<WaitlistPage />)
