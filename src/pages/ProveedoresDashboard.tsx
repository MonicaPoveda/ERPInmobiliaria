import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { ClipboardCheck, Star, Truck, UsersRound } from "lucide-react"

import DashboardState from "../components/DashboardState"

import KpiCard from "../components/KpiCard"

import useDashboardRecords from "../hooks/useDashboardRecords"

import { supplierMonthlyActivity } from "../data/dashboardMock"

const modules = ["suppliers"] as const

export default function ProveedoresDashboard() {
  const { data, loading, error, reload } = useDashboardRecords(modules)

  const suppliers = data.suppliers ?? []

  const pending = suppliers.filter(
    (item) => item.status === "Evaluación pendiente",
  ).length

  const rating = suppliers.length
    ? (
        suppliers.reduce((sum, item) => sum + Number(item.rating ?? 0), 0) /
        suppliers.length
      ).toFixed(1)
    : "0.0"

  return (
    <div className="dashboard-page">
      <header className="rounded-2xl bg-gradient-to-r from-slate-950 to-blue-900 p-6 text-white shadow-md">
        <span className="text-xs font-bold tracking-[0.16em] text-amber-300">
          OPERACIONES · ABASTECIMIENTO
        </span>
        <h1 className="mt-2 text-3xl font-bold">Red de proveedores</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Directorio, servicios recibidos y seguimiento de evaluaciones.
        </p>
      </header>

      <DashboardState error={error} loading={loading} onRetry={reload} />
      {!loading && !error && (
        <>
          <section
            aria-label="Indicadores de proveedores"
            className="grid gap-4 md:grid-cols-3"
          >
            <KpiCard
              accent="blue"
              detail="Fichas activas en el directorio"
              icon={Truck}
              title="Proveedores registrados"
              value={suppliers.length}
            />
            <KpiCard
              accent="red"
              detail="Servicios por calificar"
              icon={ClipboardCheck}
              title="Evaluaciones pendientes"
              value={pending}
            />
            <KpiCard
              accent="gold"
              detail="Calificación del directorio"
              icon={Star}
              title="Promedio de evaluación"
              value={`${rating} / 5`}
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold tracking-widest text-amber-700">
                SEGUIMIENTO DE SERVICIOS
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">
                Servicios y evaluaciones
              </h2>
              <div className="mt-4 h-72 min-w-0">
                <ResponsiveContainer height="100%" width="100%">
                  <BarChart
                    data={supplierMonthlyActivity}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      stroke="#e8edf5"
                      strokeDasharray="4 4"
                      vertical={false}
                    />
                    <XAxis axisLine={false} dataKey="month" tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} width={38} />
                    <Tooltip />
                    <Bar
                      dataKey="services"
                      fill="#315f92"
                      name="Servicios recibidos"
                      radius={[5, 5, 0, 0]}
                    />
                    <Bar
                      dataKey="evaluations"
                      fill="#d9a928"
                      name="Evaluaciones"
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <UsersRound className="text-blue-800" size={19} />
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Directorio destacado
                  </h2>
                  <p className="text-sm text-slate-500">
                    Proveedores con mejor calificación.
                  </p>
                </div>
              </div>
              <ul className="divide-y divide-slate-100">
                {[...suppliers]
                  .sort(
                    (first, second) =>
                      Number(second.rating ?? 0) - Number(first.rating ?? 0),
                  )
                  .slice(0, 5)
                  .map((supplier) => (
                    <li
                      className="flex items-center justify-between gap-3 py-3"
                      key={supplier.id}
                    >
                      <div className="min-w-0">
                        <strong className="block truncate text-sm text-slate-800">
                          {supplier.name}
                        </strong>
                        <span className="text-xs text-slate-500">
                          {supplier.services}
                        </span>
                      </div>
                      <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">
                        ★ {supplier.rating}
                      </span>
                    </li>
                  ))}
                {!suppliers.length && (
                  <li className="py-4 text-sm text-slate-500">
                    Aún no hay proveedores registrados.
                  </li>
                )}
              </ul>
            </article>
          </section>
        </>
      )}
    </div>
  )
}
