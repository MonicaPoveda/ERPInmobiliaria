import { useCallback, useEffect, useState, type FormEvent } from "react"

import type { EntityRecord, ModuleId, Role } from "../core/types"

import { permissionMatrix, roleLabels } from "../core/permissions"

import { repository } from "../data/repository"

import { useApp } from "../state/AppContext"

import {
  Badge,
  Button,
  ConfirmDialog,
  Input,
  Modal,
  Select,
  Spinner,
} from "../components/ui"

const roleOptions = Object.keys(roleLabels) as Role[]

const moduleLabels: Partial<Record<ModuleId, string>> = {
  dashboard: "Panel",

  inventory: "Inventario",

  crm: "Gestión comercial",

  contracts: "Contratos",

  people: "Talento humano",

  billing: "Facturación",

  portal: "Portal",

  security: "Seguridad",

  users: "Usuarios",

  audit: "Auditoría",

  settings: "Configuración",

  suppliers: "Proveedores",

  transactions: "Transacciones",

  expenses: "Egresos",

  movements: "Movimientos",

  kardex: "Kardex",

  payroll: "Nómina",

  team: "Equipo comercial",
}

const modules = Object.keys(moduleLabels) as ModuleId[]

function permissionsFromRecord(record: EntityRecord | "new") {
  if (record === "new" || typeof record.modulePermissions !== "string")
    return null

  try {
    return JSON.parse(record.modulePermissions) as ModuleId[]
  } catch {
    return null
  }
}

