import { useCallback, useEffect, useState } from "react"

import { useNavigate } from "react-router"

import { can, roleLabels } from "../core/permissions"

import type { EntityRecord, ModuleId } from "../core/types"

import { repository } from "../data/repository"

import { useApp } from "../state/AppContext"

import { Badge, Button, Spinner } from "../components/ui"

import TechnicalDashboard from "./TechnicalDashboard"
import DirectorDashboard from "./DirectorDashboard"
import AsesorDashboard from "./AsesorDashboard"

interface DashboardCard {
  module: ModuleId

  label: string

  path: string
}

interface DashboardHighlight {
  label: string

  value: string

  detail: string
}

const cards: DashboardCard[] = [
  { module: "inventory", label: "Productos en inventario", path: "/inventory" },

  { module: "crm", label: "Prospectos comerciales", path: "/crm" },

  { module: "contracts", label: "Contratos vigentes", path: "/contracts" },

  { module: "billing", label: "Facturas emitidas", path: "/billing" },

  {
    module: "suppliers",

    label: "Directorio de proveedores",

    path: "/suppliers",
  },

  { module: "transactions", label: "Transacciones", path: "/transactions" },

  { module: "expenses", label: "Solicitudes de egreso", path: "/expenses" },

  { module: "movements", label: "Movimientos recientes", path: "/movements" },

  { module: "kardex", label: "Trazabilidad de productos", path: "/kardex" },

  { module: "people", label: "Colaboradores", path: "/people" },

  { module: "payroll", label: "Novedades de nómina", path: "/payroll" },

  { module: "team", label: "Prospectos del equipo", path: "/team" },

  { module: "users", label: "Cuentas de usuario", path: "/users" },

  { module: "security", label: "Eventos de seguridad", path: "/security" },
]

const money = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",

    currency: "COP",

    maximumFractionDigits: 0,
  }).format(value)

export default function DashboardPage() {
  const { user } = useApp()

  if (!user) return null

  return user.role === "superAdmin" ? (
    <TechnicalDashboard />
  ) : user.role === "directorComercial" ? (
    <DirectorDashboard />
  ) : user.role === "asesorComercial" ? (
    <AsesorDashboard />
  ) : (
    <BusinessDashboard />
  )
}

