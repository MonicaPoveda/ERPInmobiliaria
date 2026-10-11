import { useState } from "react"

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Check,
  CircleDollarSign,
  Crown,
  Gauge,
  HandCoins,
  Users,
  X,
} from "lucide-react"

import { useNavigate } from "react-router"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Badge, Button } from "../components/ui"
import KpiCard from "../components/KpiCard"

import {
  commercialAdvisors,
  initialDiscountApprovals,
  monthlySales,
  pipelineOpportunities,
  type DiscountApproval,
} from "../data/mockCommercial"

import { useApp } from "../state/AppContext"

const money = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",

    currency: "COP",

    maximumFractionDigits: 0,
  }).format(value)

const compactMoney = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",

    currency: "COP",

    notation: "compact",

    maximumFractionDigits: 1,
  }).format(value)

export default function DirectorDashboard() {
  const { user, notify } = useApp()

  const navigate = useNavigate()

  const [approvals, setApprovals] = useState(initialDiscountApprovals)

  if (!user) return null

  const pendingApprovals = approvals.filter(
    (approval) => approval.status === "Pendiente",
  )

  const pipelineValue = pipelineOpportunities.reduce(
    (total, opportunity) => total + opportunity.value,

    0,
  )

  const closingDeals = pipelineOpportunities.filter(
    (opportunity) => opportunity.stage === "Negociación",
  ).length

  const orderedAdvisors = [...commercialAdvisors].sort(
    (first, second) =>
      second.achieved / second.target - first.achieved / first.target,
  )

  const topSeller = orderedAdvisors[0]

  const currentMonthSales = monthlySales[monthlySales.length - 1]

  const previousMonthSales = monthlySales[monthlySales.length - 2]

  const salesChange = Math.round(
    ((currentMonthSales.sales - previousMonthSales.sales) /
      previousMonthSales.sales) *
      100,
  )

  const decideApproval = (
    approval: DiscountApproval,

    status: "Aprobada" | "Rechazada",
  ) => {
    setApprovals((current) =>
      current.map((item) =>
        item.id === approval.id ? { ...item, status } : item,
      ),
    )

    notify(
      status === "Aprobada"
        ? `Descuento autorizado para ${approval.property}.`
        : `Solicitud de descuento rechazada para ${approval.property}.`,

      status === "Aprobada" ? "success" : "warning",
    )
  }

  return (
    <div className="dashboard-page commercial-dashboard director-dashboard">
      <section className="commercial-hero director-hero">
        <div>
          <span className="commercial-eyebrow">
            <Gauge aria-hidden="true" size={15} />
            DIRECCIÓN COMERCIAL · VESTA ERP
          </span>
          <h1>Centro de mando comercial</h1>
          <p>
            Rendimiento del equipo, oportunidades activas y decisiones que
            impulsan el cierre.
          </p>
        </div>
        <div className="director-hero__actions">
          <span className="commercial-period">Octubre 2026</span>
          <Button onClick={() => navigate("/catalogo")} variant="gold">
            Ver catálogo
          </Button>
        </div>
      </section>

      <section aria-label="Indicadores comerciales" className="commercial-kpis">
        <KpiCard accent="gold" detail={`${pipelineOpportunities.length} oportunidades activas`} icon={CircleDollarSign} title="Dinero en pipeline" value={compactMoney(pipelineValue)} />
        <KpiCard accent="green" detail="Negocios en negociación" icon={HandCoins} title="A punto de cerrar" value={closingDeals} />
        <KpiCard accent="blue" change={{ value: `${Math.abs(salesChange)}% vs. mes anterior`, direction: salesChange >= 0 ? "positive" : "negative" }} detail="Conversión del equipo" icon={BarChart3} title="Tasa de conversión" value="24%" />
      </section>

      <section className="commercial-main-grid">
        <article className="data-card commercial-panel sales-performance">
          <div className="commercial-panel__heading">
            <div>
              <span className="commercial-eyebrow">TENDENCIA DE CIERRES</span>
              <h2>Rendimiento mensual de ventas</h2>
              <p>Comparativo entre el mes actual y el anterior.</p>
            </div>
            <span className="sales-change">
              <ArrowUpRight aria-hidden="true" size={16} />
              {salesChange}% vs. mes anterior
            </span>
          </div>
          <div
            aria-label={`Ventas: ${money(currentMonthSales.sales * 1_000_000)} en ${currentMonthSales.month} frente a ${money(previousMonthSales.sales * 1_000_000)} en ${previousMonthSales.month}`}
            className="h-64 min-w-0"
            role="img"
          >
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={monthlySales} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#e8edf5" strokeDasharray="4 4" vertical={false} />
                <XAxis axisLine={false} dataKey="month" tickLine={false} />
                <YAxis axisLine={false} tickFormatter={(value: number) => compactMoney(value * 1_000_000)} tickLine={false} width={64} />
                <Tooltip formatter={(value) => money(Number(value) * 1_000_000)} />
                <Bar dataKey="sales" fill="#d9a928" name="Ventas cerradas (millones COP)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="data-card commercial-panel director-team-summary">
          <div className="commercial-panel__heading">
            <div>
              <span className="commercial-eyebrow">OBJETIVO DE EQUIPO</span>
              <h2>Rendimiento destacado</h2>
            </div>
            <Users aria-hidden="true" className="commercial-heading-icon" />
          </div>
          <div className="top-seller-card">
            <span className="top-seller-card__crown">
              <Crown aria-hidden="true" size={19} />
            </span>
            <div>
              <small>TOP SELLER DEL MES</small>
              <strong>{topSeller.name}</strong>
              <span>
                {topSeller.closedDeals} negocios ganados ·{" "}
                {Math.round((topSeller.achieved / topSeller.target) * 100)}% de
                meta
              </span>
            </div>
          </div>
          <div className="team-summary-list">
            <div>
              <span>Asesores activos</span>
              <strong>{commercialAdvisors.length}</strong>
            </div>
            <div>
              <span>Meta consolidada del mes</span>
              <strong>
                {compactMoney(
                  commercialAdvisors.reduce(
                    (total, advisor) => total + advisor.target,

                    0,
                  ),
                )}
              </strong>
            </div>
          </div>
          <Button onClick={() => navigate("/team")} variant="secondary">
            Abrir gestión de equipo
          </Button>
        </article>
      </section>

      <section className="data-card commercial-panel leaderboard-panel">
        <div className="commercial-panel__heading">
          <div>
            <span className="commercial-eyebrow">RANKING DE ASESORES</span>
            <h2>Leaderboard comercial</h2>
            <p>
              Progreso de comisión, cierres ganados y oportunidades perdidas.
            </p>
          </div>
          <Badge tone="admin">Octubre 2026</Badge>
        </div>
        <div className="table-scroll">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Asesor</th>
                <th>Meta mensual</th>
                <th>Comisión lograda</th>
                <th>Ganados</th>
                <th>Perdidos</th>
              </tr>
            </thead>
            <tbody>
              {orderedAdvisors.map((advisor, index) => {
                const progress = Math.min(
                  100,

                  Math.round((advisor.achieved / advisor.target) * 100),
                )

                const underperforming = progress < 60

                return (
                  <tr
                    className={underperforming ? "leaderboard-row--low" : ""}
                    key={advisor.id}
                  >
                    <td>
                      <span className="leaderboard-advisor">
                        <span className="leaderboard-advisor__avatar">
                          {advisor.avatar}
                        </span>
                        <strong>{advisor.name}</strong>
                        {index === 0 && (
                          <Crown
                            aria-label="Top Seller"
                            className="leaderboard-crown"
                            size={16}
                          />
                        )}
                      </span>
                    </td>
                    <td>
                      <div className="goal-cell">
                        <div className="goal-track">
                          <span
                            className={
                              underperforming
                                ? "goal-track__fill goal-track__fill--low"
                                : "goal-track__fill"
                            }
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <strong>{progress}%</strong>
                      </div>
                    </td>
                    <td>{money(advisor.achieved)}</td>
                    <td>{advisor.closedDeals}</td>
                    <td
                      className={
                        underperforming ? "leaderboard-lost--high" : ""
                      }
                    >
                      {advisor.lostDeals}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="data-card commercial-panel approvals-panel">
        <div className="commercial-panel__heading">
          <div>
            <span className="commercial-eyebrow">ACCIÓN RÁPIDA</span>
            <h2>Aprobaciones pendientes</h2>
            <p>Solicitudes de descuento especial enviadas por el equipo.</p>
          </div>
          <Badge tone={pendingApprovals.length ? "warning" : "success"}>
            {pendingApprovals.length} pendientes
          </Badge>
        </div>
        {approvals.length ? (
          <div className="approval-list">
            {approvals.map((approval) => (
              <article className="approval-item" key={approval.id}>
                <div className="approval-item__icon">
                  <HandCoins aria-hidden="true" size={18} />
                </div>
                <div className="approval-item__copy">
                  <strong>
                    Asesor {approval.advisor} solicita aprobar descuento del{" "}
                    {approval.discount}% para {approval.property}.
                  </strong>
                  <span>
                    {approval.requestedAt} · Solicitud de precio especial
                  </span>
                </div>
                <div className="approval-item__actions">
                  {approval.status === "Pendiente" ? (
                    <>
                      <Button
                        aria-label={`Aprobar descuento para ${approval.property}`}
                        onClick={() => decideApproval(approval, "Aprobada")}
                        variant="gold"
                      >
                        <Check aria-hidden="true" size={15} />
                        Aprobar
                      </Button>
                      <Button
                        aria-label={`Rechazar descuento para ${approval.property}`}
                        onClick={() => decideApproval(approval, "Rechazada")}
                        variant="danger"
                      >
                        <X aria-hidden="true" size={15} />
                        Rechazar
                      </Button>
                    </>
                  ) : (
                    <Badge
                      tone={
                        approval.status === "Aprobada" ? "success" : "danger"
                      }
                    >
                      {approval.status}
                    </Badge>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="commercial-empty">
            No hay solicitudes de descuento pendientes.
          </div>
        )}
      </section>
      <div className="director-sales-footnote">
        <ArrowDownRight aria-hidden="true" size={14} />
        Valores comerciales de demostración en pesos colombianos.
      </div>
    </div>
  )
}
