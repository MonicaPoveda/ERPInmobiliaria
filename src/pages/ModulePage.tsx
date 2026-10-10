import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react"
import { can } from "../core/permissions"
import { moduleConfigs } from "../core/modules"
import type { EntityRecord, FieldConfig, ModuleConfig } from "../core/types"
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
  Textarea,
} from "../components/ui"

function displayValue(value: unknown) {
  if (typeof value === "number")
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(value)
  return String(value ?? "—")
}

function statusTone(
  value: unknown,
): "success" | "warning" | "danger" | "neutral" {
  const text = String(value).toLowerCase()
  if (
    [
      "pagada",
      "activo",
      "activa",
      "firmado",
      "resuelta",
      "revisado",
      "disponible",
    ].some((term) => text.includes(term))
  )
    return "success"
  if (
    ["mora", "vencido", "alta", "mantenimiento"].some((term) =>
      text.includes(term),
    )
  )
    return "danger"
  if (["pendiente", "proceso", "borrador"].some((term) => text.includes(term)))
    return "warning"
  return "neutral"
}

function RecordForm({
  config,
  initial,
  busy,
  editable,
  onCancel,
  onSubmit,
}: {
  config: ModuleConfig
  initial?: EntityRecord
  busy: boolean
  editable: boolean
  onCancel: () => void
  onSubmit: (data: Record<string, string | number | boolean>) => void
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      config.fields.map((field) => [
        field.key,
        String(initial?.[field.key] ?? field.options?.[0] ?? ""),
      ]),
    ),
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const nextErrors: Record<string, string> = {}
    config.fields.forEach((field) => {
      const value = values[field.key]?.trim()
      if (field.required && !value)
        nextErrors[field.key] = `${field.label} es obligatorio.`
      if (field.type === "email" && value && !/^\S+@\S+\.\S+$/.test(value))
        nextErrors[field.key] = "Ingrese un correo válido."
      if (field.type === "number" && value && Number(value) <= 0)
        nextErrors[field.key] = "El valor debe ser mayor que cero."
    })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    onSubmit(
      Object.fromEntries(
        config.fields.map((field) => [
          field.key,
          field.type === "number"
            ? Number(values[field.key])
            : values[field.key],
        ]),
      ),
    )
  }

  const control = (field: FieldConfig) => {
    const common = {
      disabled: !editable,
      label: field.label,
      error: errors[field.key],
      value: values[field.key],
      onChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
      ) =>
        setValues((current) => ({
          ...current,
          [field.key]: event.target.value,
        })),
    }
    if (field.type === "select")
      return (
        <Select key={field.key} options={field.options ?? []} {...common} />
      )
    if (field.type === "textarea")
      return <Textarea key={field.key} rows={4} {...common} />
    return <Input key={field.key} type={field.type ?? "text"} {...common} />
  }

  return (
    <form className="record-form" onSubmit={submit}>
      <div className="form-grid">{config.fields.map(control)}</div>
      <div className="modal-actions">
        <Button onClick={onCancel} type="button" variant="secondary">
          {editable ? "Cancelar" : "Cerrar"}
        </Button>
        {editable && (
          <Button disabled={busy} type="submit">
            {busy ? "Guardando..." : "Guardar cambios"}
          </Button>
        )}
      </div>
    </form>
  )
}

