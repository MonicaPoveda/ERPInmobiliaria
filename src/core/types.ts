export type Role = "superAdmin" | "coordinadorProveedores" | "tesorero" | "rrhh" | "almacenista" | "asesorComercial" | "directorComercial"
export type Action = "view" | "create" | "edit" | "delete"
export type ModuleId = "dashboard" | "inventory" | "crm" | "contracts" | "people" | "billing" | "portal" | "security" | "users" | "audit" | "settings" | "suppliers" | "transactions" | "expenses" | "movements" | "kardex" | "payroll" | "team"

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: Role
  active: boolean
  avatar: string
  modulePermissions?: ModuleId[]
}

export type FieldValue = string | number | boolean | undefined
export type EntityRecord = {
  id: string
  createdAt: string
  updatedAt: string
  deleted?: boolean
} & Record<string, FieldValue>

export interface AuditEntry {
  id: string
  userId: string
  userName: string
  role: Role
  action: string
  module: ModuleId
  recordId: string
  date: string
  detail: string
}

export interface FieldConfig {
  key: string
  label: string
  type?: "text" | "email" | "number" | "date" | "select" | "textarea"
  required?: boolean
  options?: string[]
}

export interface ModuleConfig {
  id: Exclude<ModuleId, "dashboard" | "users" | "audit" | "settings">
  title: string
  eyebrow: string
  description: string
  singular: string
  fields: FieldConfig[]
}
