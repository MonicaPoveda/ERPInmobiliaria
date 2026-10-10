import { useCallback, useEffect, useState, type FormEvent } from "react"

import type { EntityRecord, FieldConfig, ModuleId } from "../core/types"

import { moduleConfigs } from "../core/modules"

import { repository } from "../data/repository"

import { useApp } from "../state/AppContext"

import {
  Badge,
  Button,
  ConfirmDialog,
  Input,
  Modal,
  Select,
} from "../components/ui"

const advisors = ["Valentina Ríos", "Camilo Restrepo", "Andrés Pardo"]

function RecordModal({
  config,

  record,

  saving,

  onClose,

  onSave,
}: {
  config: typeof moduleConfigs[string]

  record: EntityRecord | "new"

  saving: boolean

  onClose: () => void

  onSave: (data: Record<string, string | number | boolean>) => void
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      config.fields.map((field) => [
        field.key,

        String(
          record === "new"
            ? (field.options?.[0] ?? "")
            : (record[field.key] ?? field.options?.[0] ?? ""),
        ),
      ]),
    ),
  )

  const save = (event: FormEvent) => {
    event.preventDefault()

    const missing = config.fields.find(
      (field) => field.required && !values[field.key]?.trim(),
    )

    if (missing) return

    onSave(
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

  const input = (field: FieldConfig) => {
    const value = values[field.key] ?? ""

    const update = (next: string) =>
      setValues((current) => ({ ...current, [field.key]: next }))

    if (field.type === "select")
      return (
        <Select
          key={field.key}
          label={field.label}
          onChange={(event) => update(event.target.value)}
          options={field.options ?? []}
          value={value}
        />
      )

    return (
      <Input
        key={field.key}
        label={field.label}
        onChange={(event) => update(event.target.value)}
        type={
          field.type === "number"
            ? "number"
            : field.type === "date"
              ? "date"
              : "text"
        }
        value={value}
      />
    )
  }

  return (
    <Modal
      onClose={onClose}
      title={`${record === "new" ? "Registrar" : "Editar"} ${config.singular}`}
    >
      <form className="stack" onSubmit={save}>
        <div className="form-grid">{config.fields.map(input)}</div>
        <div className="modal-actions">
          <Button onClick={onClose} type="button" variant="secondary">
            Cancelar
          </Button>
          <Button disabled={saving} type="submit">
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default function OperationsPage({
  moduleId,
}: {
  moduleId: "expenses" | "payroll" | "team"
}) {
  const config = moduleConfigs[moduleId]

  const { user, notify } = useApp()

  const [records, setRecords] = useState<EntityRecord[]>([])

  const [editing, setEditing] = useState<EntityRecord | "new" | null>(null)

  const [deleting, setDeleting] = useState<EntityRecord | null>(null)

  const [reassigning, setReassigning] = useState<EntityRecord | null>(null)

  const [advisor, setAdvisor] = useState(advisors[0])

  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setRecords(await repository.getAll(moduleId))
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "No fue posible cargar los registros.",
        "error",
      )
    }
  }, [moduleId, notify])

  useEffect(() => {
    void load()

    window.addEventListener(repository.eventName, load)

    return () => window.removeEventListener(repository.eventName, load)
  }, [load])

  const save = async (data: Record<string, string | number | boolean>) => {
    if (!user) return

    setSaving(true)

    try {
      if (editing === "new") await repository.create(moduleId, data, user)
      else if (editing)
        await repository.update(moduleId, editing.id, data, user)

      setEditing(null)

      notify("Cambios guardados correctamente.", "success")
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "No fue posible guardar.",
        "error",
      )
    } finally {
      setSaving(false)
    }
  }

  const update = async (
    record: EntityRecord,
    data: Record<string, string | number | boolean>,
    message: string,
  ) => {
    if (!user) return

    try {
      await repository.update(moduleId, record.id, data, user)

      notify(message, "success")
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "No fue posible actualizar.",
        "error",
      )
    }
  }

  const remove = async () => {
    if (!user || !deleting) return

    try {
      await repository.remove(moduleId, deleting.id, user)

      setDeleting(null)

      notify(`${config.singular} eliminado.`, "success")
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "No fue posible eliminar.",
        "error",
      )
    }
  }

  const approveReassignment = async () => {
    if (!reassigning) return

    await update(reassigning, { advisor }, `Prospecto reasignado a ${advisor}.`)

    setReassigning(null)
  }

  const daysUnavailable = records

    .filter(
      (record) => record.type === "Incapacidad" && record.status !== "Denegada",
    )

    .reduce((sum, record) => sum + Number(record.days ?? 0), 0)

  const pending = records.filter(
    (record) => record.status === "Pendiente",
  ).length

  const projectedSales = records.reduce(
    (sum, record) => sum + Number(record.amount ?? 0),
    0,
  )

  return (
    <div className="module-page">
      <section className="module-hero">
        <div>
          <span>{config.eyebrow}</span>
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>
        <Button onClick={() => setEditing("new")} variant="gold">
          + Registrar {config.singular}
        </Button>
      </section>
      <section className="kpi-grid">
        <article>
          <span>REGISTROS</span>
          <strong>{records.length}</strong>
          <small>Base operativa</small>
        </article>
        <article>
          <span>PENDIENTES</span>
          <strong>{pending}</strong>
          <small>Requieren gestión</small>
        </article>
        {moduleId === "payroll" && (
          <article>
            <span>DÍAS DE INCAPACIDAD</span>
            <strong>{daysUnavailable}</strong>
            <small>Días por descontar de nómina</small>
          </article>
        )}
        {moduleId === "team" && (
          <article>
            <span>PROYECCIÓN COMERCIAL</span>
            <strong>
              {new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                maximumFractionDigits: 0,
              }).format(projectedSales)}
            </strong>
            <small>Oportunidades consolidadas</small>
          </article>
        )}
        {moduleId === "expenses" && (
          <article>
            <span>ÓRDENES EMITIDAS</span>
            <strong>
              {
                records.filter((record) => record.status === "Orden emitida")
                  .length
              }
            </strong>
            <small>Compras autorizadas</small>
          </article>
        )}
      </section>
      {moduleId === "payroll" && (
        <section className="summary-card">
          <span>PRE-LIQUIDACIÓN ESTIMADA</span>
          <strong>
            {30 - daysUnavailable} días trabajados por colaborador
          </strong>
          <p>
            Se descuentan los días de incapacidad aprobados o pendientes del
            período de 30 días.
          </p>
        </section>
      )}
      <section className="data-card">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {config.fields.map((field) => (
                  <th key={field.key}>{field.label}</th>
                ))}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  {config.fields.map((field) => (
                    <td key={field.key}>
                      {field.key === "amount" ? (
                        new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: "COP",
                          maximumFractionDigits: 0,
                        }).format(Number(record[field.key] ?? 0))
                      ) : field.key === "status" ? (
                        <Badge
                          tone={
                            record.status === "Aprobada" ||
                            record.status === "Orden emitida"
                              ? "success"
                              : record.status === "Rechazada" ||
                                  record.status === "Denegada"
                                ? "danger"
                                : "warning"
                          }
                        >
                          {String(record[field.key] ?? "—")}
                        </Badge>
                      ) : (
                        String(record[field.key] ?? "—")
                      )}
                    </td>
                  ))}
                  <td>
                    <div className="row-actions">
                      {moduleId === "expenses" &&
                        record.status === "Pendiente" && (
                          <>
                            <Button
                              onClick={() =>
                                void update(
                                  record,
                                  { status: "Aprobada" },
                                  "Solicitud aprobada.",
                                )
                              }
                              variant="secondary"
                            >
                              Aprobar
                            </Button>
                            <Button
                              onClick={() =>
                                void update(
                                  record,
                                  { status: "Rechazada" },
                                  "Solicitud rechazada.",
                                )
                              }
                              variant="ghost"
                            >
                              Rechazar
                            </Button>
                          </>
                        )}
                      {moduleId === "expenses" &&
                        record.status === "Aprobada" && (
                          <Button
                            onClick={() =>
                              void update(
                                record,
                                { status: "Orden emitida" },
                                "Orden de compra emitida.",
                              )
                            }
                            variant="secondary"
                          >
                            Emitir orden
                          </Button>
                        )}
                      {moduleId === "payroll" &&
                        record.status === "Pendiente" && (
                          <>
                            <Button
                              onClick={() =>
                                void update(
                                  record,
                                  { status: "Aprobada" },
                                  "Novedad aprobada.",
                                )
                              }
                              variant="secondary"
                            >
                              Aprobar
                            </Button>
                            <Button
                              onClick={() =>
                                void update(
                                  record,
                                  { status: "Denegada" },
                                  "Novedad denegada.",
                                )
                              }
                              variant="ghost"
                            >
                              Denegar
                            </Button>
                          </>
                        )}
                      {moduleId === "team" && (
                        <>
                          <Button
                            onClick={() => {
                              setReassigning(record)
                              setAdvisor(String(record.advisor ?? advisors[0]))
                            }}
                            variant="secondary"
                          >
                            Reasignar
                          </Button>
                          {record.stage === "Negociación" &&
                            record.discountApproved !== "Sí" &&
                            record.discountApproved !== true && (
                              <Button
                                onClick={() =>
                                  void update(
                                    record,
                                    { discountApproved: "Sí" },
                                    "Descuento especial autorizado.",
                                  )
                                }
                                variant="gold"
                              >
                                Autorizar descuento
                              </Button>
                            )}
                        </>
                      )}
                      <Button
                        onClick={() => setEditing(record)}
                        variant="ghost"
                      >
                        Editar
                      </Button>
                      <Button
                        onClick={() => setDeleting(record)}
                        variant="ghost"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!records.length && (
                <tr>
                  <td colSpan={config.fields.length + 1}>
                    No hay registros todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      {editing && (
        <RecordModal
          config={config}
          onClose={() => setEditing(null)}
          onSave={(data) => void save(data)}
          record={editing}
          saving={saving}
        />
      )}
      {deleting && (
        <ConfirmDialog
          message={`¿Desea eliminar este registro de ${config.singular}?`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => void remove()}
          title="Confirmar eliminación"
        />
      )}
      {reassigning && (
        <Modal onClose={() => setReassigning(null)} title="Reasignar prospecto">
          <div className="stack">
            <p>
              Selecciona el asesor que continuará la gestión de{" "}
              <strong>{String(reassigning.name ?? "")}</strong>.
            </p>
            <Select
              label="Nuevo asesor"
              onChange={(event) => setAdvisor(event.target.value)}
              options={advisors}
              value={advisor}
            />
            <div className="modal-actions">
              <Button onClick={() => setReassigning(null)} variant="secondary">
                Cancelar
              </Button>
              <Button onClick={() => void approveReassignment()}>
                Guardar asignación
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
