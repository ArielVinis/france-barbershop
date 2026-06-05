import { test, expect } from "@playwright/test"

test.describe("Painel /panel (sem sessão)", () => {
  test("redireciona ou exige autenticação ao aceder a /panel", async ({
    page,
  }) => {
    await page.goto("/panel", { waitUntil: "domcontentloaded" })
    const url = page.url()
    const html = await page.content()
    const ok =
      url.includes("/not-authenticated") ||
      url.includes("/api/auth/signin") ||
      url.includes("signin") ||
      url.includes("callbackUrl") ||
      /Não autorizado|not authorized|Unauthorized/i.test(html)
    expect(ok).toBeTruthy()
  })
})
