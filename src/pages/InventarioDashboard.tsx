import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { ArrowDownToLine, Boxes, CircleAlert, PackageCheck } from "lucide-react"

import DashboardState from "../components/DashboardState"

import KpiCard from "../components/KpiCard"

import { inventoryMonthlyMovements } from "../data/dashboardMock"

import useDashboardRecords from "../hooks/useDashboardRecords"

const modules = ["inventory", "movements"] as const

export default function InventarioDashboard() {
  const { data, loading, error, reload } = useDashboardRecords(modules)

  const inventory = data.inventory ?? []

  const movements = data.movements ?? []

  const criticalStock = inventory.filter(
    (item) => Number(item.quantity ?? 0) <= Number(item.minStock ?? 0),
  )

  const lowStock = [...inventory]

    .sort(
      (first, second) =>
        Number(first.quantity ?? 0) - Number(second.quantity ?? 0),
    )

    .slice(0, 5)

  const monthlyEntries = movements.filter(
    (movement) => movement.type === "Entrada",
  ).length

  return (
    <div className="dashboard-page">
      <header className="rounded-2xl bg-gradient-to-r from-slate-950 to-blue-900 p-6 text-white shadow-md">
        <span className="text-xs font-bold tracking-[0.16em] text-amber-300">
          OPERACIONES · INVENTARIO
        </span>
        <h1 className="mt-2 text-3xl font-bold">Control de existencias</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Niveles de stock, entradas y salidas. Este panel no incluye valores de
          venta.
        </p>
      </header>

      <DashboardState error={error} loading={loading} onRetry={reload} />
      {!loading && !error && (
        <>
          <section
            aria-label="Indicadores de inventario"
            className="grid gap-4 md:grid-cols-3"
          >
            <KpiCard
              accent="blue"
              detail="Productos y activos registrados"
              icon={Boxes}
              title="Total activos"
              value={inventory.length}
            />
            <KpiCard
              accent="red"
              detail="Existencias iguales o inferiores al mínimo"
              icon={CircleAlert}
              title="Stock crítico"
              value={criticalStock.length}
            />
            <KpiCard
              accent="green"
              detail="Entradas registradas en el período"
              icon={PackageCheck}
              title="Entradas del mes"
              value={monthlyEntries}
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold tracking-widest text-amber-700">
                ACTIVIDAD DE BODEGA
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">
                Movimientos de inventario
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Entradas y salidas mensuales por unidades.
              </p>
              <div className="mt-3 h-72 min-w-0">
                <ResponsiveContainer height="100%" width="100%">
                  <BarChart
                    data={inventoryMonthlyMovements}
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
                    <Legend />
                    <Bar
                      dataKey="entries"
                      fill="#d9a928"
                      name="Entradas"
                      radius={[5, 5, 0, 0]}
                    />
                    <Bar
                      dataKey="exits"
                      fill="#315f92"
                      name="Salidas"
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <ArrowDownToLine className="text-rose-700" size={19} />
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Top 5 productos con stock bajo
                  </h2>
                  <p className="text-sm text-slate-500">
                    Prioridad de reposición por unidades disponibles.
                  </p>
                </div>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Disponible</th>
                      <th>Mínimo</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map((item) => {
                      const critical =
                        Number(item.quantity ?? 0) <= Number(item.minStock ?? 0)

                      return (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>{item.minStock}</td>
                          <td>
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                critical
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {critical ? "Crítico" : "Bajo"}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                    {!lowStock.length && (
                      <tr>
                        <td colSpan={4}>No hay productos registrados.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        </>
      )}
    </div>
  )
}
