import { useEffect, useState } from "react"
import type { EntityRecord } from "../core/types"
import { repository } from "../data/repository"
import { useApp } from "../state/AppContext"
import { Badge, Button, ConfirmDialog, Spinner } from "../components/ui"

export default function UsersPage() {
  const { user, notify } = useApp()
  const [records, setRecords] = useState<EntityRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<EntityRecord | null>(null)
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
    await repository.update(
      "users",
      selected.id,
      { active: !selected.active },
      user,
    )
    notify(
      `Usuario ${selected.active ? "desactivado" : "activado"}.`,
      "success",
    )
    setSelected(null)
    void load()
  }
  return (
    <div className="module-page">
      <section className="module-hero">
        <div>
          <span>ADMINISTRACIÓN DE ACCESOS</span>
          <h1>Usuarios & Roles</h1>
          <p>
            Gestión centralizada de cuentas, estados y perfiles corporativos.
          </p>
        </div>
        <Button
          onClick={() =>
            notify(
              "Los usuarios demo se administran desde el directorio institucional simulado.",
              "info",
            )
          }
        >
          Sincronizar directorio
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
                  <th>Rol</th>
                  <th>Subperfil</th>
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
                      <Badge>{record.role}</Badge>
                    </td>
                    <td>{record.staffProfile ?? "—"}</td>
                    <td>
                      <Badge tone={record.active ? "success" : "danger"}>
                        {record.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        onClick={() => setSelected(record)}
                        variant="ghost"
                      >
                        {record.active ? "Desactivar" : "Activar"}
                      </Button>
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
          message={`¿Confirma que desea ${
            selected.active ? "desactivar" : "activar"
          } a ${selected.name}?`}
          onCancel={() => setSelected(null)}
          onConfirm={() => void toggle()}
          title="Cambiar estado de usuario"
        />
      )}
    </div>
  )
}
