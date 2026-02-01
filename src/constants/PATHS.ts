export const PATHS = Object.freeze({
  HOME: "/",

  BARBER: {
    HOME: "/barber",
    BOOKINGS: "/barber/bookings",
    SETTINGS: "/barber/settings",
    PROFILE: "/barber/profile",
    RATINGS: "/barber/ratings",
  },

  BARBERSHOP: {
    HOME: (slug: string) => `/${slug}`,
    SEARCH: (title: string) => `/barbershops?title=${title}`,
  },

  BOOKINGS: {
    HOME: "/bookings",
  },
})
