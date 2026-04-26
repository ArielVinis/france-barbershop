export const PATHS = Object.freeze({
  ROOT: "/",
  NOT_AUTHENTICATED: "/not-authenticated",
  NOT_AUTHORIZED: "/not-authorized",

  AUTH: {
    LOGIN: "/auth/login",
    SIGN_UP: "/auth/signup",
    FORGOT_PASSWORD: "/auth/forgot-password",
  },

  DEV: {
    PANEL: "/dev/panel",
  },

  PANEL: {
    ROOT: "/panel",
    ORGANIZATION: "/panel/organization",
    SUBSCRIPTION: "/panel/subscription",
    BARBERS: "/panel/barbers",
    BARBER_SCHEDULE: (barberId: string) =>
      `/panel/barbers/${barberId}/schedule`,
    SERVICES: "/panel/services",
    SCHEDULE: "/panel/schedule",
    WORKED_HOURS: "/panel/worked-hours",
  },

  BARBERSHOP: {
    ROOT: (slug: string) => `/${slug}`,
    SEARCH: (title: string) => `/barbershops?title=${title}`,
  },

  BOOKINGS: {
    ROOT: "/bookings",
  },

  STRIPE: {
    PAYMENT_CONFIRMATION:
      "/payment-confirmation?session_id={CHECKOUT_SESSION_ID}",
  },
})
