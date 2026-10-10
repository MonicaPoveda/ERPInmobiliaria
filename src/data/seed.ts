import type { EntityRecord, ModuleId, User } from "../core/types"

export const demoUsers: User[] = [
  {
    id: "usr-admin",
    name: "Fernando Arias",
    email: "admin@ariasempire.com",
    password: "Admin2025!",
    role: "administrator",
    active: true,
    avatar: "FA",
  },
  {
    id: "usr-commercial",
    name: "Valentina Ríos",
    email: "asesor@ariasempire.com",
    password: "Asesor2025!",
    role: "staff",
    staffProfile: "commercial",
    active: true,
    avatar: "VR",
  },
  {
    id: "usr-sales-director",
    name: "Laura Cárdenas",
    email: "director.comercial@ariasempire.com",
    password: "Director2025!",
    role: "staff",
    staffProfile: "salesDirector",
    active: true,
    avatar: "LC",
  },
  {
    id: "usr-providers",
    name: "Andrés Ospina",
    email: "proveedores@ariasempire.com",
    password: "Proveedores2025!",
    role: "staff",
    staffProfile: "providers",
    active: true,
    avatar: "AO",
  },
  {
    id: "usr-hr",
    name: "Mateo Holguín",
    email: "talento@ariasempire.com",
    password: "Talento2025!",
    role: "staff",
    staffProfile: "hr",
    active: true,
    avatar: "MH",
  },
  {
    id: "usr-inventory",
    name: "Julián Restrepo",
    email: "inventario@ariasempire.com",
    password: "Inventario2025!",
    role: "staff",
    staffProfile: "inventory",
    active: true,
    avatar: "JR",
  },
  {
    id: "usr-finance",
    name: "Sofía Echeverry",
    email: "financiero@ariasempire.com",
    password: "Finanzas2025!",
    role: "staff",
    staffProfile: "finance",
    active: true,
    avatar: "SE",
  },
  {
    id: "usr-client",
    name: "Carlos Arturo Mendoza",
    email: "cliente@ariasempire.com",
    password: "Cliente2025!",
    role: "client",
    active: true,
    avatar: "CM",
  },
  {
    id: "usr-inactive",
    name: "Usuario Inactivo",
    email: "inactivo@ariasempire.com",
    password: "Inactivo2025!",
    role: "staff",
    staffProfile: "commercial",
    active: false,
    avatar: "UI",
  },
]

const now = new Date().toISOString()
const clients = [
  "Carlos Arturo Mendoza",
  "Grupo Gómez & Cía",
  "Inversiones Mineras del Pacífico",
  "Transportes Andina Corp",
  "Desarrollos Hoteleros San Jerónimo",
]
const assets = [
  "Penthouse Skyview Rosales",
  "Complejo Logístico Sabaneta",
  "Toyota Prado TX-L",
  "Oficinas Prime Calle 72",
  "Flota Chevrolet Tahoe",
]
const people = [
  "Valentina Ríos",
  "Camilo Restrepo",
  "Andrés Pardo",
  "Catalina Morales",
  "Mateo Holguín",
  "Sofía Echeverry",
]

function records(
  count: number,
  factory: (index: number) => Record<string, string | number | boolean>,
): EntityRecord[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `rec-${index + 1}`,
    createdAt: now,
    updatedAt: now,
    ...factory(index),
  }))
}

