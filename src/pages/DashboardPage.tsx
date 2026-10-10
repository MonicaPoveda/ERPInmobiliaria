import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { can, profileLabels, roleLabels } from "../core/permissions"
import type { EntityRecord, ModuleId } from "../core/types"
import { repository } from "../data/repository"
import { useApp } from "../state/AppContext"
import { Badge, Button, Spinner } from "../components/ui"

const cards: Array<{
  module: ModuleId
  label: string
  path: string
}> = [
  { module: "inventory", label: "Activos administrados", path: "/inventory" },
  { module: "crm", label: "Prospectos activos", path: "/crm" },
  { module: "contracts", label: "Contratos vigentes", path: "/contracts" },
  { module: "billing", label: "Facturación registrada", path: "/billing" },
]

export default function DashboardPage() {
  const { user, notify } = useApp()
  const navigate = useNavigate()
  const [data, setData] = useState<Record<string, EntityRecord[]>>({})
  const [loading, setLoading] = useState(true)
  const load = useCallback(async () => {
    setLoading(true)
    const modules = cards.filter((card) => can(user, card.module))
    const values = await Promise.all(
      modules.map(
        async (card) =>
          [card.module, await repository.getAll(card.module)] as const,
      ),
    )
    setData(Object.fromEntries(values))
    setLoading(false)
  }, [user])
  useEffect(() => {
    void load()
    const update = () => void load()
    window.addEventListener(repository.eventName, update)
    return () => window.removeEventListener(repository.eventName, update)
  }, [load])
  if (!user) return null
  const subtitle = user.staffProfile
    ? profileLabels[user.staffProfile]
    : roleLabels[user.role]
  const billing = data.billing ?? []
  const receivable = billing
    .filter((item) => item.status !== "Pagada")
    .reduce((total, item) => total + Number(item.value ?? 0), 0)
  return (
    <div className="dashboard-page">
      <section className="welcome-card">
        <div>
          <span>CONSOLIDADO CORPORATIVO</span>
          <h1>Bienvenido, {user.name.split(" ")[0]}</h1>
          <p>
            Panel operativo de {subtitle}. La información se actualiza con cada
            movimiento del ERP.
          </p>
        </div>
        <div>
          <Badge tone={user.role === "administrator" ? "admin" : user.role}>
            {subtitle}
          </Badge>
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
      ) : (
        <>
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
                <span>FLUJO CONSOLIDADO</span>
                <h2>Actividad por módulo</h2>
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
              <span>CARTERA PENDIENTE</span>
              <strong>
                {new Intl.NumberFormat("es-CO", {
                  style: "currency",
                  currency: "COP",
                  maximumFractionDigits: 0,
                }).format(receivable)}
              </strong>
              <p>
                Valor calculado en tiempo real con facturas pendientes y en
                mora.
              </p>
              <Button
                disabled={!can(user, "billing")}
                onClick={() => navigate("/billing")}
              >
                Gestionar cartera
              </Button>
            </article>
          </section>
        </>
      )}
    </div>
  )
}
