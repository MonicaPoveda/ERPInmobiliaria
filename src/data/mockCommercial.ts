export interface CommercialAdvisor {
  id: string

  name: string

  avatar: string

  target: number

  closedDeals: number

  lostDeals: number

  achieved: number
}

export interface MonthlySales {
  month: string

  sales: number
}

export interface PipelineOpportunity {
  id: string

  property: string

  value: number

  stage: "Contacto" | "Visita" | "Negociación"
}

export interface DiscountApproval {
  id: string

  advisor: string

  property: string

  discount: number

  requestedAt: string

  status: "Pendiente" | "Aprobada" | "Rechazada"
}

export interface CommercialTask {
  id: string

  time: string

  kind: "Llamada" | "Visita"

  prospect: string

  property: string

  done: boolean
}

export interface PropertyListing {
  id: string

  title: string

  type: "Apartamento" | "Casa" | "Oficina" | "Lote"

  operation: "Venta" | "Arriendo"

  price: number

  location: string

  bedrooms: number

  bathrooms: number

  area: number

  image: string

  description: string
}

export const commercialAdvisors: CommercialAdvisor[] = [
  {
    id: "adv-1",

    name: "Valentina Ríos",

    avatar: "VR",

    target: 18_000_000,

    closedDeals: 8,

    lostDeals: 2,

    achieved: 15_300_000,
  },

  {
    id: "adv-2",

    name: "Juan Pérez",

    avatar: "JP",

    target: 16_000_000,

    closedDeals: 6,

    lostDeals: 3,

    achieved: 12_800_000,
  },

  {
    id: "adv-3",

    name: "Catalina Morales",

    avatar: "CM",

    target: 16_000_000,

    closedDeals: 5,

    lostDeals: 4,

    achieved: 9_100_000,
  },

  {
    id: "adv-4",

    name: "Andrés Pardo",

    avatar: "AP",

    target: 14_000_000,

    closedDeals: 3,

    lostDeals: 5,

    achieved: 5_600_000,
  },
]

export const monthlySales: MonthlySales[] = [
  { month: "Septiembre", sales: 845 },

  { month: "Octubre", sales: 920 },
]

export const pipelineOpportunities: PipelineOpportunity[] = [
  {
    id: "deal-1",

    property: "Casa Campestre El Poblado",

    value: 1_280_000_000,

    stage: "Negociación",
  },

  {
    id: "deal-2",

    property: "Penthouse Reserva del Río",

    value: 890_000_000,

    stage: "Negociación",
  },

  {
    id: "deal-3",

    property: "Oficina Prime Ciudad del Río",

    value: 620_000_000,

    stage: "Negociación",
  },

  {
    id: "deal-4",

    property: "Villa Serena",

    value: 1_560_000_000,

    stage: "Visita",
  },

  {
    id: "deal-5",

    property: "Apartamento Loma Verde",

    value: 680_000_000,

    stage: "Contacto",
  },
]

export const initialDiscountApprovals: DiscountApproval[] = [
  {
    id: "discount-1",

    advisor: "Juan Pérez",

    property: "Casa Campestre El Poblado",

    discount: 5,

    requestedAt: "Hoy · 09:42",

    status: "Pendiente",
  },

  {
    id: "discount-2",

    advisor: "Catalina Morales",

    property: "Penthouse Reserva del Río",

    discount: 3,

    requestedAt: "Hoy · 10:18",

    status: "Pendiente",
  },

  {
    id: "discount-3",

    advisor: "Andrés Pardo",

    property: "Oficina Prime Ciudad del Río",

    discount: 4,

    requestedAt: "Ayer · 16:05",

    status: "Pendiente",
  },
]

export const advisorPipeline = [
  { stage: "Contacto", count: 12, color: "#5271c8" },

  { stage: "Visita", count: 7, color: "#b38a35" },

  { stage: "Negociación", count: 4, color: "#17866c" },
]

export const advisorTasks: CommercialTask[] = [
  {
    id: "task-1",

    time: "09:30",

    kind: "Llamada",

    prospect: "Santiago Mejía",

    property: "Apartamento Loma Verde",

    done: false,
  },

  {
    id: "task-2",

    time: "11:00",

    kind: "Visita",

    prospect: "Laura Fernández",

    property: "Casa Campestre El Poblado",

    done: false,
  },

  {
    id: "task-3",

    time: "14:15",

    kind: "Llamada",

    prospect: "Grupo Inversiones del Norte",

    property: "Oficinas Prime Ciudad del Río",

    done: true,
  },

  {
    id: "task-4",

    time: "16:00",

    kind: "Visita",

    prospect: "Mariana Gómez",

    property: "Penthouse Reserva del Río",

    done: false,
  },
]

export const properties: PropertyListing[] = [
  {
    id: "property-1",

    title: "Casa Campestre El Poblado",

    type: "Casa",

    operation: "Venta",

    price: 1_280_000_000,

    location: "El Poblado, Medellín",

    bedrooms: 4,

    bathrooms: 4,

    area: 286,

    image:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=85",

    description:
      "Casa contemporánea con jardín privado, terraza amplia y acabados premium en unidad cerrada.",
  },

  {
    id: "property-2",

    title: "Penthouse Reserva del Río",

    type: "Apartamento",

    operation: "Venta",

    price: 890_000_000,

    location: "Ciudad del Río, Medellín",

    bedrooms: 3,

    bathrooms: 3,

    area: 164,

    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop&q=85",

    description:
      "Penthouse con vista abierta, balcón perimetral y acceso a amenidades de club privado.",
  },

  {
    id: "property-3",

    title: "Apartamento Loma Verde",

    type: "Apartamento",

    operation: "Arriendo",

    price: 6_800_000,

    location: "Los Balsos, Medellín",

    bedrooms: 3,

    bathrooms: 2,

    area: 128,

    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&auto=format&fit=crop&q=85",

    description:
      "Apartamento iluminado con cocina abierta, balcón y dos parqueaderos en zona residencial.",
  },

  {
    id: "property-4",

    title: "Oficina Prime Ciudad del Río",

    type: "Oficina",

    operation: "Arriendo",

    price: 8_400_000,

    location: "Ciudad del Río, Medellín",

    bedrooms: 0,

    bathrooms: 2,

    area: 172,

    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&auto=format&fit=crop&q=85",

    description:
      "Oficina lista para ocupar, con salas de reunión, recepción y parqueaderos privados.",
  },

  {
    id: "property-5",

    title: "Villa Serena",

    type: "Casa",

    operation: "Venta",

    price: 1_560_000_000,

    location: "Llanogrande, Rionegro",

    bedrooms: 5,

    bathrooms: 5,

    area: 342,

    image:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&auto=format&fit=crop&q=85",

    description:
      "Residencia de diseño con amplias zonas verdes, estudio independiente y domótica.",
  },

  {
    id: "property-6",

    title: "Lote Mirador del Valle",

    type: "Lote",

    operation: "Venta",

    price: 680_000_000,

    location: "Alto de Las Palmas, Envigado",

    bedrooms: 0,

    bathrooms: 0,

    area: 1_240,

    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=85",

    description:
      "Lote urbanizado con vista al valle, acceso pavimentado y acometidas disponibles.",
  },
]

export const commercialProspects = [
  "Santiago Mejía",

  "Laura Fernández",

  "Grupo Inversiones del Norte",

  "Mariana Gómez",
]
