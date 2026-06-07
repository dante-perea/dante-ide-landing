/* waitlist.jsx — real Clerk-backed request-access flow for dante.id. */
import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ClerkLoaded,
  ClerkLoading,
  ClerkProvider,
  useClerk,
} from '@clerk/clerk-react'
import {
  CLERK_PRIMARY_SIGN_IN_URL,
  CLERK_PUBLISHABLE_KEY,
  CLERK_WAITLIST_URL,
  clerkProviderProps,
} from './clerk-config'

const signInUrl = CLERK_PRIMARY_SIGN_IN_URL || '/sign-in'

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

function errorMessage(error) {
  const apiError = error?.errors?.[0]
  if (apiError?.code === 'waitlist_not_accepting_entries') {
    return 'The Clerk waitlist for this instance is not accepting entries yet. Enable waitlist mode in Clerk Dashboard, then try again.'
  }
  return apiError?.longMessage || apiError?.message || error?.message || 'Could not join the waitlist. Please try again.'
}

function WaitlistForm() {
  const clerk = useClerk()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  async function onSubmit(event) {
    event.preventDefault()
    const emailAddress = email.trim()
    if (!emailAddress || status === 'submitting') return

    setStatus('submitting')
    setError('')
    try {
      await clerk.joinWaitlist({ emailAddress })
      setStatus('joined')
    } catch (err) {
      setStatus('error')
      setError(errorMessage(err))
    }
  }

  if (status === 'joined') {
    return (
      <div className="waitlist-done" role="status">
        <div className="done-orb">✓</div>
        <h1 className="title">You are on the list</h1>
        <p className="sub">We will email you when your Dante seat is ready.</p>
        <a className="waitlist-secondary" href={signInUrl}>Already have access? Sign in</a>
      </div>
    )
  }

  return (
    <>
      <h1 className="title">Join the waitlist</h1>
      <p className="sub">Enter your email address and we will let you know when your spot is ready.</p>
      {error ? <div className="waitlist-error" role="alert">{error}</div> : null}
      <form className="waitlist-form" onSubmit={onSubmit}>
        <label className="waitlist-field">
          <span>Email address</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
          />
        </label>
        <button className="waitlist-submit" type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Joining...' : 'Join the waitlist'}
        </button>
      </form>
      <p className="waitlist-signin">Already have access? <a href={signInUrl}>Sign in</a></p>
    </>
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
          <WaitlistForm />
        </ClerkLoaded>
      </section>
    </ClerkProvider>
  )
}

createRoot(document.getElementById('waitlist-root')).render(<WaitlistPage />)
