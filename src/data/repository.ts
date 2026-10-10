import type {
  AuditEntry,
  EntityRecord,
  ModuleId,
  Role,
  User,
} from "../core/types"

import { permissionMatrix } from "../core/permissions"

import { createSeedData, demoUsers } from "./seed"

const DB_KEY = "arias-empire-db-v3"

const AUDIT_KEY = "arias-empire-audit-v3"

const EVENT = "arias-data-change"

interface Database {
  [module: string]: EntityRecord[]
}

const wait = (delay = 280) =>
  new Promise((resolve) => setTimeout(resolve, delay))

function loadDb(): Database {
  const saved = localStorage.getItem(DB_KEY)

  if (saved) {
    const db = JSON.parse(saved) as Database

    const defaults = createSeedData()

    let changed = false

    for (const [module, records] of Object.entries(defaults)) {
      if (!Array.isArray(db[module])) {
        db[module] = records

        changed = true
      }
    }

    if (Array.isArray(db.users)) {
      const legacyRoles: Record<string, Role> = {
        administrator: "superAdmin",

        client: "asesorComercial",

        staff: "asesorComercial",
      }

      const legacyProfiles: Record<string, Role> = {
        commercial: "asesorComercial",

        salesDirector: "directorComercial",

        providers: "coordinadorProveedores",

        finance: "tesorero",

        hr: "rrhh",

        inventory: "almacenista",

        legal: "coordinadorProveedores",
      }

      for (const record of db.users) {
        if (
          typeof record.role === "string" &&
          !(record.role in permissionMatrix)
        ) {
          const legacyRole = record.role

          const legacyProfile =
            typeof record.staffProfile === "string"
              ? legacyProfiles[record.staffProfile]
              : undefined

          record.role =
            legacyRole === "client"
              ? "asesorComercial"
              : (legacyProfile ?? legacyRoles[legacyRole])

          if (legacyRole === "client") record.active = false

          delete record.staffProfile

          changed = true
        }
      }

      for (const user of defaults.users) {
        if (!db.users.some((record) => record.id === user.id)) {
          db.users.push(user)

          changed = true
        }
      }
    }

    if (changed) localStorage.setItem(DB_KEY, JSON.stringify(db))

    return db
  }

  const seed = createSeedData()

  localStorage.setItem(DB_KEY, JSON.stringify(seed))

  return seed
}

function saveDb(db: Database) {
  localStorage.setItem(DB_KEY, JSON.stringify(db))

  window.dispatchEvent(new CustomEvent(EVENT))
}

function log(
  actor: User,

  module: ModuleId,

  action: string,

  recordId: string,

  detail: string,
) {
  const entries = JSON.parse(
    localStorage.getItem(AUDIT_KEY) ?? "[]",
  ) as AuditEntry[]

  const entry: AuditEntry = {
    id: crypto.randomUUID(),

    userId: actor.id,

    userName: actor.name,

    role: actor.role,

    action,

    module,

    recordId,

    date: new Date().toISOString(),

    detail,
  }

  localStorage.setItem(AUDIT_KEY, JSON.stringify([entry, ...entries]))
}

function applyRules(db: Database, module: ModuleId, record: EntityRecord) {
  if (module === "contracts" && record.status === "Firmado") {
    const asset = db.inventory?.find((item) => item.name === record.asset)

    if (asset) {
      asset.status = String(record.asset).toLowerCase().includes("toyota")
        ? "Vendido"
        : "Arrendado"

      asset.updatedAt = new Date().toISOString()
    }
  }

  if (module === "people") record.payroll = "Incluido"
}

function isRole(value: unknown): value is Role {
  return typeof value === "string" && value in permissionMatrix
}

function isUser(record: EntityRecord): boolean {
  return (
    isRole(record.role) &&
    typeof record.name === "string" &&
    typeof record.email === "string" &&
    typeof record.password === "string" &&
    typeof record.active === "boolean" &&
    typeof record.avatar === "string"
  )
}

