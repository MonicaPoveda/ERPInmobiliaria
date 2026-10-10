import { useEffect, useState, type FormEvent } from "react"
import type { EntityRecord, StaffProfile } from "../core/types"
import { profileLabels, roleLabels } from "../core/permissions"
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
const profileOptions = [
  ...Object.values(profileLabels),
  roleLabels.administrator,
]
const staffProfiles: StaffProfile[] = [
  "commercial",
  "salesDirector",
  "providers",
  "finance",
  "hr",
  "inventory",
]
function profileKey(
  label: string,
): StaffProfile | "administrator" | undefined {
  if (label === roleLabels.administrator) return "administrator"
  return staffProfiles.find((profile) => profileLabels[profile] === label)
}

function displayRole(record: EntityRecord) {
  if (record.role === "administrator") return roleLabels.administrator
  if (record.role === "client") return roleLabels.client
  return (
    Object.entries(profileLabels).find(
      ([key]) => key === record.staffProfile,
    )?.[1] ?? roleLabels.staff
  )
}

export default function UsersPage() {
  const { user, notify } = useApp()
  const [records, setRecords] = useState<EntityRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<EntityRecord | null>(null)
  const [roleTarget, setRoleTarget] = useState<EntityRecord | null>(null)
  const [roleSelection, setRoleSelection] = useState(profileOptions[0])
  const [deleteTarget, setDeleteTarget] = useState<EntityRecord | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [newProfile, setNewProfile] = useState(profileOptions[0])
  const [busy, setBusy] = useState(false)
  const load = () =>
    repository
      .getAll("users")
      .then(setRecords)
      .finally(() => setLoading(false))
  useEffect(() => {
    void load()
  }, [])
  const toggle = async () => {
    if (!user || !selected) return
    setBusy(true)
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
      await load()
    } catch (cause) {
      notify(
        cause instanceof Error ? cause.message : "No fue posible actualizar.",
        "error",
      )
    } finally {
      setBusy(false)
    }
  }

  const assignRole = async () => {
    if (!user || !roleTarget) return
    const profile = profileKey(roleSelection)
    if (!profile) {
      notify("Seleccione un rol válido.", "error")
      return
    }
    const data: Record<string, string | number | boolean> = {
      role: profile === "administrator" ? "administrator" : "staff",
    }
    if (profile !== "administrator") data.staffProfile = profile
    setBusy(true)
    try {
      await repository.update("users", roleTarget.id, data, user)
      notify(`Rol actualizado para ${roleTarget.name}.`, "success")
      setRoleTarget(null)
      await load()
    } catch (cause) {
      notify(
        cause instanceof Error
          ? cause.message
          : "No fue posible cambiar el rol.",
        "error",
      )
    } finally {
      setBusy(false)
    }
  }

  const createUser = async (event: FormEvent) => {
    event.preventDefault()
    if (!user) return
    if (
      records.some(
        (record) =>
          String(record.email).toLowerCase() === email.trim().toLowerCase(),
      )
    ) {
      notify("Ya existe una cuenta con ese correo.", "error")
      return
    }

    const profile = profileKey(newProfile)
    if (!profile) {
      notify("Seleccione un rol válido.", "error")
      return
    }
    const initials = name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("")
    const data: Record<string, string | number | boolean> = {
      name: name.trim(),
      email: email.trim(),
      password,
      role: profile === "administrator" ? "administrator" : "staff",
      active: true,
      avatar: initials,
    }
    if (profile !== "administrator") data.staffProfile = profile
    setBusy(true)
    try {
      await repository.create("users", data, user)
      notify("Usuario creado correctamente.", "success")
      setCreateOpen(false)
      setName("")
      setEmail("")
      setPassword("")
      await load()
    } catch (cause) {
      notify(
        cause instanceof Error
          ? cause.message
          : "No fue posible crear el usuario.",
        "error",
      )
    } finally {
      setBusy(false)
    }
  }

  const removeUser = async () => {
    if (!user || !deleteTarget) return
    setBusy(true)
    try {
      await repository.remove("users", deleteTarget.id, user)
      notify("La cuenta fue desactivada y auditada.", "success")
      setDeleteTarget(null)
      await load()
    } catch (cause) {
      notify(
        cause instanceof Error
          ? cause.message
          : "No fue posible eliminar la cuenta.",
        "error",
      )
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="module-page">
      <section className="module-hero">
        <div>
          <span>ADMINISTRACIÓN DE ACCESOS</span>
          <h1>Usuarios & Roles</h1>
          <p>
            Crea cuentas, asigna uno de los siete perfiles funcionales y
            suspende accesos. Los permisos se aplican según el rol asignado.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} variant="gold">
          + Crear usuario
        </Button>
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
                  <th>Rol asignado</th>
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
                      <Badge>{displayRole(record)}</Badge>
                    </td>
                    <td>
                      <Badge tone={record.active ? "success" : "danger"}>
                        {record.active ? "Activo" : "Suspendido"}
                      </Badge>
                    </td>
                    <td>
                      <div className="row-actions">
                        {record.role !== "client" && record.id !== user?.id && (
                          <Button
                            onClick={() => {
                              setRoleTarget(record)
                              setRoleSelection(
                                record.role === "administrator"
                                  ? roleLabels.administrator
                                  : (Object.entries(profileLabels).find(
                                      ([key]) => key === record.staffProfile,
                                    )?.[1] ?? profileOptions[0]),
                              )
                            }}
                            variant="ghost"
                          >
                            Cambiar rol
                          </Button>
                        )}
                        {record.id !== user?.id && (
                          <Button
                            onClick={() => setSelected(record)}
                            variant="ghost"
                          >
                            {record.active ? "Suspender" : "Activar"}
                          </Button>
                        )}
                        {record.id !== user?.id && (
                          <Button
                            onClick={() => setDeleteTarget(record)}
                            variant="ghost"
                          >
                            Eliminar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {selected && (
        <ConfirmDialog
          busy={busy}
          message={`¿Confirma que desea ${
            selected.active ? "suspender" : "activar"
          } a ${selected.name}?`}
          onCancel={() => setSelected(null)}
          onConfirm={() => void toggle()}
          title="Cambiar estado de usuario"
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          busy={busy}
          message={`La cuenta de ${deleteTarget.name} se desactivará de forma auditada.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => void removeUser()}
          title="Eliminar cuenta"
        />
      )}
      {roleTarget && (
        <Modal
          onClose={() => setRoleTarget(null)}
          title={`Asignar rol a ${roleTarget.name}`}
        >
          <div className="form-grid">
            <Select
              label="Rol funcional"
              onChange={(event) => setRoleSelection(event.target.value)}
              options={profileOptions}
              value={roleSelection}
            />
          </div>
          <div className="modal-actions">
            <Button onClick={() => setRoleTarget(null)} variant="secondary">
              Cancelar
            </Button>
            <Button disabled={busy} onClick={() => void assignRole()}>
              Guardar rol
            </Button>
          </div>
        </Modal>
      )}
      {createOpen && (
        <Modal onClose={() => setCreateOpen(false)} title="Crear usuario">
          <form className="record-form" onSubmit={createUser}>
            <div className="form-grid">
              <Input
                label="Nombre completo"
                onChange={(event) => setName(event.target.value)}
                required
                value={name}
              />
              <Input
                autoComplete="email"
                label="Correo"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
              <Input
                autoComplete="new-password"
                label="Contraseña temporal"
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
              <Select
                label="Rol funcional"
                onChange={(event) => setNewProfile(event.target.value)}
                options={profileOptions}
                value={newProfile}
              />
            </div>
            <div className="modal-actions">
              <Button
                onClick={() => setCreateOpen(false)}
                type="button"
                variant="secondary"
              >
                Cancelar
              </Button>
              <Button disabled={busy} type="submit">
                {busy ? "Creando..." : "Crear cuenta"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
