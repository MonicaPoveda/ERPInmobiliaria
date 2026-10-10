export type Role = "administrator" | "staff" | "client"
export type StaffProfile = "commercial" | "salesDirector" | "providers" | "finance" | "hr" | "inventory"
export type Action = "view" | "create" | "edit" | "delete"
export type ModuleId = "dashboard" | "inventory" | "crm" | "contracts" | "people" | "billing" | "portal" | "security" | "users" | "audit" | "settings" | "providers" | "purchases"
export interface User {
  id: string
  name: string
  email: string
  password: string
  role: Role
  staffProfile?: StaffProfile
  active: boolean
  avatar: string
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
  type?:
    | "text"
    | "email"
    | "number"
    | "date"
    | "select"
    | "textarea"
    | "rating"
    | "image"
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