function BusinessDashboard() {
  const { user, notify } = useApp()

  const navigate = useNavigate()

  const [data, setData] = useState<Record<string, EntityRecord[]>>({})

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)

    setError("")

    try {
      const modules = cards.filter((card) => can(user, card.module))

      const values = await Promise.all(
        modules.map(async (card) => {
          const records = await repository.getAll(card.module)

          return [
            card.module,

            user?.role === "asesorComercial" && card.module === "crm"
              ? records.filter((record) => record.advisor === user.name)
              : records,
          ] as const
        }),
      )

      setData(Object.fromEntries(values))
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No fue posible cargar los indicadores.",
      )
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void load()

    const update = () => void load()

    window.addEventListener(repository.eventName, update)

    return () => window.removeEventListener(repository.eventName, update)
  }, [load])

  if (!user) return null

  const subtitle = roleLabels[user.role]

  const billing = data.billing ?? []

  const expenses = data.expenses ?? []

  const transactions = data.transactions ?? []

  const suppliers = data.suppliers ?? []

  const payroll = data.payroll ?? []

  const employees = data.people ?? []

  const inventory = data.inventory ?? []

  const prospects = data.crm ?? []

  const team = data.team ?? []

  const receivable = billing

    .filter((item) => item.status !== "Pagada")

    .reduce((total, item) => total + Number(item.value ?? 0), 0)

  const highlights: DashboardHighlight[] =
    user.role === "coordinadorProveedores"
      ? [
          {
            label: "Proveedores",

            value: String(suppliers.length),

            detail: "Fichas en el directorio",
          },

          {
            label: "Evaluaciones pendientes",

            value: String(
              suppliers.filter(
                (record) => record.status === "Evaluación pendiente",
              ).length,
            ),

            detail: "Servicios por calificar",
          },

          {
            label: "Calificación promedio",

            value: `${(suppliers.reduce((sum, record) => sum + Number(record.rating ?? 0), 0) / Math.max(1, suppliers.length)).toFixed(1)} / 5`,

            detail: "Desempeño del directorio",
          },
        ]
      : user.role === "tesorero"
        ? [
            {
              label: "Cuentas por cobrar",

              value: money(receivable),

              detail: "Facturas pendientes y en mora",
            },

            {
              label: "Cuentas por pagar",

              value: money(
                expenses

                  .filter((record) => record.status === "Pendiente")

                  .reduce(
                    (sum, record) => sum + Number(record.amount ?? 0),

                    0,
                  ),
              ),

              detail: "Solicitudes sin aprobar",
            },

            {
              label: "Flujo de caja recibido",

              value: money(
                transactions

                  .filter((record) => record.type === "Pago recibido")

                  .reduce(
                    (sum, record) => sum + Number(record.amount ?? 0),

                    0,
                  ),
              ),

              detail: "Pagos registrados",
            },
          ]
        : user.role === "rrhh"
          ? [
              {
                label: "Cumpleaños del mes",

                value: String(
                  employees.filter(
                    (record) =>
                      String(record.birthday ?? "").slice(5, 7) ===
                      String(new Date().getMonth() + 1).padStart(2, "0"),
                  ).length,
                ),

                detail: "Colaboradores",
              },

              {
                label: "Contratos por vencer",

                value: String(
                  employees.filter(
                    (record) =>
                      String(record.contractEnd ?? "").slice(0, 7) ===
                      new Date().toISOString().slice(0, 7),
                  ).length,
                ),

                detail: "Durante este mes",
              },

              {
                label: "Solicitudes pendientes",

                value: String(
                  payroll.filter((record) => record.status === "Pendiente")
                    .length,
                ),

                detail: "Novedades de nómina",
              },
            ]
          : user.role === "almacenista"
            ? [
                {
                  label: "Stock crítico",

                  value: String(
                    inventory.filter(
                      (record) =>
                        Number(record.quantity ?? 0) <=
                        Number(record.minStock ?? 0),
                    ).length,
                  ),

                  detail: "Productos por reponer",
                },

                {
                  label: "Productos registrados",

                  value: String(inventory.length),

                  detail: "Existencias controladas",
                },

                {
                  label: "Movimientos del período",

                  value: String((data.movements ?? []).length),

                  detail: "Entradas y salidas",
                },
              ]
            : user.role === "asesorComercial"
              ? [
                  {
                    label: "Agenda de hoy",

                    value: "3 visitas",

                    detail: "Reuniones y llamadas programadas",
                  },

                  {
                    label: "Comisiones frente a meta",

                    value: `${money(prospects.reduce((sum, record) => sum + Number(record.commission ?? 0), 0))} / ${money(15000000)}`,

                    detail: "Meta mensual de comisiones",
                  },

                  {
                    label: "Oportunidades en cierre",

                    value: String(
                      prospects.filter((record) => record.stage === "Cierre")
                        .length,
                    ),

                    detail: "Prospectos propios",
                  },
                ]
              : [
                  {
                    label: "Asesores activos",

                    value: String(
                      new Set(team.map((record) => record.advisor)).size,
                    ),

                    detail: "Equipo comercial",
                  },

                  {
                    label: "Proyección consolidada",

                    value: money(
                      team.reduce(
                        (sum, record) => sum + Number(record.amount ?? 0),

                        0,
                      ),
                    ),

                    detail: "Valor total del pipeline",
                  },

                  {
                    label: "Negociaciones abiertas",

                    value: String(
                      team.filter((record) => record.stage === "Negociación")
                        .length,
                    ),

                    detail: "Descuentos por autorizar",
                  },
                ]

  return (
    <div className="dashboard-page">
      <section className="welcome-card">
        <div>
          <span>"PANEL OPERATIVO"</span>
          <h1>Bienvenido, {user.name.split(" ")[0]}</h1>
          <p>
            Panel de {subtitle}. Indicadores y alertas según los permisos de tu
            perfil.
          </p>
        </div>
        <div>
          <Badge tone="neutral">{subtitle}</Badge>
          <Button
            onClick={() => {
              void load()

              notify("Indicadores actualizados.", "success")
            }}
            variant="secondary"
          >
            Actualizar métricas
          </Button>
        </div>
      </section>
      {loading ? (
        <div className="state-panel">
          <Spinner />
          <p>Consolidando indicadores...</p>
        </div>
      ) : error ? (
        <div className="state-panel state-panel--error">
          <p>{error}</p>
          <Button onClick={() => void load()}>Reintentar</Button>
        </div>
      ) : (
        <>
          <section className="dashboard-highlights">
            {highlights.map((highlight) => (
              <article key={highlight.label}>
                <span>{highlight.label}</span>
                <strong>{highlight.value}</strong>
                <small>{highlight.detail}</small>
              </article>
            ))}
          </section>
          {user.role === "almacenista" && (
            <section className="data-card">
              <h2>Alertas de stock crítico</h2>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Existencias</th>
                      <th>Stock mínimo</th>
                      <th>Alerta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory

                      .filter(
                        (record) =>
                          Number(record.quantity ?? 0) <=
                          Number(record.minStock ?? 0),
                      )

                      .map((record) => (
                        <tr key={record.id}>
                          <td>{record.name}</td>
                          <td>{record.quantity}</td>
                          <td>{record.minStock}</td>
                          <td>
                            <Badge tone="danger">Reponer</Badge>
                          </td>
                        </tr>
                      ))}
                    {!inventory.some(
                      (record) =>
                        Number(record.quantity ?? 0) <=
                        Number(record.minStock ?? 0),
                    ) && (
                      <tr>
                        <td colSpan={4}>Sin alertas de stock.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          <section className="kpi-grid">
            {cards

              .filter((card) => can(user, card.module))

              .map((card) => (
                <Button
                  className="kpi-button"
                  key={card.module}
                  onClick={() => navigate(card.path)}
                  variant="ghost"
                >
                  <span>{card.label.toUpperCase()}</span>
                  <strong>{data[card.module]?.length ?? 0}</strong>
                  <small>Ver módulo completo →</small>
                </Button>
              ))}
          </section>
          <section className="dashboard-grid">
            <article className="chart-card">
              <div>
                <span>ACTIVIDAD POR MÓDULO</span>
                <h2>Resumen del área</h2>
              </div>
              <div className="bar-chart">
                {cards

                  .filter((card) => can(user, card.module))

                  .map((card, index) => (
                    <div key={card.module}>
                      <span
                        style={{
                          height: `${38 + (data[card.module]?.length ?? 0) + index * 4}%`,
                        }}
                      />
                      <small>{card.label.split(" ")[0]}</small>
                    </div>
                  ))}
              </div>
            </article>
            <article className="summary-card">
              <span>
                {user.role === "tesorero"
                  ? "CARTERA PENDIENTE"
                  : "RESUMEN DE OPERACIÓN"}
              </span>
              <strong>
                {user.role === "tesorero"
                  ? money(receivable)
                  : String(highlights[0]?.value ?? "—")}
              </strong>
              <p>
                {user.role === "tesorero"
                  ? "Facturas pendientes y en mora."
                  : `${subtitle}: información consolidada de los módulos habilitados.`}
              </p>
              <Button
                disabled={!can(user, "billing")}
                onClick={() => navigate("/billing")}
              >
                Gestionar facturación
              </Button>
            </article>
          </section>
        </>
      )}
    </div>
  )
}
