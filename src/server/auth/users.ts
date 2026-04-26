"use server"

import { auth } from "@/src/lib/auth"

export const signIn = async (email: string, password: string) => {
  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    })
    return { success: true, message: "Login successful" }
  } catch (error: any) {
    const e = error as Error

    return {
      success: false,
      message: e.message || "An unknown error occurred",
    }
  }
}

export const signUp = async (
  name: string,
  email: string,
  password: string,
  image?: string,
) => {
  try {
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        image,
      },
      asResponse: true,
    })
    return { success: true, message: "Sign up successful" }
  } catch (error) {
    const e = error as Error

    return {
      success: false,
      message: e.message || "An unknown error occurred",
    }
  }
}