export default function ModulePage({
  moduleId,
}: {
  moduleId: keyof typeof moduleConfigs
}) {
  const config = moduleConfigs[moduleId]
  const { user, notify } = useApp()
  const [records, setRecords] = useState<EntityRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("Todos")
  const [sortKey, setSortKey] = useState(config.fields[0].key)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<EntityRecord | "new" | null>(null)
  const [deleting, setDeleting] = useState<EntityRecord | null>(null)
  const [busy, setBusy] = useState(false)
  const pageSize = 8

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const data = await repository.getAll(config.id)
      setRecords(
        user?.role === "client"
          ? data.filter((item) => !item.client || item.client === user.name)
          : data,
      )
    } catch {
      setError("No fue posible cargar los datos. Intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }, [config.id, user])

  useEffect(() => {
    void load()
    const update = () => void load()
    window.addEventListener(repository.eventName, update)
    return () => window.removeEventListener(repository.eventName, update)
  }, [load])

  const statuses = useMemo(
    () => [
      "Todos",
      ...new Set(
        records.map((item) =>
          String(item.status ?? item.stage ?? item.severity ?? "Sin estado"),
        ),
      ),
    ],
    [records],
  )
  const filtered = useMemo(
    () =>
      records
        .filter((record) => {
          const matchesQuery = Object.values(record).some((value) =>
            String(value).toLowerCase().includes(query.toLowerCase()),
          )
          const recordStatus = String(
            record.status ?? record.stage ?? record.severity ?? "Sin estado",
          )
          return (
            matchesQuery &&
            (statusFilter === "Todos" || recordStatus === statusFilter)
          )
        })
        .sort((a, b) => {
          const left = a[sortKey] ?? ""
          const right = b[sortKey] ?? ""
          return (
            String(left).localeCompare(String(right), "es", { numeric: true }) *
            (sortDirection === "asc" ? 1 : -1)
          )
        }),
    [records, query, statusFilter, sortKey, sortDirection],
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => setPage(1), [query, statusFilter])
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const save = async (data: Record<string, string | number | boolean>) => {
    if (!user) return
    setBusy(true)
    try {
      if (editing === "new") {
        await repository.create(config.id, data, user)
        notify(`${config.singular} creado correctamente.`, "success")
      } else if (editing) {
        await repository.update(config.id, editing.id, data, user)
        notify(`${config.singular} actualizado correctamente.`, "success")
      }
      setEditing(null)
    } catch (cause) {
      notify(
        cause instanceof Error ? cause.message : "No fue posible guardar.",
        "error",
      )
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!user || !deleting) return
    setBusy(true)
    try {
      await repository.remove(config.id, deleting.id, user)
      notify(
        config.id === "crm"
          ? "Cliente anonimizado y desactivado conforme a Ley 1581."
          : `${config.singular} desactivado correctamente.`,
        "success",
      )
      setDeleting(null)
    } catch {
      notify("No fue posible completar la acción.", "error")
    } finally {
      setBusy(false)
    }
  }

  const exportCsv = () => {
    const fields = config.fields.map((field) => field.key)
    const rows = [
      fields.join(","),
      ...filtered.map((record) =>
        fields
          .map(
            (field) => `"${String(record[field] ?? "").replace(/"/g, '""')}"`,
          )
          .join(","),
      ),
    ]
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + rows.join("\n")], {
        type: "text/csv;charset=utf-8",
      }),
    )
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${config.id}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
    notify("Archivo CSV generado correctamente.", "success")
  }

  const exportPdf = () => {
    const printable = window.open("", "_blank", "width=900,height=700")
    if (!printable)
      return notify("El navegador bloqueó la ventana de impresión.", "warning")
    printable.document.write(
      `<html><head><title>${config.title}</title><style>body{font-family:Arial;padding:32px}table{width:100%;border-collapse:collapse}th,td{padding:8px;border:1px solid #ddd;text-align:left}</style></head><body><h1>${config.title}</h1><table><thead><tr>${config.fields.map((field) => `<th>${field.label}</th>`).join("")}</tr></thead><tbody>${filtered.map((record) => `<tr>${config.fields.map((field) => `<td>${displayValue(record[field.key])}</td>`).join("")}</tr>`).join("")}</tbody></table></body></html>`,
    )
    printable.document.close()
    printable.focus()
    printable.print()
    notify("Documento listo para guardar como PDF.", "success")
  }

  return (
    <div className="module-page">
      <section
        className={`module-hero ${
          config.id === "billing" ? "module-hero--dark" : ""
        }`}
      >
        <div>
          <span>{config.eyebrow}</span>
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>
        <div className="hero-actions">
          <Button onClick={exportCsv} variant="secondary">
            Exportar CSV
          </Button>
          <Button onClick={exportPdf} variant="secondary">
            Documento PDF
          </Button>
          {can(user, config.id, "create") && (
            <Button onClick={() => setEditing("new")} variant="gold">
              + Registrar {config.singular}
            </Button>
          )}
        </div>
      </section>
      <section className="kpi-grid">
        <article>
          <span>REGISTROS ACTIVOS</span>
          <strong>{records.length}</strong>
          <small>Base sincronizada</small>
        </article>
        <article>
          <span>ESTADO OPERATIVO</span>
          <strong>100%</strong>
          <small>Información disponible</small>
        </article>
        <article>
          <span>ACTUALIZADOS HOY</span>
          <strong>
            {
              records.filter(
                (item) =>
                  item.updatedAt.slice(0, 10) ===
                  new Date().toISOString().slice(0, 10),
              ).length
            }
          </strong>
          <small>Movimientos registrados</small>
        </article>
        <article>
          <span>CUMPLIMIENTO</span>
          <strong>98.2%</strong>
          <small>Control institucional</small>
        </article>
      </section>
      <section className="data-card">
        <div className="table-toolbar">
          <Input
            aria-label="Buscar registros"
            label="Buscar"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Código, nombre, cliente..."
            value={query}
          />
          <Select
            label="Estado"
            onChange={(event) => setStatusFilter(event.target.value)}
            options={statuses}
            value={statusFilter}
          />
          <Button
            onClick={() => {
              setQuery("")
              setStatusFilter("Todos")
              notify("Filtros restablecidos.", "info")
            }}
            variant="secondary"
          >
            Limpiar filtros
          </Button>
        </div>
        {loading ? (
          <div className="state-panel">
            <Spinner />
            <p>Cargando información...</p>
          </div>
        ) : error ? (
          <div className="state-panel state-panel--error">
            <p>{error}</p>
            <Button onClick={() => void load()}>Reintentar</Button>
          </div>
        ) : !visible.length ? (
          <div className="state-panel">
            <strong>No hay resultados</strong>
            <p>Pruebe otros filtros o registre un nuevo elemento.</p>
            {can(user, config.id, "create") && (
              <Button onClick={() => setEditing("new")}>
                Crear {config.singular}
              </Button>
            )}
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {config.fields.map((field) => (
                    <th key={field.key}>
                      <Button
                        className="sort-button"
                        onClick={() => {
                          if (sortKey === field.key)
                            setSortDirection((value) =>
                              value === "asc" ? "desc" : "asc",
                            )
                          else {
                            setSortKey(field.key)
                            setSortDirection("asc")
                          }
                        }}
                        variant="ghost"
                      >
                        {field.label}
                        {sortKey === field.key
                          ? sortDirection === "asc"
                            ? " ↑"
                            : " ↓"
                          : ""}
                      </Button>
                    </th>
                  ))}
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((record) => (
                  <tr key={record.id}>
                    {config.fields.map((field) => (
                      <td key={field.key}>
                        {["status", "stage", "severity"].includes(field.key) ? (
                          <Badge tone={statusTone(record[field.key])}>
                            {displayValue(record[field.key])}
                          </Badge>
                        ) : (
                          displayValue(record[field.key])
                        )}
                      </td>
                    ))}
                    <td>
                      <div className="row-actions">
                        <Button
                          onClick={() => {
                            setEditing(record)
                            notify(
                              `Vista de ${config.singular} abierta.`,
                              "info",
                            )
                          }}
                          variant="ghost"
                        >
                          {can(user, config.id, "edit") ? "Editar" : "Ver"}
                        </Button>
                        {can(user, config.id, "delete") && (
                          <Button
                            onClick={() => setDeleting(record)}
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
        <div className="pagination">
          <span>
            Mostrando {visible.length} de {filtered.length} registros
          </span>
          <div>
            <Button
              disabled={page === 1}
              onClick={() => setPage((value) => value - 1)}
              variant="secondary"
            >
              Anterior
            </Button>
            <Badge>
              {page} / {totalPages}
            </Badge>
            <Button
              disabled={page === totalPages}
              onClick={() => setPage((value) => value + 1)}
              variant="secondary"
            >
              Siguiente
            </Button>
          </div>
        </div>
      </section>
      {editing && (
        <Modal
          onClose={() => setEditing(null)}
          title={`${
            editing === "new"
              ? "Nuevo"
              : can(user, config.id, "edit")
                ? "Editar"
                : "Detalle de"
          } ${config.singular}`}
        >
          <RecordForm
            busy={busy}
            config={config}
            editable={
              editing === "new"
                ? can(user, config.id, "create")
                : can(user, config.id, "edit")
            }
            initial={editing === "new" ? undefined : editing}
            onCancel={() => setEditing(null)}
            onSubmit={save}
          />
        </Modal>
      )}
      {deleting && (
        <ConfirmDialog
          busy={busy}
          message={
            config.id === "crm"
              ? "El cliente será anonimizado y desactivado; no se eliminará físicamente, conforme a Ley 1581 de 2012."
              : `Esta acción desactivará ${config.singular}. El cambio quedará en auditoría.`
          }
          onCancel={() => setDeleting(null)}
          onConfirm={remove}
          title={`Confirmar eliminación de ${config.singular}`}
        />
      )}
    </div>
  )
}
