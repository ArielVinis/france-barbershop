"use server"

import axios from "axios"
import { cookies } from "next/headers"

const apiClient = axios.create({
  baseURL: process.env.NEXTAUTH_URL,
})

apiClient.interceptors.request.use(
  async (config) => {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("access_token")?.value
    const authToken = cookieStore.get("auth_token")?.value

    if (accessToken) {
      config.headers["Access-Token"] = accessToken
    }
    if (authToken) {
      config.headers["Authorization"] = `Bearer ${authToken}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

export const GET = async (url: string, returnRaw = false) => {
  const response = await apiClient.get(url)
  return returnRaw ? response : response.data
}

export const POST = async (url: string, data: unknown, returnRaw = false) => {
  const response = await apiClient.post(url, data)
  return returnRaw ? response : response.data
}

export const PUT = async (url: string, data: unknown, returnRaw = false) => {
  const response = await apiClient.put(url, data)
  return returnRaw ? response : response.data
}

export const DELETE = async (url: string, returnRaw = false) => {
  const response = await apiClient.delete(url)
  return returnRaw ? response : response.data
}
