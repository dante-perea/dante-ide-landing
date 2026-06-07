export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
export const CLERK_SATELLITE_DOMAIN = import.meta.env.VITE_CLERK_SATELLITE_DOMAIN || 'dante.id'
export const CLERK_PRIMARY_SIGN_IN_URL = import.meta.env.VITE_CLERK_PRIMARY_SIGN_IN_URL
export const CLERK_WAITLIST_URL = import.meta.env.VITE_CLERK_WAITLIST_URL || '/waitlist'
export const AFTER_SIGN_IN_URL = import.meta.env.VITE_CLERK_AFTER_SIGN_IN_URL || '/'

export const CLERK_IS_SATELLITE = import.meta.env.PROD

export function clerkProviderProps() {
  return CLERK_IS_SATELLITE
    ? { isSatellite: true, domain: CLERK_SATELLITE_DOMAIN }
    : {}
}
