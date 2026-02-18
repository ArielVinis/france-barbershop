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
    BARBERS: "/owner/barbers",
    BARBER_SCHEDULE: (barberId: string) =>
      `/owner/barbers/${barberId}/schedule`,
    SERVICES: "/owner/services",
  },

  BARBERSHOP: {
    HOME: (slug: string) => `/${slug}`,
    SEARCH: (title: string) => `/barbershops?title=${title}`,
  },

  BOOKINGS: {
    HOME: "/bookings",
  },
})