export const repository = {
  eventName: EVENT,

  async getAll(module: ModuleId): Promise<EntityRecord[]> {
    await wait()

    return (loadDb()[module] ?? []).filter((item) => !item.deleted)
  },

  async findUserByEmail(email: string): Promise<User | undefined> {
    await wait()

    const record = loadDb().users?.find(
      (item) =>
        !item.deleted &&
        typeof item.email === "string" &&
        item.email.toLowerCase() === email.toLowerCase(),
    )

    if (!record) return undefined

    if (!isUser(record))
      throw new Error("El registro de usuario no tiene un formato válido.")

    let modulePermissions: ModuleId[] | undefined

    if (typeof record.modulePermissions === "string") {
      const parsed = JSON.parse(record.modulePermissions) as unknown

      if (
        !Array.isArray(parsed) ||
        parsed.some(
          (module) =>
            typeof module !== "string" ||
            !(module in permissionMatrix.superAdmin),
        )
      )
        throw new Error("Los permisos del usuario tienen un formato no válido.")

      modulePermissions = (parsed as ModuleId[])
    }

    return {
      id: record.id,

      name: String(record.name),

      email: String(record.email),

      password: String(record.password),

      role: record.role as Role,

      active: record.active === true,

      avatar: String(record.avatar),

      modulePermissions,
    }
  },

  async create(
    module: ModuleId,

    data: Record<string, string | number | boolean>,

    actor: User,
  ) {
    await wait(420)

    const db = loadDb()

    const now = new Date().toISOString()

    const record: EntityRecord = {
      id: crypto.randomUUID(),

      createdAt: now,

      updatedAt: now,

      ...data,
    }

    db[module] = [record, ...(db[module] ?? [])]

    applyRules(db, module, record)

    saveDb(db)

    log(
      actor,

      module,

      "crear",

      record.id,

      `Creó ${String(record.name ?? record.code ?? record.id)}`,
    )

    return record
  },

  async update(
    module: ModuleId,

    id: string,

    data: Record<string, string | number | boolean>,

    actor: User,
  ) {
    await wait(420)

    const db = loadDb()

    const record = db[module]?.find((item) => item.id === id)

    if (!record) throw new Error("El registro ya no existe")

    Object.assign(record, data, { updatedAt: new Date().toISOString() })

    applyRules(db, module, record)

    saveDb(db)

    log(
      actor,

      module,

      "editar",

      id,

      `Actualizó ${String(record.name ?? record.code ?? id)}`,
    )

    return record
  },

  async remove(module: ModuleId, id: string, actor: User) {
    await wait(420)

    const db = loadDb()

    const record = db[module]?.find((item) => item.id === id)

    if (!record) throw new Error("El registro ya no existe")

    if (module === "crm") {
      record.name = "Cliente anonimizado"

      record.email = `anonimo-${id.slice(0, 6)}@privado.local`

      record.phone = "Protegido"

      record.active = false

      record.status = "Desactivado Ley 1581"
    } else {
      record.deleted = true
    }

    record.updatedAt = new Date().toISOString()

    saveDb(db)

    log(
      actor,

      module,

      "eliminar",

      id,

      module === "crm"
        ? "Anonimizó y desactivó cliente (Ley 1581 de 2012)"
        : "Desactivó el registro",
    )
  },

  async getAudit(): Promise<AuditEntry[]> {
    await wait()

    const saved = JSON.parse(
      localStorage.getItem(AUDIT_KEY) ?? "[]",
    ) as AuditEntry[]

    if (saved.length) return saved

    const examples: AuditEntry[] = [
      {
        id: "audit-demo-1",

        userId: demoUsers[1].id,

        userName: demoUsers[1].name,

        role: demoUsers[1].role,

        action: "actualizar",

        module: "crm",

        recordId: "rec-1",

        date: new Date(Date.now() - 45 * 60_000).toISOString(),

        detail: "Actualizó el seguimiento de un prospecto.",
      },

      {
        id: "audit-demo-2",

        userId: demoUsers[4].id,

        userName: demoUsers[4].name,

        role: demoUsers[4].role,

        action: "conciliar",

        module: "transactions",

        recordId: "TRX-2041",

        date: new Date(Date.now() - 2 * 60 * 60_000).toISOString(),

        detail: "Conciliación de pago recibida.",
      },

      {
        id: "audit-demo-3",

        userId: demoUsers[0].id,

        userName: demoUsers[0].name,

        role: demoUsers[0].role,

        action: "revisar",

        module: "security",

        recordId: "SEC-003",

        date: new Date(Date.now() - 5 * 60 * 60_000).toISOString(),

        detail: "Revisión de alerta de acceso.",
      },
    ]

    localStorage.setItem(AUDIT_KEY, JSON.stringify(examples))

    return examples
  },

  reset() {
    localStorage.removeItem(DB_KEY)

    localStorage.removeItem(AUDIT_KEY)

    loadDb()

    window.dispatchEvent(new CustomEvent(EVENT))
  },
}
