import {
  fetchSubscriptionByEmail,
  isOwnerSubscriptionAllowed,
} from "@/src/app/(stripe)/_features/_actions/fetch-subscription-by-email"

export async function hasOwnerSubscriptionAccess(email: string | null) {
  if (!email) return false
  const subscription = await fetchSubscriptionByEmail(email)
  return isOwnerSubscriptionAllowed(subscription?.status)
}
