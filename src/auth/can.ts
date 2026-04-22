import { policies } from "./policies"
import type {
  AppAction,
  AppResource,
  AuthContext,
  PolicyStatement,
  ResourceData,
} from "./types"

const EMPTY_RESOURCE: ResourceData = {}

function policyMatchesResource(
  policy: PolicyStatement,
  resource: AppResource,
): boolean {
  return policy.resource === "*" || policy.resource === resource
}

function policyMatchesAction(
  policy: PolicyStatement,
  action: AppAction,
): boolean {
  return policy.actions.includes("manage") || policy.actions.includes(action)
}

export function can(
  context: AuthContext,
  action: AppAction,
  resource: AppResource,
  data: ResourceData = EMPTY_RESOURCE,
): boolean {
  const rolePolicies = policies[context.role] ?? []

  for (const policy of rolePolicies) {
    if (!policyMatchesResource(policy, resource)) continue
    if (!policyMatchesAction(policy, action)) continue
    if (!policy.when) return true
    if (policy.when(context, data)) return true
  }

  return false
}

export function assertCan(
  context: AuthContext,
  action: AppAction,
  resource: AppResource,
  data: ResourceData = EMPTY_RESOURCE,
): void {
  if (can(context, action, resource, data)) return
  throw new Error("Sem permissão para executar esta ação")
}
