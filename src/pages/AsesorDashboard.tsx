import { useState } from "react"

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts"

import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Home,
  Phone,
  Plus,
  Sparkles,
  UsersRound,
} from "lucide-react"

import { useNavigate } from "react-router"

import { Badge, Button } from "../components/ui"
import DashboardState from "../components/DashboardState"
import KpiCard from "../components/KpiCard"

import {
  advisorTasks,
  commercialAdvisors,
  type CommercialTask,
} from "../data/mockCommercial"

import { useApp } from "../state/AppContext"
import useDashboardRecords from "../hooks/useDashboardRecords"

import { formatCOP } from "../core/format"

const modules = ["crm"] as const

export default function AsesorDashboard() {
  const { user, notify } = useApp()

  const navigate = useNavigate()

  const { data, loading, error, reload } = useDashboardRecords(modules)

  const [tasks, setTasks] = useState(advisorTasks)

  const advisor = commercialAdvisors.find((item) => item.name === user?.name)
  const prospects = (data.crm ?? []).filter(
    (record) => record.advisor === user?.name,
  )
  const target = advisor?.target ?? 15_000_000
  const achieved = prospects.reduce(
    (total, prospect) => total + Number(prospect.commission ?? 0),
    0,
  )
  const pipeline = [
    {
      stage: "Contacto",
      count: prospects.filter((prospect) => prospect.stage === "Contacto").length,
      color: "#5271c8",
    },
    {
      stage: "Negociación",
      count: prospects.filter((prospect) => prospect.stage === "Negociación").length,
      color: "#b38a35",
    },
    {
      stage: "Cierre",
      count: prospects.filter((prospect) => prospect.stage === "Cierre").length,
      color: "#17866c",
    },
  ]
  const commissionProgress = [
    { name: "Logrado", value: achieved, color: "#d9a928" },
    { name: "Pendiente", value: Math.max(0, target - achieved), color: "#e8edf5" },
  ]

  const progress = Math.min(
    100,
    Math.round((achieved / target) * 100),
  )

  const toggleTask = (task: CommercialTask) => {
    const done = !task.done

    setTasks((current) =>
      current.map((item) => (item.id === task.id ? { ...item, done } : item)),
    )

    notify(
      done ? "Tarea marcada como realizada." : "Tarea reactivada.",

      done ? "success" : "info",
    )
  }

  if (!user) return null

  return (
    <div className="dashboard-page commercial-dashboard advisor-dashboard">
      <section className="commercial-hero advisor-hero">
        <div>
          <span className="commercial-eyebrow">
            <Sparkles aria-hidden="true" size={15} />
            TU ESPACIO COMERCIAL · VESTA ERP
          </span>
          <h1>¡Vamos por más, {user.name.split(" ")[0]}!</h1>
          <p>
            Tu actividad de hoy y el avance hacia tu meta mensual, todo en un
            solo lugar.
          </p>
        </div>
        <Badge tone="client">Octubre 2026</Badge>
      </section>

      <DashboardState error={error} loading={loading} onRetry={reload} />
      {!loading && !error && (
      <>
      <section aria-label="Resumen personal" className="grid gap-4 md:grid-cols-3">
        <KpiCard accent="gold" detail={`Meta mensual ${formatCOP(target)}`} icon={Sparkles} title="Comisiones alcanzadas" value={formatCOP(achieved)} />
        <KpiCard accent="blue" detail="Asignados a tu usuario" icon={UsersRound} title="Prospectos propios" value={prospects.length} />
        <KpiCard accent="green" detail="Llamadas y visitas por completar" icon={CalendarDays} title="Tareas pendientes" value={tasks.filter((task) => !task.done).length} />
      </section>
      <section className="advisor-personal-grid">
        <article className="data-card advisor-goal-card">
          <div className="commercial-panel__heading">
            <div>
              <span className="commercial-eyebrow">TU META DE COMISIONES</span>
              <h2>El progreso se nota</h2>
            </div>
            <span className="advisor-goal-card__sparkle">
              <Sparkles aria-hidden="true" size={18} />
            </span>
          </div>
          <div className="advisor-goal-content">
            <div aria-label={`${progress}% de la meta de comisiones alcanzada`} className="h-44 w-44 shrink-0" role="img">
              <ResponsiveContainer height="100%" width="100%">
                <PieChart>
                  <Pie data={commissionProgress} dataKey="value" innerRadius={54} outerRadius={77} startAngle={90} endAngle={-270} paddingAngle={1}>
                    {commissionProgress.map((slice) => <Cell fill={slice.color} key={slice.name} />)}
                  </Pie>
                  <Tooltip formatter={(value) => formatCOP(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none -mt-[6.6rem] flex flex-col items-center text-slate-900">
                <strong className="text-2xl font-bold">{progress}%</strong>
                <span className="text-xs text-slate-500">de tu meta</span>
              </div>
            </div>
            <div className="advisor-goal-summary">
              <span>Comisión acumulada</span>
              <strong>{formatCOP(achieved)}</strong>
              <span className="advisor-goal-summary__target">
                Meta mensual: {formatCOP(target)}
              </span>
              <div className="goal-track advisor-goal-track">
                <span style={{ width: `${progress}%` }} />
              </div>
              <small>
                Te faltan {formatCOP(Math.max(0, target - achieved))} para
                alcanzar tu meta.
              </small>
            </div>
          </div>
        </article>

        <article className="data-card advisor-pipeline-card">
          <div className="commercial-panel__heading">
            <div>
              <span className="commercial-eyebrow">PIPELINE PERSONAL</span>
              <h2>Tu embudo de ventas</h2>
            </div>
            <Button
              aria-label="Ver prospectos"
              onClick={() => navigate("/crm")}
              variant="ghost"
            >
              Ver CRM <ArrowRight aria-hidden="true" size={15} />
            </Button>
          </div>
          <div className="h-52 min-w-0">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={pipeline} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <XAxis axisLine={false} dataKey="stage" tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" name="Prospectos" radius={[5, 5, 0, 0]}>
                  {pipeline.map((stage) => <Cell fill={stage.color} key={stage.stage} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="advisor-pipeline-total">
            {pipeline.reduce((total, stage) => total + stage.count, 0)}{" "}
            prospectos activos en tu embudo
          </div>
        </article>
      </section>

      <section aria-label="Accesos rápidos" className="advisor-quick-actions">
        <button
          className="advisor-action-card advisor-action-card--primary"
          onClick={() => navigate("/crm?new=true")}
          type="button"
        >
          <span>
            <Plus aria-hidden="true" size={22} />
          </span>
          <div>
            <strong>Nuevo prospecto</strong>
            <small>Registra una nueva oportunidad</small>
          </div>
          <ArrowRight aria-hidden="true" size={18} />
        </button>
        <button
          className="advisor-action-card"
          onClick={() => navigate("/catalogo")}
          type="button"
        >
          <span>
            <Home aria-hidden="true" size={21} />
          </span>
          <div>
            <strong>Abrir catálogo de inmuebles</strong>
            <small>Encuentra el espacio ideal para tus clientes</small>
          </div>
          <ArrowRight aria-hidden="true" size={18} />
        </button>
      </section>

      <section className="data-card commercial-panel advisor-agenda">
        <div className="commercial-panel__heading">
          <div>
            <span className="commercial-eyebrow">
              <CalendarDays aria-hidden="true" size={14} />
              AGENDA DEL DÍA
            </span>
            <h2>Tus próximas tareas</h2>
            <p>Llamadas y visitas programadas para hoy.</p>
          </div>
          <Badge tone="neutral">
            {tasks.filter((task) => !task.done).length} pendientes
          </Badge>
        </div>
        <div className="advisor-task-list">
          {tasks.map((task) => (
            <article
              className={`advisor-task ${
                task.done ? "advisor-task--done" : ""
              }`}
              key={task.id}
            >
              <span className="advisor-task__time">
                <Clock3 aria-hidden="true" size={15} />
                {task.time}
              </span>
              <span
                className={`advisor-task__kind advisor-task__kind--${
                  task.kind === "Visita" ? "visit" : "call"
                }`}
              >
                {task.kind === "Visita" ? (
                  <Home aria-hidden="true" size={15} />
                ) : (
                  <Phone aria-hidden="true" size={15} />
                )}
                {task.kind}
              </span>
              <div className="advisor-task__detail">
                <strong>{task.prospect}</strong>
                <span>{task.property}</span>
              </div>
              <Button
                aria-label={`${
                  task.done ? "Reactivar" : "Completar"
                } tarea con ${task.prospect}`}
                onClick={() => toggleTask(task)}
                variant={task.done ? "secondary" : "ghost"}
              >
                {task.done ? (
                  <>
                    <Check aria-hidden="true" size={16} />
                    Hecha
                  </>
                ) : (
                  "Marcar hecha"
                )}
              </Button>
            </article>
          ))}
        </div>
      </section>
      </>
      )}
    </div>
  )
}
