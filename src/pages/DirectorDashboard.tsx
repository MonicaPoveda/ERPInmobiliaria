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

import { Badge, Button } from "../components/ui"

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
        <article className="commercial-kpi commercial-kpi--featured">
          <span className="commercial-kpi__icon">
            <CircleDollarSign aria-hidden="true" size={20} />
          </span>
          <div>
            <small>Dinero en pipeline</small>
            <strong>{compactMoney(pipelineValue)}</strong>
            <span className="commercial-kpi__caption">
              {pipelineOpportunities.length} oportunidades activas
            </span>
          </div>
        </article>
        <article className="commercial-kpi">
          <span className="commercial-kpi__icon commercial-kpi__icon--green">
            <HandCoins aria-hidden="true" size={20} />
          </span>
          <div>
            <small>A punto de cerrar</small>
            <strong>{closingDeals}</strong>
            <span className="commercial-kpi__caption">
              Negocios en negociación
            </span>
          </div>
        </article>
        <article className="commercial-kpi">
          <span className="commercial-kpi__icon commercial-kpi__icon--blue">
            <BarChart3 aria-hidden="true" size={20} />
          </span>
          <div>
            <small>Conversión del equipo</small>
            <strong>24%</strong>
            <span className="commercial-kpi__caption">
              +3,2 pp frente al mes pasado
            </span>
          </div>
        </article>
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
            className="sales-chart"
            role="img"
          >
            {[previousMonthSales, currentMonthSales].map((month) => {
              const amount = month.sales * 1_000_000

              const maxSales = Math.max(
                previousMonthSales.sales,

                currentMonthSales.sales,
              )

              const height = (month.sales / maxSales) * 100

              return (
                <div className="sales-chart__column" key={month.month}>
                  <strong>{compactMoney(amount)}</strong>
                  <div className="sales-chart__track">
                    <span
                      className={
                        month === currentMonthSales
                          ? "sales-chart__bar sales-chart__bar--current"
                          : "sales-chart__bar"
                      }
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="sales-chart__month">{month.month}</span>
                </div>
              )
            })}
          </div>
          <div className="sales-chart__footer">
            <span>
              <i className="sales-chart__legend sales-chart__legend--previous" />
              Mes anterior
            </span>
            <span>
              <i className="sales-chart__legend" />
              Mes actual
            </span>
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