function UserModal({
  record,

  saving,

  onClose,

  onSave,
}: {
  record: EntityRecord | "new"

  saving: boolean

  onClose: () => void

  onSave: (data: Record<string, string | number | boolean>) => void
}) {
  const initialRole =
    record === "new" ? "asesorComercial" : String(record.role) as Role

  const [name, setName] = useState(
    record === "new" ? "" : String(record.name ?? ""),
  )

  const [email, setEmail] = useState(
    record === "new" ? "" : String(record.email ?? ""),
  )

  const [password, setPassword] = useState("")

  const [role, setRole] = useState<Role>(initialRole)

  const [allowedModules, setAllowedModules] = useState<ModuleId[]>(
    permissionsFromRecord(record) ??
      Object.keys(permissionMatrix[initialRole]) as ModuleId[],
  )

  const selectRole = (nextRole: string) => {
    const typedRole = nextRole as Role

    setRole(typedRole)

    setAllowedModules(Object.keys(permissionMatrix[typedRole]) as ModuleId[])
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()

    if (record === "new" && !password.trim()) return

    const initials = name

      .trim()

      .split(/\s+/)

      .map((part) => part[0])

      .join("")

      .slice(0, 2)

      .toUpperCase()

    onSave({
      name: name.trim(),

      email: email.trim(),

      role,

      modulePermissions: JSON.stringify(allowedModules),

      ...(record === "new" ? { password, avatar: initials, active: true } : {}),
    })
  }

  return (
    <Modal
      onClose={onClose}
      title={`${record === "new" ? "Crear" : "Editar"} cuenta de usuario`}
    >
      <form className="stack" onSubmit={submit}>
        <div className="form-grid">
          <Input
            label="Nombre completo"
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
          <Input
            label="Correo de acceso"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
          {record === "new" && (
            <Input
              label="Contraseña inicial"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          )}
          <Select
            label="Perfil de acceso"
            onChange={(event) =>
              selectRole(
                roleOptions.find(
                  (item) => roleLabels[item] === event.target.value,
                ) ?? role,
              )
            }
            options={roleOptions.map((item) => roleLabels[item])}
            value={roleLabels[role]}
          />
        </div>
        <fieldset className="permission-checklist">
          <legend>Permisos de módulos</legend>
          <p>
            El rol establece los límites máximos de acceso. Puedes restringirlos
            por cuenta.
          </p>
          <div className="permission-grid">
            {modules.map((module) => {
              const allowedByRole = module in permissionMatrix[role]

              return (
                <label key={module}>
                  <input
                    checked={allowedModules.includes(module)}
                    disabled={!allowedByRole || module === "dashboard"}
                    onChange={(event) =>
                      setAllowedModules((current) =>
                        event.target.checked
                          ? [...current, module]
                          : current.filter((item) => item !== module),
                      )
                    }
                    type="checkbox"
                  />
                  {moduleLabels[module]}
                </label>
              )
            })}
          </div>
        </fieldset>
        <div className="modal-actions">
          <Button onClick={onClose} type="button" variant="secondary">
            Cancelar
          </Button>
          <Button disabled={saving} type="submit">
            {saving ? "Guardando..." : "Guardar usuario"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default function UsersPage() {
  const { user, notify } = useApp()

  const [records, setRecords] = useState<EntityRecord[]>([])

  const [loading, setLoading] = useState(true)

  const [editing, setEditing] = useState<EntityRecord | "new" | null>(null)

  const [selected, setSelected] = useState<EntityRecord | null>(null)

  const [deleting, setDeleting] = useState<EntityRecord | null>(null)

  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setRecords(await repository.getAll("users"))
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "No fue posible cargar los usuarios.",
        "error",
      )
    } finally {
      setLoading(false)
    }
  }, [notify])

  useEffect(() => {
    void load()

    window.addEventListener(repository.eventName, load)

    return () => window.removeEventListener(repository.eventName, load)
  }, [load])

  const save = async (data: Record<string, string | number | boolean>) => {
    if (!user) return

    setSaving(true)

    try {
      if (editing === "new") await repository.create("users", data, user)
      else if (editing) await repository.update("users", editing.id, data, user)

      setEditing(null)

      notify("Cuenta guardada correctamente.", "success")
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "No fue posible guardar la cuenta.",
        "error",
      )
    } finally {
      setSaving(false)
    }
  }

  const toggle = async () => {
    if (!user || !selected) return

    try {
      await repository.update(
        "users",
        selected.id,
        { active: !selected.active },
        user,
      )

      notify(
        `Usuario ${selected.active ? "suspendido" : "activado"}.`,
        "success",
      )

      setSelected(null)
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "No fue posible cambiar el estado.",
        "error",
      )
    }
  }

  const remove = async () => {
    if (!user || !deleting) return

    try {
      await repository.remove("users", deleting.id, user)

      setDeleting(null)

      notify("Cuenta eliminada.", "success")
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "No fue posible eliminar la cuenta.",
        "error",
      )
    }
  }

  return (
    <div className="module-page">
      <section className="module-hero">
        <div>
          <span>ADMINISTRACIÓN DE ACCESOS</span>
          <h1>Usuarios y permisos</h1>
          <p>Creación, suspensión y control de acceso por perfil y módulo.</p>
        </div>
        <Button onClick={() => setEditing("new")}>+ Crear usuario</Button>
      </section>
      <section className="data-card">
        {loading ? (
          <div className="state-panel">
            <Spinner />
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Perfil</th>
                  <th>Permisos asignados</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>{record.name}</td>
                    <td>{record.email}</td>
                    <td>
                      <Badge>
                        {roleLabels[(String(record.role) as Role)] ??
                          String(record.role)}
                      </Badge>
                    </td>
                    <td>
                      {permissionsFromRecord(record)
                        ?.map((module) => moduleLabels[module])
                        .join(", ") ?? "Permisos predeterminados del perfil"}
                    </td>
                    <td>
                      <Badge tone={record.active ? "success" : "danger"}>
                        {record.active ? "Activo" : "Suspendido"}
                      </Badge>
                    </td>
                    <td>
                      <div className="row-actions">
                        <Button
                          onClick={() => setEditing(record)}
                          variant="ghost"
                        >
                          Editar
                        </Button>
                        <Button
                          onClick={() => setSelected(record)}
                          variant="secondary"
                        >
                          {record.active ? "Suspender" : "Activar"}
                        </Button>
                        <Button
                          disabled={record.id === user?.id}
                          onClick={() => setDeleting(record)}
                          variant="ghost"
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {editing && (
        <UserModal
          onClose={() => setEditing(null)}
          onSave={(data) => void save(data)}
          record={editing}
          saving={saving}
        />
      )}
      {selected && (
        <ConfirmDialog
          message={`¿Confirma que desea ${
            selected.active ? "suspender" : "activar"
          } a ${selected.name}?`}
          onCancel={() => setSelected(null)}
          onConfirm={() => void toggle()}
          title="Cambiar estado de usuario"
        />
      )}
      {deleting && (
        <ConfirmDialog
          message={`La cuenta de ${deleting.name} dejará de aparecer en el directorio.`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => void remove()}
          title="Eliminar usuario"
        />
      )}
    </div>
  )
}
