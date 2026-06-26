import { test, expect } from "@playwright/test"

const fakeInvitationId = "00000000-0000-4000-8000-000000000001"
const acceptPath = `/api/accept-invitation/${fakeInvitationId}`

test.describe("Fluxo de convite (E2E)", () => {
  test("link de aceite sem sessão redireciona para login com callbackUrl", async ({
    page,
  }) => {
    await page.goto(acceptPath, { waitUntil: "domcontentloaded" })

    await expect(page).toHaveURL(/\/auth\/login/)
    const url = new URL(page.url())
    expect(url.searchParams.get("callbackUrl")).toBe(acceptPath)
  })

  test("login preserva callbackUrl ao ir para signup", async ({ page }) => {
    await page.goto(
      `/auth/login?callbackUrl=${encodeURIComponent(acceptPath)}`,
      { waitUntil: "domcontentloaded" },
    )

    const signupLink = page.getByRole("link", { name: /criar conta/i })
    await expect(signupLink).toHaveAttribute(
      "href",
      `/auth/signup?callbackUrl=${encodeURIComponent(acceptPath)}`,
    )
  })

  test("signup preserva callbackUrl ao voltar para login", async ({ page }) => {
    await page.goto(
      `/auth/signup?callbackUrl=${encodeURIComponent(acceptPath)}`,
      { waitUntil: "domcontentloaded" },
    )

    const loginLink = page.getByRole("link", { name: /fazer login/i })
    await expect(loginLink).toHaveAttribute(
      "href",
      `/auth/login?callbackUrl=${encodeURIComponent(acceptPath)}`,
    )
  })

  test("login recebe error na query após falha no aceite", async ({ page }) => {
    const errorMessage = "Convite expirado ou inválido"
    await page.goto(
      `/auth/login?callbackUrl=${encodeURIComponent(acceptPath)}&error=${encodeURIComponent(errorMessage)}`,
      { waitUntil: "domcontentloaded" },
    )

    const url = new URL(page.url())
    expect(url.searchParams.get("error")).toBe(errorMessage)
    expect(url.searchParams.get("callbackUrl")).toBe(acceptPath)
  })
})
