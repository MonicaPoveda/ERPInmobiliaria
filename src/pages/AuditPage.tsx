import { useEffect, useMemo, useState } from "react"
import type { AuditEntry } from "../core/types"
import { repository } from "../data/repository"
import { Badge, Button, Input, Select, Spinner } from "../components/ui"
import { useApp } from "../state/AppContext"

export default function AuditPage() {
  const { notify } = useApp()
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [module, setModule] = useState("Todos")
  useEffect(() => {
    repository
      .getAudit()
      .then(setEntries)
      .finally(() => setLoading(false))
  }, [])
  const modules = ["Todos", ...new Set(entries.map((entry) => entry.module))]
  const filtered = useMemo(
    () =>
      entries.filter(
        (entry) =>
          (module === "Todos" || entry.module === module) &&
          Object.values(entry).some((value) =>
            String(value).toLowerCase().includes(query.toLowerCase()),
          ),
      ),
    [entries, module, query],
  )
  const exportCsv = () => {
    const rows = [
      "Fecha,Usuario,Rol,Modulo,Accion,Detalle",
      ...filtered.map((item) =>
        [
          item.date,
          item.userName,
          item.role,
          item.module,
          item.action,
          item.detail,
        ]
          .map((value) => `"${value}"`)
          .join(","),
      ),
    ]
    const url = URL.createObjectURL(
      new Blob([rows.join("\n")], { type: "text/csv" }),
    )
    const link = document.createElement("a")
    link.href = url
    link.download = "auditoria.csv"
    link.click()
    URL.revokeObjectURL(url)
    notify("Auditoría exportada.", "success")
  }
  return (
    <div className="module-page">
      <section className="module-hero">
        <div>
          <span>BITÁCORA INSTITUCIONAL</span>
          <h1>Auditoría de Operaciones</h1>
          <p>Trazabilidad de acciones por usuario, rol, módulo y fecha.</p>
        </div>
        <Button onClick={exportCsv}>Exportar auditoría</Button>
      </section>
      <section className="data-card">
        <div className="table-toolbar">
          <Input
            label="Buscar"
            onChange={(event) => setQuery(event.target.value)}
            value={query}
          />
          <Select
            label="Módulo"
            onChange={(event) => setModule(event.target.value)}
            options={modules}
            value={module}
          />
          <Button
            onClick={() => {
              setQuery("")
              setModule("Todos")
            }}
            variant="secondary"
          >
            Limpiar
          </Button>
        </div>
        {loading ? (
          <div className="state-panel">
            <Spinner />
          </div>
        ) : filtered.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Módulo</th>
                  <th>Acción</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => (
                  <tr key={entry.id}>
                    <td>{new Date(entry.date).toLocaleString("es-CO")}</td>
                    <td>{entry.userName}</td>
                    <td>
                      <Badge>{entry.role}</Badge>
                    </td>
                    <td>{entry.module}</td>
                    <td>{entry.action}</td>
                    <td>{entry.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="state-panel">
            <strong>Sin eventos</strong>
            <p>Las operaciones CRUD aparecerán aquí.</p>
          </div>
        )}
      </section>
    </div>
  )
}
