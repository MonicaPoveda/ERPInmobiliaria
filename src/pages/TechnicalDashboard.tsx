import { useMemo, useState } from "react"

import {
  Activity,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  LifeBuoy,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react"

import { useNavigate } from "react-router"

import {
  activeSupportSessions,
  initialItEvents,
  initialSupportTickets,
  type ItEvent,
  type ItEventStatus,
  type SupportTicket,
} from "../data/itMock"

import { useApp } from "../state/AppContext"

import { Badge, Button, Input, Select } from "../components/ui"

const severityTone: Record<ItEvent["severity"], "danger" | "warning" | "success"> =
  {
    Alta: "danger",

    Media: "warning",

    Baja: "success",
  }

const eventStatusTone: Record<ItEventStatus, "warning" | "success"> = {
  Pendiente: "warning",

  Resuelto: "success",
}

export default function TechnicalDashboard() {
  const { user, notify } = useApp()

  const navigate = useNavigate()

  const [events, setEvents] = useState(initialItEvents)

  const [tickets, setTickets] = useState(initialSupportTickets)

  const [query, setQuery] = useState("")

  const [statusFilter, setStatusFilter] = useState("Todos")

  const failedAttempts = events.filter(
    (event) =>
      event.category === "login_failure" || event.category === "access_denied",
  ).length

  const pendingTickets = tickets.filter(
    (ticket) => ticket.status === "Pendiente",
  ).length

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        const matchesStatus =
          statusFilter === "Todos" || event.status === statusFilter

        const search = query.trim().toLocaleLowerCase()

        const matchesQuery =
          !search ||
          [event.event, event.user, event.severity, event.status]

            .join(" ")

            .toLocaleLowerCase()

            .includes(search)

        return matchesStatus && matchesQuery
      }),

    [events, query, statusFilter],
  )

  const resolveEvent = (id: string) => {
    setEvents((current) =>
      current.map((event) =>
        event.id === id ? { ...event, status: "Resuelto" } : event,
      ),
    )

    notify("Evento marcado como resuelto.", "success")
  }

  const advanceTicket = (ticket: SupportTicket) => {
    const nextStatus = ticket.status === "Pendiente" ? "En gestión" : "Resuelto"

    setTickets((current) =>
      current.map((item) =>
        item.id === ticket.id ? { ...item, status: nextStatus } : item,
      ),
    )

    notify(
      nextStatus === "Resuelto"
        ? "Ticket marcado como resuelto."
        : "Ticket asignado a soporte TI.",

      "success",
    )
  }

  if (!user) return null

  return (
    <div className="dashboard-page it-dashboard">
      <section className="it-dashboard__hero">
        <div className="it-dashboard__hero-copy">
          <span className="it-dashboard__eyebrow">
            <ShieldCheck size={15} />
            OPERACIONES DE INFRAESTRUCTURA
          </span>
          <h1>Centro de Control Técnico</h1>
          <p>Seguridad, sesiones y solicitudes de soporte de Vesta ERP.</p>
        </div>
        <div className="it-dashboard__hero-meta">
          <Badge tone="admin">SYSADMIN</Badge>
          <span>
            <span className="it-status-dot" />
            Consola segura
          </span>
        </div>
      </section>

      <section aria-label="Indicadores técnicos" className="it-metrics">
        <article className="it-metric-card">
          <div className="it-metric-card__top">
            <span>Servidor / sistema</span>
            <span className="it-metric-icon it-metric-icon--green">
              <Server aria-hidden="true" size={20} />
            </span>
          </div>
          <strong className="it-metric-card__status">Operativo</strong>
          <div className="it-metric-card__foot">
            <span className="it-status-dot" />
            99.9% uptime · Todos los servicios activos
          </div>
        </article>

        <article className="it-metric-card">
          <div className="it-metric-card__top">
            <span>Sesiones activas</span>
            <span className="it-metric-icon it-metric-icon--blue">
              <Users aria-hidden="true" size={20} />
            </span>
          </div>
          <strong>{activeSupportSessions.length}</strong>
          <div className="it-metric-card__foot">
            <Activity aria-hidden="true" size={14} />
            Usuarios conectados ahora
          </div>
        </article>

        <article className="it-metric-card">
          <div className="it-metric-card__top">
            <span>Alertas de seguridad</span>
            <span className="it-metric-icon it-metric-icon--red">
              <ShieldAlert aria-hidden="true" size={20} />
            </span>
          </div>
          <strong>{failedAttempts}</strong>
          <div className="it-metric-card__foot">
            <CircleAlert aria-hidden="true" size={14} />
            Accesos fallidos o denegados
          </div>
        </article>

        <article className="it-metric-card">
          <div className="it-metric-card__top">
            <span>Tickets de soporte</span>
            <span className="it-metric-icon it-metric-icon--gold">
              <Ticket aria-hidden="true" size={20} />
            </span>
          </div>
          <strong>{pendingTickets}</strong>
          <div className="it-metric-card__foot">
            <LifeBuoy aria-hidden="true" size={14} />
            Solicitudes pendientes
          </div>
        </article>
      </section>

      <section className="it-dashboard__body">
        <article className="data-card it-events-card">
          <div className="it-section-heading">
            <div>
              <span className="it-dashboard__eyebrow">
                <ShieldAlert size={14} />
                MONITOREO Y AUDITORÍA
              </span>
              <h2>Alertas y eventos recientes</h2>
              <p>Registro técnico simulado de actividad del sistema.</p>
            </div>
            <Button onClick={() => navigate("/security")} variant="secondary">
              Seguridad <ArrowUpRight aria-hidden="true" size={15} />
            </Button>
          </div>

          <div className="it-event-toolbar">
            <Input
              aria-label="Buscar eventos"
              label="Buscar eventos"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Evento o usuario..."
              value={query}
            />
            <Select
              label="Estado"
              onChange={(event) => setStatusFilter(event.target.value)}
              options={["Todos", "Pendiente", "Resuelto"]}
              value={statusFilter}
            />
            <span className="it-event-count">
              {filteredEvents.length} eventos
            </span>
          </div>

          <div className="table-scroll">
            <table className="it-event-table">
              <thead>
                <tr>
                  <th>Fecha / hora</th>
                  <th>Evento</th>
                  <th>Usuario implicado</th>
                  <th>Severidad</th>
                  <th>Estado</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <span className="it-event-date">
                        {new Date(event.occurredAt).toLocaleDateString(
                          "es-CO",

                          { day: "2-digit", month: "short" },
                        )}
                      </span>
                      <small>
                        {new Date(event.occurredAt).toLocaleTimeString(
                          "es-CO",

                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </small>
                    </td>
                    <td>
                      <span className="it-event-name">{event.event}</span>
                    </td>
                    <td>{event.user}</td>
                    <td>
                      <Badge tone={severityTone[event.severity]}>
                        {event.severity}
                      </Badge>
                    </td>
                    <td>
                      <Badge tone={eventStatusTone[event.status]}>
                        {event.status}
                      </Badge>
                    </td>
                    <td>
                      {event.status === "Pendiente" ? (
                        <Button
                          aria-label={`Resolver evento: ${event.event}`}
                          className="it-resolve-button"
                          onClick={() => resolveEvent(event.id)}
                          title="Marcar como resuelto"
                          variant="ghost"
                        >
                          <Check aria-hidden="true" size={16} />
                        </Button>
                      ) : (
                        <span className="it-event-resolved">
                          <Check aria-hidden="true" size={14} />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {!filteredEvents.length && (
                  <tr>
                    <td className="it-empty-state" colSpan={6}>
                      <Search aria-hidden="true" size={18} />
                      No hay eventos para los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="it-tickets-card">
          <div className="it-section-heading">
            <div>
              <span className="it-dashboard__eyebrow">
                <LifeBuoy size={14} />
                MESA DE AYUDA
              </span>
              <h2>Comunicados</h2>
            </div>
            <span className="it-ticket-count">{pendingTickets}</span>
          </div>

          <div className="it-ticket-list">
            {tickets.map((ticket) => (
              <article className="it-ticket" key={ticket.id}>
                <div className="it-ticket__meta">
                  <span>{ticket.id}</span>
                  <Badge
                    tone={
                      ticket.status === "Resuelto"
                        ? "success"
                        : ticket.status === "En gestión"
                          ? "neutral"
                          : "warning"
                    }
                  >
                    {ticket.status}
                  </Badge>
                </div>
                <h3>{ticket.subject}</h3>
                <p>{ticket.requester}</p>
                <p className="it-ticket__detail">{ticket.detail}</p>
                <div className="it-ticket__actions">
                  {ticket.status !== "Resuelto" ? (
                    <Button
                      onClick={() => advanceTicket(ticket)}
                      variant="secondary"
                    >
                      {ticket.status === "Pendiente"
                        ? "Atender solicitud"
                        : "Resolver ticket"}
                      <ChevronRight aria-hidden="true" size={15} />
                    </Button>
                  ) : (
                    <span className="it-ticket__resolved">
                      <Check aria-hidden="true" size={14} />
                      Atendido
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="it-tickets-footer">
            <Clock3 aria-hidden="true" size={15} />
            Bandeja de soporte interna · Demo
          </div>
        </aside>
      </section>

      <section aria-label="Sesiones activas" className="it-sessions-strip">
        <div>
          <span className="it-dashboard__eyebrow">
            <Users size={14} />
            SESIONES CONECTADAS
          </span>
          <p>Actividad concurrente de usuarios autenticados.</p>
        </div>
        <div className="it-session-list">
          {activeSupportSessions.slice(0, 4).map((session) => (
            <div className="it-session" key={session.id} title={session.device}>
              <span className="it-status-dot" />
              <span>{session.user}</span>
            </div>
          ))}
          {activeSupportSessions.length > 4 && (
            <span className="it-session-more">
              +{activeSupportSessions.length - 4} más
            </span>
          )}
        </div>
      </section>
    </div>
  )
}
