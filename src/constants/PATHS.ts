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
  },

  BARBERSHOP: {
    HOME: (slug: string) => `/${slug}`,
    SEARCH: (title: string) => `/barbershops?title=${title}`,
  },

  BOOKINGS: {
    HOME: "/bookings",
  },
})
