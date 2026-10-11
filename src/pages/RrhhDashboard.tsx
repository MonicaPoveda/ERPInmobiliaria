import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

import { Cake, CalendarClock, ClipboardList, UsersRound } from "lucide-react"

import DashboardState from "../components/DashboardState"

import KpiCard from "../components/KpiCard"

import { noveltyDistribution } from "../data/dashboardMock"

import useDashboardRecords from "../hooks/useDashboardRecords"

const modules = ["people", "payroll"] as const

export default function RrhhDashboard() {
  const { data, loading, error, reload } = useDashboardRecords(modules)

  const employees = data.people ?? []

  const payroll = data.payroll ?? []

  const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0")

  const birthdays = employees.filter(
    (person) => String(person.birthday ?? "").slice(5, 7) === currentMonth,
  )

  const activeEmployees = employees.filter(
    (person) => person.status === "Activo",
  )

  const expiringContracts = employees.filter((person) => {
    const endDate = new Date(String(person.contractEnd ?? ""))

    const daysRemaining = (endDate.getTime() - Date.now()) / 86_400_000

    return (
      Number.isFinite(daysRemaining) &&
      daysRemaining >= 0 &&
      daysRemaining <= 60
    )
  })

  const pendingRequests = payroll.filter(
    (record) => record.status === "Pendiente",
  ).length

  return (
    <div className="dashboard-page">
      <header className="rounded-2xl bg-gradient-to-r from-slate-950 to-blue-900 p-6 text-white shadow-md">
        <span className="text-xs font-bold tracking-[0.16em] text-amber-300">
          TALENTO HUMANO
        </span>
        <h1 className="mt-2 text-3xl font-bold">Personas y bienestar</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Seguimiento de la plantilla, novedades y fechas clave del equipo.
        </p>
      </header>

      <DashboardState error={error} loading={loading} onRetry={reload} />
      {!loading && !error && (
        <>
          <section
            aria-label="Indicadores de talento humano"
            className="grid gap-4 md:grid-cols-3"
          >
            <KpiCard
              accent="blue"
              detail="Colaboradores vinculados"
              icon={UsersRound}
              title="Plantilla activa"
              value={activeEmployees.length}
            />
            <KpiCard
              accent="red"
              detail="En los próximos 60 días"
              icon={CalendarClock}
              title="Contratos por vencer"
              value={expiringContracts.length}
            />
            <KpiCard
              accent="gold"
              detail="Novedades pendientes de revisión"
              icon={ClipboardList}
              title="Solicitudes pendientes"
              value={pendingRequests}
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold tracking-widest text-amber-700">
                NOVEDADES
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">
                Distribución de novedades
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Solicitudes registradas por tipo.
              </p>
              <div className="h-72 min-w-0">
                <ResponsiveContainer height="100%" width="100%">
                  <PieChart>
                    <Pie
                      data={noveltyDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="48%"
                      innerRadius={64}
                      outerRadius={100}
                      paddingAngle={4}
                    >
                      {noveltyDistribution.map((item) => (
                        <Cell fill={item.color} key={item.name} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Cake className="text-amber-700" size={20} />
                <div>
                  <p className="text-xs font-bold tracking-widest text-amber-700">
                    CELEBRACIONES
                  </p>
                  <h2 className="text-lg font-bold text-slate-900">
                    Cumpleaños del mes
                  </h2>
                </div>
              </div>
              <div className="space-y-2">
                {birthdays.map((person, index) => {
                  const day = String(person.birthday ?? "").slice(8, 10)

                  const initials = String(person.name ?? "Equipo")
                    .split(" ")
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")

                  return (
                    <div
                      className="flex items-center gap-3 rounded-lg bg-slate-50 p-3"
                      key={person.id}
                    >
                      <span
                        className={`grid h-10 w-10 place-items-center rounded-full ${avatarColors[index % avatarColors.length]} text-xs font-bold`}
                      >
                        {initials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <strong className="block truncate text-sm text-slate-800">
                          {person.name}
                        </strong>
                        <span className="text-xs text-slate-500">
                          {person.position}
                        </span>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                        Día {day}
                      </span>
                    </div>
                  )
                })}
                {!birthdays.length && (
                  <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                    No hay cumpleaños registrados este mes.
                  </p>
                )}
              </div>
            </article>
          </section>
        </>
      )}
    </div>
  )
}

const avatarColors = [
  "bg-amber-100 text-amber-800",
  "bg-blue-100 text-blue-800",
  "bg-emerald-100 text-emerald-800",
]
