import { SignupForm } from "@/src/components/auth/signup-form"

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const params = await searchParams

  return <SignupForm callbackUrl={params.callbackUrl} />
}