export function createSeedData(): Record<string, EntityRecord[]> {
  return {
    inventory: records(36, (i) => ({
      code: `${
        i % 3 === 0 ? "VEH" : "INM"
      }-2024-${String(i + 1).padStart(2, "0")}`,
      name: assets[i % assets.length],
      type: i % 3 === 0 ? "Vehículo" : "Inmueble",
      image: "/assets/2e7dc.png",
      status:
        i % 4 === 0
          ? "Arrendado"
          : i % 5 === 0
            ? "Mantenimiento"
            : "Disponible",
      value: 8900000 + i * 1250000,
      owner: clients[i % clients.length],
      stock: i % 6 === 0 ? 2 : 12 + (i % 18),
      minimumStock: 5,
      location: ["Bodega central", "Sede Medellín", "Sede Bogotá"][i % 3],
      movement: i % 2 === 0 ? "Entrada por compra" : "Salida a proyecto",
      purchaseOrder: `OC-${String(310 + i).padStart(4, "0")}`,
    })),
    crm: records(34, (i) => ({
      name: clients[i % clients.length],
      email:
        i === 0 ? "cliente@ariasempire.com" : `contacto${i + 1}@empresa.com`,
      phone: `300${String(5000000 + i * 317).slice(0, 7)}`,
      stage: [
        "Contacto Inicial",
        "Calificado",
        "Negociación",
        "Cierre Ganado",
      ][i % 4],
      advisor: i < 8 ? "Valentina Ríos" : people[i % 3],
      active: true,
    })),
    contracts: records(32, (i) => ({
      code: `CT-2024-${String(i + 1).padStart(3, "0")}`,
      client: clients[i % clients.length],
      asset: assets[i % assets.length],
      status: i % 4 === 0 ? "Firmado" : i % 3 === 0 ? "Borrador" : "Activo",
      value: 12500000 + i * 450000,
      dueDate: `2025-${String((i % 9) + 1).padStart(2, "0")}-15`,
    })),
    people: records(35, (i) => ({
      code: `EMP-${String(i + 1).padStart(3, "0")}`,
      name: `${people[i % people.length]} ${i > 5 ? i + 1 : ""}`.trim(),
      position: [
        "Asesor Comercial",
        "Analista Jurídico",
        "Analista Financiero",
        "Coordinador Operativo",
      ][i % 4],
      status: "Activo",
      salary: 3200000 + i * 90000,
      payroll: "Incluido",
      healthFund: ["Sura EPS", "Sanitas EPS", "Nueva EPS"][i % 3],
      riskFund: ["SURA ARL", "Colmena ARL"][i % 2],
      contractStatus: i % 4 === 0 ? "Por vencer" : "Vigente",
      leaveRequest: i % 5 === 0 ? "Pendiente" : "Sin solicitud",
    })),
    billing: records(38, (i) => ({
      code: `FE-2024-${1082 + i}`,
      client: clients[i % clients.length],
      concept: [
        "Canon de arrendamiento",
        "Comisión comercial",
        "Servicios fiduciarios",
      ][i % 3],
      status: i % 4 === 0 ? "Pagada" : i % 5 === 0 ? "En mora" : "Pendiente",
      value: 9800000 + i * 325000,
      vat: Math.round((9800000 + i * 325000) * 0.19),
      withholding: Math.round((9800000 + i * 325000) * 0.035),
      paidAmount: i % 4 === 0 ? 9800000 + i * 325000 : 0,
      dueDate: `2025-${String((i % 9) + 1).padStart(2, "0")}-20`,
    })),
    providers: records(18, (i) => ({
      code: `PROV-${String(i + 1).padStart(3, "0")}`,
      name: [
        "Suministros Andinos S.A.S.",
        "Servicios Integrales del Norte",
        "Tecnología y Oficina S.A.S.",
        "Mantenimiento Urbano Ltda.",
      ][i % 4],
      contact: `Contacto ${i + 1}`,
      email: `proveedor${i + 1}@empresa.com`,
      rut: `900${String(123456 + i * 173).slice(0, 6)}-1`,
      phone: `604${String(3001000 + i * 137).slice(0, 7)}`,
      address: `Calle ${20 + i} # ${10 + (i % 9)}-${i + 1}, Medellín`,
      category: [
        "Mantenimiento inmobiliario",
        "Insumos y materiales",
        "Tecnología",
        "Servicios profesionales",
      ][i % 4],
      services: [
        "Mantenimiento preventivo y reparaciones locativas",
        "Suministro de materiales e insumos",
        "Soporte técnico y equipos",
        "Aseo y adecuación de inmuebles",
      ][i % 4],
      rating: 3 + (i % 3),
      status: i % 5 === 0 ? "Evaluación pendiente" : "Activo",
      lastService: `Servicio ${100 + i}`,
      evaluationNotes: i % 5 === 0 ? "" : "Entrega y calidad conformes.",
    })),
    purchases: records(20, (i) => ({
      code: `SG-${String(i + 1).padStart(3, "0")}`,
      requestedBy: people[i % people.length],
      supplier: [
        "Suministros Andinos S.A.S.",
        "Servicios Integrales del Norte",
        "Tecnología y Oficina S.A.S.",
      ][i % 3],
      concept: ["Insumos de oficina", "Mantenimiento", "Servicios"][i % 3],
      amount: 450000 + i * 215000,
      status: i % 4 === 0 ? "Pendiente de aprobación" : "Aprobado",
      purchaseOrder: `OC-${String(310 + i).padStart(4, "0")}`,
      paymentProof: i % 3 === 0 ? "Pendiente" : "Registrado",
    })),
    portal: records(30, (i) => ({
      code: `SOL-${String(i + 1).padStart(3, "0")}`,
      client: i < 8 ? "Carlos Arturo Mendoza" : clients[i % clients.length],
      type: ["Visita", "Prórroga", "Certificado", "Soporte"][i % 4],
      status: i % 3 === 0 ? "Resuelta" : "En proceso",
      detail: `Solicitud de ${["visita técnica", "prórroga contractual", "certificado tributario", "soporte de pago"][i % 4]}`,
    })),
    security: records(30, (i) => ({
      code: `SEC-${String(i + 1).padStart(3, "0")}`,
      event: [
        "Inicio de sesión",
        "Cambio de permiso",
        "Intento bloqueado",
        "Exportación",
      ][i % 4],
      severity: ["Informativa", "Media", "Alta"][i % 3],
      user: demoUsers[i % demoUsers.length].name,
      status: i % 3 === 0 ? "Revisado" : "Pendiente",
    })),
    users: demoUsers.map((user) => ({
      ...user,
      createdAt: now,
      updatedAt: now,
    })),
  }
}

export const dataModules: ModuleId[] = [
  "inventory",
  "providers",
  "purchases",
  "crm",
  "contracts",
  "people",
  "billing",
  "portal",
  "security",
  "users",
]
