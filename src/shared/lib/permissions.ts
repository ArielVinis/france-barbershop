import { createAccessControl } from "better-auth/plugins/access"
import { defaultStatements } from "better-auth/plugins/organization/access"

const statement = {
  ...defaultStatements,
  project: ["read", "create", "update", "delete"],
} as const

const ac = createAccessControl(statement)

const ADMIN = ac.newRole({
  ...defaultStatements,
  project: ["read", "create", "update", "delete"],
})

const OWNER = ac.newRole({
  ...defaultStatements,
  project: ["read", "create", "update", "delete"],
})

const MANAGER = ac.newRole({
  ...defaultStatements,
  project: ["read", "create", "update", "delete"],
})

const MEMBER = ac.newRole({
  project: ["read"],
})

const CLIENT = ac.newRole({
  project: ["read", "create", "update", "delete"],
})

export { ac, ADMIN, OWNER, MANAGER, MEMBER, CLIENT, statement }
