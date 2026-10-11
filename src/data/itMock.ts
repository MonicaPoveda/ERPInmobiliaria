export type ItSeverity = "Alta" | "Media" | "Baja"

export type ItEventStatus = "Pendiente" | "Resuelto"

export interface ItEvent {
  id: string

  occurredAt: string

  event: string

  user: string

  severity: ItSeverity

  status: ItEventStatus

  category: "login_failure" | "access_denied" | "network" | "permission" | "ticket"
}

export interface SupportTicket {
  id: string

  subject: string

  requester: string

  detail: string

  status: "Pendiente" | "En gestión" | "Resuelto"
}

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString()

export const activeSupportSessions = [
  { id: "ses-1", user: "Fernando Arias", device: "Windows · Chrome" },

  { id: "ses-2", user: "Valentina Ríos", device: "macOS · Safari" },

  { id: "ses-3", user: "Laura Restrepo", device: "Windows · Edge" },

  { id: "ses-4", user: "Mateo Holguín", device: "Windows · Chrome" },

  { id: "ses-5", user: "Sofía Echeverry", device: "iOS · Safari" },

  { id: "ses-6", user: "Andrés Pardo", device: "Android · Chrome" },
]

export const initialItEvents: ItEvent[] = [
  {
    id: "it-001",

    occurredAt: minutesAgo(4),

    event: "Intento de acceso bloqueado · IP 185.***.***.42",

    user: "Dirección IP externa",

    severity: "Alta",

    status: "Pendiente",

    category: "access_denied",
  },

  {
    id: "it-002",

    occurredAt: minutesAgo(12),

    event: "Intento de inicio de sesión fallido",

    user: "cuenta.inexistente@ariasempire.com",

    severity: "Media",

    status: "Pendiente",

    category: "login_failure",
  },

  {
    id: "it-003",

    occurredAt: minutesAgo(28),

    event: "Cambio de permiso de acceso",

    user: "Fernando Arias",

    severity: "Media",

    status: "Resuelto",

    category: "permission",
  },

  {
    id: "it-004",

    occurredAt: minutesAgo(43),

    event: "Ticket nuevo · Alta de cuenta de asesor",

    user: "Camilo Restrepo",

    severity: "Baja",

    status: "Pendiente",

    category: "ticket",
  },

  {
    id: "it-005",

    occurredAt: minutesAgo(67),

    event: "Latencia elevada en el servicio de red",

    user: "Monitor de infraestructura",

    severity: "Media",

    status: "Resuelto",

    category: "network",
  },

  {
    id: "it-006",

    occurredAt: minutesAgo(91),

    event: "Segundo intento de acceso denegado",

    user: "Dirección IP 185.***.***.42",

    severity: "Alta",

    status: "Pendiente",

    category: "access_denied",
  },

  {
    id: "it-007",

    occurredAt: minutesAgo(133),

    event: "Intento de inicio de sesión fallido",

    user: "cuenta.inexistente@ariasempire.com",

    severity: "Baja",

    status: "Resuelto",

    category: "login_failure",
  },
]

export const initialSupportTickets: SupportTicket[] = [
  {
    id: "SUP-204",

    subject: "Creación de cuenta para nuevo asesor",

    requester: "Camilo Restrepo · Director Comercial",

    detail: "Alta de usuario y asignación del perfil Asesor Comercial.",

    status: "Pendiente",
  },

  {
    id: "SUP-203",

    subject: "Restablecimiento de contraseña",

    requester: "Mateo Holguín · Recursos Humanos",

    detail: "El usuario no puede completar el inicio de sesión.",

    status: "Pendiente",
  },

  {
    id: "SUP-202",

    subject: "Acceso a la aplicación móvil",

    requester: "Sofía Echeverry · Tesorería",

    detail: "Verificar acceso desde el dispositivo corporativo.",

    status: "Pendiente",
  },
]
