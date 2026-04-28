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
      message:
        e.message || "Algo de errado aconteceu, tente novamente mais tarde.",
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
    return { success: true, message: "Cadastro realizado com sucesso" }
  } catch (error) {
    const e = error as Error

    return {
      success: false,
      message:
        e.message || "Algo de errado aconteceu, tente novamente mais tarde.",
    }
  }
}

export const requestPasswordReset = async (
  email: string,
  redirectTo?: string,
) => {
  try {
    await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo,
      },
    })

    return {
      success: true,
      message:
        "Se o e-mail existir, voce recebera um link para redefinir sua senha.",
    }
  } catch (error) {
    const e = error as Error

    return {
      success: false,
      message:
        e.message || "Algo de errado aconteceu, tente novamente mais tarde.",
    }
  }
}
