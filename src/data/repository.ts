import type { AuditEntry, EntityRecord, ModuleId, User } from "../core/types"
import { createSeedData } from "./seed"

const DB_KEY = "arias-empire-db-v2"
const AUDIT_KEY = "arias-empire-audit-v2"
const EVENT = "arias-data-change"

interface Database {
  [module: string]: EntityRecord[]
}

const wait = (delay = 280) =>
  new Promise((resolve) => setTimeout(resolve, delay))

function loadDb(): Database {
  const saved = localStorage.getItem(DB_KEY)
  if (saved) return JSON.parse(saved) as Database
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

export const repository = {
  eventName: EVENT,
  async getAll(module: ModuleId): Promise<EntityRecord[]> {
    await wait()
    return (loadDb()[module] ?? []).filter((item) => !item.deleted)
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
    return JSON.parse(localStorage.getItem(AUDIT_KEY) ?? "[]") as AuditEntry[]
  },
  reset() {
    localStorage.removeItem(DB_KEY)
    localStorage.removeItem(AUDIT_KEY)
    loadDb()
    window.dispatchEvent(new CustomEvent(EVENT))
  },
}
