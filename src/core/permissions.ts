import type { Action, ModuleId, Role, StaffProfile, User } from "./types"

type PermissionSet = Partial<Record<ModuleId, Action[]>>

const full: Action[] = ["view", "create", "edit", "delete"]
const read: Action[] = ["view"]

export const permissionMatrix: Record<Role, PermissionSet> & {
  staffProfiles: Record<StaffProfile, PermissionSet>
} = {
  administrator: {
    dashboard: full,
    inventory: full,
    crm: full,
    contracts: full,
    people: full,
    billing: full,
    portal: full,
    security: full,
    users: full,
    audit: read,
    settings: ["view", "edit"],
  },
  staff: { dashboard: read, settings: ["view", "edit"] },
  client: {
    portal: ["view", "create", "edit"],
    contracts: read,
    billing: read,
    inventory: read,
    settings: ["view", "edit"],
  },
  staffProfiles: {
    commercial: {
      dashboard: read,
      inventory: read,
      crm: full,
      contracts: read,
    },
    legal: { dashboard: read, crm: read, contracts: full, security: read },
    hr: { dashboard: read, people: full },
    finance: { dashboard: read, contracts: ["view", "edit"], billing: full },
  },
}

export function permissionsFor(user: User | null): PermissionSet {
  if (!user) return {}
  if (user.role === "staff") {
    return {
      ...permissionMatrix.staff,
      ...(user.staffProfile
        ? permissionMatrix.staffProfiles[user.staffProfile]
        : {}),
    }
  }
  return permissionMatrix[user.role]
}

export function can(
  user: User | null,
  module: ModuleId,
  action: Action = "view",
) {
  return permissionsFor(user)[module]?.includes(action) ?? false
}

export const roleLabels: Record<Role, string> = {
  administrator: "Administrador",
  staff: "Personal Interno",
  client: "Cliente",
}

export const profileLabels: Record<StaffProfile, string> = {
  commercial: "Asesor Comercial",
  legal: "Jurídico",
  hr: "Talento Humano",
  finance: "Financiero",
}
