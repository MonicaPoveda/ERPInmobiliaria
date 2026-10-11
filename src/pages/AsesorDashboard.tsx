import { useMemo, useState } from "react"

import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Home,
  Phone,
  Plus,
  Sparkles,
} from "lucide-react"

import { useNavigate } from "react-router"

import { Badge, Button } from "../components/ui"

import {
  advisorPipeline,
  advisorTasks,
  commercialAdvisors,
  type CommercialTask,
} from "../data/mockCommercial"

import { useApp } from "../state/AppContext"

const money = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",

    currency: "COP",

    maximumFractionDigits: 0,
  }).format(value)

export default function AsesorDashboard() {
  const { user, notify } = useApp()

  const navigate = useNavigate()

  const [tasks, setTasks] = useState(advisorTasks)

  const advisor = useMemo(
    () =>
      commercialAdvisors.find((item) => item.name === user?.name) ??
      commercialAdvisors[0],

    [user?.name],
  )

  const progress = Math.min(
    100,

    Math.round((advisor.achieved / advisor.target) * 100),
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
            <div
              aria-label={`${progress}% de la meta de comisiones alcanzada`}
              className="commission-donut"
              role="img"
              style={{
                background: `conic-gradient(var(--gold) 0 ${progress}%, #e8edf5 ${progress}% 100%)`,
              }}
            >
              <div>
                <strong>{progress}%</strong>
                <span>de tu meta</span>
              </div>
            </div>
            <div className="advisor-goal-summary">
              <span>Comisión acumulada</span>
              <strong>{money(advisor.achieved)}</strong>
              <span className="advisor-goal-summary__target">
                Meta mensual: {money(advisor.target)}
              </span>
              <div className="goal-track advisor-goal-track">
                <span style={{ width: `${progress}%` }} />
              </div>
              <small>
                Te faltan {money(advisor.target - advisor.achieved)} para
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
          <div className="advisor-pipeline-list">
            {advisorPipeline.map((stage) => (
              <div className="advisor-pipeline-stage" key={stage.stage}>
                <div className="advisor-pipeline-stage__label">
                  <span>
                    <i style={{ background: stage.color }} />
                    {stage.stage}
                  </span>
                  <strong>{stage.count}</strong>
                </div>
                <div className="advisor-pipeline-track">
                  <span
                    style={{
                      background: stage.color,

                      width: `${(stage.count / advisorPipeline[0].count) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="advisor-pipeline-total">
            {advisorPipeline.reduce((total, stage) => total + stage.count, 0)}{" "}
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
    </div>
  )
}
