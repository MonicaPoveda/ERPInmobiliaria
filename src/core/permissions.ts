import type { Action, ModuleId, Role, User } from "./types"

type PermissionSet = Partial<Record<ModuleId, Action[]>>

const full: Action[] = ["view", "create", "edit", "delete"]

const manage: Action[] = ["view", "create", "edit"]

const read: Action[] = ["view"]

export const permissionMatrix: Record<Role, PermissionSet> = {
  superAdmin: {
    dashboard: read,

    inventory: full,

    crm: full,

    contracts: full,

    people: full,

    billing: full,

    portal: full,

    security: full,

    users: full,

    audit: read,

    settings: manage,

    suppliers: full,

    transactions: full,

    expenses: full,

    movements: full,

    kardex: read,

    payroll: full,

    team: full,
  },

  coordinadorProveedores: {
    dashboard: read,

    suppliers: full,
  },

  tesorero: {
    dashboard: read,

    billing: full,

    transactions: full,

    expenses: full,
  },

  rrhh: {
    dashboard: read,

    people: full,

    payroll: full,
  },

  almacenista: {
    dashboard: read,

    inventory: ["view", "create", "edit"],

    movements: full,

    kardex: read,
  },

  asesorComercial: {
    dashboard: read,

    crm: full,
  },

  directorComercial: {
    dashboard: read,

    crm: full,

    team: full,
  },
}

export function permissionsFor(user: User | null): PermissionSet {
  if (!user) return {}

  const rolePermissions = permissionMatrix[user.role]

  if (!user.modulePermissions) return rolePermissions

  return Object.fromEntries(
    Object.entries(rolePermissions).filter(([module]) =>
      user.modulePermissions?.includes(module as ModuleId),
    ),
  )
}

export function can(
  user: User | null,

  module: ModuleId,

  action: Action = "view",
) {
  return permissionsFor(user)[module]?.includes(action) ?? false
}

export const roleLabels: Record<Role, string> = {
  superAdmin: "Superadministrador",

  coordinadorProveedores: "Coordinador de Proveedores",

  tesorero: "Tesorero",

  rrhh: "Recursos Humanos",

  almacenista: "Almacenista",

  asesorComercial: "Asesor Comercial",

  directorComercial: "Director Comercial",
}
