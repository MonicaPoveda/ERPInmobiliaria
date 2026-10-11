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

import { Link } from "react-router"

import {
  ArrowUpRight,
  Banknote,
  CircleDollarSign,
  FileClock,
  Wallet,
} from "lucide-react"

import DashboardState from "../components/DashboardState"

import KpiCard from "../components/KpiCard"

import { formatCOP } from "../core/format"

import {
  financeMonthlyFlow,
  upcomingInvoiceReminders,
} from "../data/dashboardMock"

import useDashboardRecords from "../hooks/useDashboardRecords"

import { useApp } from "../state/AppContext"

const modules = ["billing", "transactions", "expenses"] as const

export default function TesoreroDashboard() {
  const { user } = useApp()

  const { data, loading, error, reload } = useDashboardRecords(modules)

  if (!user) return null

  const billing = data.billing ?? []

  const transactions = data.transactions ?? []

  const expenses = data.expenses ?? []

  const receivable = billing

    .filter((item) => item.status === "Pendiente" || item.status === "En mora")

    .reduce((total, item) => total + Number(item.value ?? 0), 0)

  const payable = expenses

    .filter((item) => item.status === "Pendiente")

    .reduce((total, item) => total + Number(item.amount ?? 0), 0)

  const received = transactions

    .filter((item) => item.type === "Pago recibido")

    .reduce((total, item) => total + Number(item.amount ?? 0), 0)

  return (
    <div className="dashboard-page">
      <header className="rounded-2xl bg-gradient-to-r from-slate-950 to-blue-900 p-6 text-white shadow-md">
        <span className="text-xs font-bold tracking-[0.16em] text-amber-300">
          FINANZAS · TESORERÍA
        </span>
        <h1 className="mt-2 text-3xl font-bold">Panel financiero</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Cartera, recaudos y compromisos de pago en un solo lugar.
        </p>
      </header>

      <DashboardState error={error} loading={loading} onRetry={reload} />
      {!loading && !error && (
        <>
          <section
            aria-label="Indicadores financieros"
            className="grid gap-4 md:grid-cols-3"
          >
            <KpiCard
              accent="blue"
              detail="Recaudos registrados"
              icon={Wallet}
              title="Flujo de caja total"
              value={formatCOP(received - payable)}
            />
            <KpiCard
              accent="gold"
              detail={`${billing.filter((item) => item.status !== "Pagada").length} facturas pendientes`}
              icon={CircleDollarSign}
              title="Cuentas por cobrar"
              value={formatCOP(receivable)}
            />
            <KpiCard
              accent="red"
              detail={`${expenses.filter((item) => item.status === "Pendiente").length} solicitudes por aprobar`}
              icon={Banknote}
              title="Cuentas por pagar"
              value={formatCOP(payable)}
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]">
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5">
                <p className="text-xs font-bold tracking-widest text-amber-700">
                  ÚLTIMOS SEIS MESES
                </p>
                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  Ingresos vs egresos
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Comparativo mensual de caja en pesos colombianos.
                </p>
              </div>
              <div className="h-72 min-w-0">
                <ResponsiveContainer height="100%" width="100%">
                  <BarChart
                    data={financeMonthlyFlow}
                    margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
                  >
                    <CartesianGrid
                      stroke="#e8edf5"
                      strokeDasharray="4 4"
                      vertical={false}
                    />
                    <XAxis axisLine={false} dataKey="month" tickLine={false} />
                    <YAxis
                      axisLine={false}
                      tickFormatter={(value: number) => `${value / 1_000_000}M`}
                      tickLine={false}
                      width={48}
                    />
                    <Tooltip formatter={(value) => formatCOP(Number(value))} />
                    <Legend />
                    <Bar
                      dataKey="income"
                      fill="#d9a928"
                      name="Ingresos"
                      radius={[5, 5, 0, 0]}
                    />
                    <Bar
                      dataKey="expenses"
                      fill="#315f92"
                      name="Egresos"
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <FileClock className="text-amber-700" size={19} />
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Facturas próximas a vencer
                  </h2>
                  <p className="text-sm text-slate-500">
                    Recordatorios de cartera
                  </p>
                </div>
              </div>
              <ul className="divide-y divide-slate-100">
                {upcomingInvoiceReminders.map((invoice) => (
                  <li
                    className="flex items-start justify-between gap-3 py-3"
                    key={invoice.code}
                  >
                    <div className="min-w-0">
                      <strong className="block truncate text-sm text-slate-800">
                        {invoice.client}
                      </strong>
                      <span className="text-xs text-slate-500">
                        {invoice.code} · vence en {invoice.days} días
                      </span>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-slate-700">
                      {formatCOP(invoice.amount)}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-800 hover:text-amber-700"
                to="/billing"
              >
                Abrir facturación <ArrowUpRight size={15} />
              </Link>
            </article>
          </section>
        </>
      )}
    </div>
  )
}
