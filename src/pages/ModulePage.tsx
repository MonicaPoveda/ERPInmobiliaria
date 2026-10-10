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
        String(
          field.key === "subtotal"
            ? (initial?.subtotal ?? initial?.value ?? "")
            : (initial?.[field.key] ?? field.options?.[0] ?? ""),
        ),
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
      if (field.key === "rating" && value && Number(value) > 5)
        nextErrors[field.key] = "La calificación máxima es 5."
    })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    const data = Object.fromEntries(
      config.fields.map((field) => [
        field.key,
        field.type === "number" ? Number(values[field.key]) : values[field.key],
      ]),
    )
    if (config.id === "billing") {
      const subtotal = Number(values.subtotal)
      const iva = subtotal * 0.19
      const retentions = subtotal * 0.025
      Object.assign(data, {
        iva,
        retentions,
        value: subtotal + iva - retentions,
      })
    }
    onSubmit(data)
  }

  const control = (field: FieldConfig) => {
    if (field.key === "contractPdf")
      return (
        <Input
          accept="application/pdf,.pdf"
          key={field.key}
          label={String(initial?.contractPdf ?? field.label)}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              [field.key]: event.target.files?.[0]?.name ?? "",
            }))
          }
          type="file"
        />
      )
    if (
      config.id === "billing" &&
      ["iva", "retentions", "value"].includes(field.key)
    ) {
      const subtotal = Number(values.subtotal ?? 0)
      const calculatedValue =
        field.key === "iva"
          ? subtotal * 0.19
          : field.key === "retentions"
            ? subtotal * 0.025
            : subtotal * 1.165
      return (
        <Input
          disabled
          key={field.key}
          label={field.label}
          value={String(Math.round(calculatedValue))}
        />
      )
    }
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
  const { user, notify } = useApp()
  const baseConfig = moduleConfigs[moduleId]
  const config = {
    ...baseConfig,
    fields:
      moduleId === "inventory" && user?.role === "almacenista"
        ? baseConfig.fields.filter((field) => field.key !== "value")
        : baseConfig.fields,
  }
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
  const [specialRecord, setSpecialRecord] = useState<EntityRecord | null>(null)
  const [rating, setRating] = useState(5)
  const [evaluationOpen, setEvaluationOpen] = useState(false)
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState(false)
  const pageSize = 8

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const data = await repository.getAll(config.id)
      setRecords(
        user?.role === "asesorComercial"
          ? data.filter((item) => item.advisor === user.name)
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

  const updateSpecialRecord = async (
    data: Record<string, string | number | boolean>,
    successMessage: string,
  ) => {
    if (!user || !specialRecord) return
    setBusy(true)
    try {
      await repository.update(config.id, specialRecord.id, data, user)
      setSpecialRecord(null)
      notify(successMessage, "success")
    } catch (cause) {
      notify(
        cause instanceof Error ? cause.message : "No fue posible guardar.",
        "error",
      )
    } finally {
      setBusy(false)
    }
  }

  const updateRecord = async (
    record: EntityRecord,
    data: Record<string, string | number | boolean>,
    successMessage: string,
  ) => {
    if (!user) return
    try {
      await repository.update(config.id, record.id, data, user)
      notify(successMessage, "success")
    } catch (cause) {
      notify(
        cause instanceof Error ? cause.message : "No fue posible guardar.",
        "error",
      )
    }
  }

  const nextStage = (stage: unknown) =>
    stage === "Contacto"
      ? "Negociación"
      : stage === "Negociación"
        ? "Cierre"
        : null

  const addNote = () => {
    if (!specialRecord || !note.trim()) return
    const previous = String(specialRecord.notes ?? "")
    void updateSpecialRecord(
      {
        notes: [
          previous,
          `${new Date().toLocaleDateString("es-CO")}: ${note.trim()}`,
        ]
          .filter(Boolean)
          .join("\n"),
      },
      "Nota agregada al historial CRM.",
    )
    setNote("")
  }

  const save = async (data: Record<string, string | number | boolean>) => {
    if (!user) return
    const submitted =
      config.id === "crm" && user.role === "asesorComercial"
        ? { ...data, advisor: user.name }
        : data
    setBusy(true)
    try {
      if (editing === "new") {
        await repository.create(config.id, submitted, user)
        notify(`${config.singular} creado correctamente.`, "success")
      } else if (editing) {
        await repository.update(config.id, editing.id, submitted, user)
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
      {config.id === "suppliers" && (
        <section className="summary-card">
          <span>EVALUACIONES PENDIENTES</span>
          <strong>
            {
              records.filter(
                (record) => record.status === "Evaluación pendiente",
              ).length
            }
          </strong>
          <p>
            Evalúe cada servicio prestado para mantener actualizado el
            directorio de proveedores.
          </p>
        </section>
      )}
      {config.id === "crm" && user?.role === "asesorComercial" && (
        <section className="summary-card">
          <span>PROGRESO DE COMISIONES</span>
          <strong>
            {records.filter((record) => record.stage === "Cierre").length}{" "}
            cierres de meta
          </strong>
          <p>
            Tu embudo incluye únicamente los prospectos asignados a tu cuenta.
          </p>
        </section>
      )}
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
                        {config.id === "crm" && (
                          <>
                            {nextStage(record.stage) &&
                              can(user, config.id, "edit") && (
                                <Button
                                  onClick={() =>
                                    void updateRecord(
                                      record,
                                      {
                                        stage:
                                          nextStage(record.stage) ??
                                          String(record.stage),
                                      },
                                      "Prospecto avanzado en el pipeline.",
                                    )
                                  }
                                  variant="secondary"
                                >
                                  Mover a {nextStage(record.stage)}
                                </Button>
                              )}
                            <Button
                              onClick={() => {
                                setSpecialRecord(record)
                                setNote("")
                              }}
                              variant="ghost"
                            >
                              Historial / nota
                            </Button>
                            {user?.role === "directorComercial" &&
                              record.stage === "Negociación" &&
                              !record.discountApproved && (
                                <Button
                                  onClick={() =>
                                    void updateRecord(
                                      record,
                                      { discountApproved: true },
                                      "Descuento especial autorizado.",
                                    )
                                  }
                                  variant="gold"
                                >
                                  Autorizar descuento
                                </Button>
                              )}
                            {user?.role === "directorComercial" &&
                              record.discountApproved === true && (
                                <Badge tone="success">
                                  Descuento autorizado
                                </Badge>
                              )}
                          </>
                        )}
                        {config.id === "suppliers" && (
                          <>
                            <Button
                              onClick={() => {
                                setSpecialRecord(record)
                                setRating(Number(record.rating ?? 5))
                                setEvaluationOpen(true)
                              }}
                              variant="secondary"
                            >
                              Evaluar
                            </Button>
                            <Button
                              onClick={() => {
                                setSpecialRecord(record)
                                setEvaluationOpen(false)
                              }}
                              variant="ghost"
                            >
                              Historial
                            </Button>
                          </>
                        )}
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
      {specialRecord && config.id === "suppliers" && (
        <Modal
          onClose={() => {
            setSpecialRecord(null)
            setEvaluationOpen(false)
          }}
          title={`${
            evaluationOpen ? "Evaluación" : "Historial de servicios"
          } · ${String(specialRecord.name ?? "proveedor")}`}
          footer={
            evaluationOpen ? (
              <>
                <Button
                  onClick={() => {
                    setSpecialRecord(null)
                    setEvaluationOpen(false)
                  }}
                  variant="secondary"
                >
                  Cerrar
                </Button>
                <Button
                  disabled={busy}
                  onClick={() =>
                    void updateSpecialRecord(
                      { rating, status: "Activo" },
                      "Evaluación del proveedor guardada.",
                    )
                  }
                >
                  Guardar evaluación
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setSpecialRecord(null)}
                variant="secondary"
              >
                Cerrar historial
              </Button>
            )
          }
        >
          <p>
            <strong>Servicio:</strong>{" "}
            {String(specialRecord.services ?? "Sin servicios registrados")}
          </p>
          <p>
            <strong>Último servicio:</strong>{" "}
            {String(
              specialRecord.lastService ??
                "Mantenimiento preventivo · 12 jun. 2025",
            )}
          </p>
          <p>
            <strong>Historial:</strong>{" "}
            {String(
              specialRecord.serviceHistory ?? "Servicio recibido y verificado.",
            )}
          </p>
          {evaluationOpen && (
            <div
              className="rating-picker"
              aria-label="Calificación del servicio"
            >
              <span>Calificación</span>
              {[1, 2, 3, 4, 5].map((value) => (
                <Button
                  key={value}
                  aria-pressed={rating === value}
                  onClick={() => setRating(value)}
                  variant="ghost"
                >
                  <span
                    className={
                      rating >= value
                        ? "rating-star rating-star--active"
                        : "rating-star"
                    }
                  >
                    ★
                  </span>
                </Button>
              ))}
            </div>
          )}
        </Modal>
      )}
      {specialRecord && config.id === "crm" && (
        <Modal
          onClose={() => setSpecialRecord(null)}
          title={`Historial CRM · ${String(specialRecord.name ?? "")}`}
        >
          <div className="crm-note-history">
            {String(specialRecord.notes ?? "")
              .split("\n")
              .filter(Boolean)
              .map((entry, index) => (
                <p key={`${index}-${entry}`}>{entry}</p>
              ))}
            {!String(specialRecord.notes ?? "").trim() && (
              <p>Sin interacciones registradas.</p>
            )}
          </div>
          <div className="stack">
            <Textarea
              label="Nueva nota de interacción"
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              value={note}
            />
            <div className="modal-actions">
              <Button
                onClick={() => setSpecialRecord(null)}
                variant="secondary"
              >
                Cerrar
              </Button>
              <Button disabled={busy || !note.trim()} onClick={addNote}>
                Añadir nota
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
