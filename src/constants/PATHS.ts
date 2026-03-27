export const PATHS = Object.freeze({
  HOME: "/",
  NOT_AUTHENTICATED: "/not-authenticated",
  SIGN_IN: "/api/auth/signin",
  NOT_AUTHORIZED: "/not-authorized",

  BARBER: {
    HOME: "/barber",
    BOOKINGS: "/barber/bookings",
    SETTINGS: "/barber/settings",
    PROFILE: "/barber/profile",
    RATINGS: "/barber/ratings",
  },

  OWNER: {
    HOME: "/owner",
    SUBSCRIPTION: "/owner/assinatura",
    BARBERS: "/owner/barbers",
    BARBER_SCHEDULE: (barberId: string) =>
      `/owner/barbers/${barberId}/schedule`,
    SERVICES: "/owner/services",
    SCHEDULE: "/owner/schedule",
    WORKED_HOURS: "/owner/worked-hours",
  },

  BARBERSHOP: {
    HOME: (slug: string) => `/${slug}`,
    SEARCH: (title: string) => `/barbershops?title=${title}`,
  },

  BOOKINGS: {
    HOME: "/bookings",
  },

  STRIPE: {
    PAYMENT_CONFIRMATION:
      "/payment-confirmation?session_id={CHECKOUT_SESSION_ID}",
  },
})
