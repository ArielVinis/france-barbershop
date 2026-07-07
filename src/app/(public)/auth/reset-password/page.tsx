import { Suspense } from "react"

import { ResetPasswordForm } from "@/src/components/auth/reset-password-form"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-md bg-muted" />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
