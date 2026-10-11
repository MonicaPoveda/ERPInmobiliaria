import { useMemo, useState } from "react"

import {
  ArrowUpRight,
  Bath,
  BedDouble,
  MapPin,
  Maximize2,
  Search,
  Share2,
} from "lucide-react"

import { Badge, Button, Input, Modal, Select } from "../components/ui"

import {
  commercialProspects,
  properties,
  type PropertyListing,
} from "../data/mockCommercial"

import { useApp } from "../state/AppContext"

const money = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",

    currency: "COP",

    maximumFractionDigits: 0,
  }).format(value)

type CatalogModal =
  | { type: "details"; property: PropertyListing }
  | { type: "share"; property: PropertyListing }
  | null

export default function PropertyCatalog() {
  const { user, notify } = useApp()

  const [query, setQuery] = useState("")

  const [operation, setOperation] = useState("Todos")

  const [priceRange, setPriceRange] = useState("Cualquier precio")

  const [type, setType] = useState("Todos")

  const [modal, setModal] = useState<CatalogModal>(null)

  const [prospect, setProspect] = useState(commercialProspects[0])

  const filteredProperties = useMemo(
    () =>
      properties.filter((property) => {
        const search = query.trim().toLocaleLowerCase()

        const matchesQuery =
          !search ||
          `${property.title} ${property.location}`

            .toLocaleLowerCase()

            .includes(search)

        const matchesOperation =
          operation === "Todos" || property.operation === operation

        const matchesType = type === "Todos" || property.type === type

        const matchesPrice =
          priceRange === "Cualquier precio" ||
          (priceRange === "Hasta $500 M" && property.price <= 500_000_000) ||
          (priceRange === "$500 M - $1.000 M" &&
            property.price > 500_000_000 &&
            property.price <= 1_000_000_000) ||
          (priceRange === "Más de $1.000 M" && property.price > 1_000_000_000)

        return matchesQuery && matchesOperation && matchesType && matchesPrice
      }),

    [operation, priceRange, query, type],
  )

  const shareProperty = () => {
    if (!modal || modal.type !== "share") return

    notify(
      `${modal.property.title} se compartió con ${prospect}.`,

      "success",
    )

    setModal(null)
  }

  if (!user) return null

  return (
    <div className="dashboard-page property-catalog-page">
      <section className="commercial-hero catalog-hero">
        <div>
          <span className="commercial-eyebrow">
            <span className="catalog-hero__mark">V</span>
            PORTAFOLIO VESTA · INMUEBLES SELECCIONADOS
          </span>
          <h1>Catálogo de inmuebles</h1>
          <p>
            Propiedades exclusivas listas para encontrar a su próximo
            propietario o arrendatario.
          </p>
        </div>
        <span className="catalog-hero__count">
          {filteredProperties.length} propiedades
        </span>
      </section>

      <section aria-label="Filtros de propiedades" className="catalog-filters">
        <Input
          aria-label="Buscar propiedad"
          label="Buscar"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nombre o ubicación..."
          value={query}
        />
        <Select
          label="Operación"
          onChange={(event) => setOperation(event.target.value)}
          options={["Todos", "Venta", "Arriendo"]}
          value={operation}
        />
        <Select
          label="Rango de precio"
          onChange={(event) => setPriceRange(event.target.value)}
          options={[
            "Cualquier precio",

            "Hasta $500 M",

            "$500 M - $1.000 M",

            "Más de $1.000 M",
          ]}
          value={priceRange}
        />
        <Select
          label="Tipo de inmueble"
          onChange={(event) => setType(event.target.value)}
          options={["Todos", "Apartamento", "Casa", "Oficina", "Lote"]}
          value={type}
        />
      </section>

      {filteredProperties.length ? (
        <section aria-label="Propiedades disponibles" className="property-grid">
          {filteredProperties.map((property) => (
            <article className="property-card" key={property.id}>
              <div className="property-card__image-wrap">
                <img
                  alt={property.title}
                  className="property-card__image"
                  loading="lazy"
                  src={property.image}
                />
                <Badge
                  tone={property.operation === "Venta" ? "admin" : "client"}
                >
                  {property.operation}
                </Badge>
                <span className="property-card__type">{property.type}</span>
              </div>
              <div className="property-card__body">
                <div className="property-card__heading">
                  <h2>{property.title}</h2>
                  <strong>{money(property.price)}</strong>
                  <span className="property-card__price-note">
                    {property.operation === "Arriendo"
                      ? "mensuales"
                      : "precio de venta"}
                  </span>
                </div>
                <span className="property-card__location">
                  <MapPin aria-hidden="true" size={15} />
                  {property.location}
                </span>
                <div className="property-card__features">
                  {property.bedrooms > 0 && (
                    <span>
                      <BedDouble aria-hidden="true" size={16} />
                      {property.bedrooms} Hab
                    </span>
                  )}
                  {property.bathrooms > 0 && (
                    <span>
                      <Bath aria-hidden="true" size={16} />
                      {property.bathrooms} Baños
                    </span>
                  )}
                  <span>
                    <Maximize2 aria-hidden="true" size={15} />
                    {property.area.toLocaleString("es-CO")} m²
                  </span>
                </div>
                <div className="property-card__actions">
                  <Button
                    onClick={() => setModal({ type: "details", property })}
                    variant="secondary"
                  >
                    Ver detalles
                    <ArrowUpRight aria-hidden="true" size={15} />
                  </Button>
                  <Button
                    onClick={() => setModal({ type: "share", property })}
                    variant="gold"
                  >
                    <Share2 aria-hidden="true" size={15} />
                    Compartir
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="property-empty">
          <Search aria-hidden="true" size={24} />
          <strong>No encontramos propiedades con esos filtros.</strong>
          <span>Prueba otra ubicación, operación o rango de precio.</span>
        </div>
      )}

      {modal?.type === "details" && (
        <Modal
          onClose={() => setModal(null)}
          title={modal.property.title}
          footer={
            <Button
              onClick={() =>
                setModal({ type: "share", property: modal.property })
              }
              variant="gold"
            >
              <Share2 aria-hidden="true" size={16} />
              Compartir con prospecto
            </Button>
          }
        >
          <div className="property-details">
            <img alt={modal.property.title} src={modal.property.image} />
            <div className="property-details__price">
              <strong>{money(modal.property.price)}</strong>
              <Badge
                tone={modal.property.operation === "Venta" ? "admin" : "client"}
              >
                {modal.property.operation}
              </Badge>
            </div>
            <span className="property-card__location">
              <MapPin aria-hidden="true" size={15} />
              {modal.property.location}
            </span>
            <p>{modal.property.description}</p>
            <div className="property-card__features">
              {modal.property.bedrooms > 0 && (
                <span>
                  <BedDouble aria-hidden="true" size={16} />
                  {modal.property.bedrooms} habitaciones
                </span>
              )}
              {modal.property.bathrooms > 0 && (
                <span>
                  <Bath aria-hidden="true" size={16} />
                  {modal.property.bathrooms} baños
                </span>
              )}
              <span>
                <Maximize2 aria-hidden="true" size={15} />
                {modal.property.area.toLocaleString("es-CO")} m²
              </span>
            </div>
          </div>
        </Modal>
      )}

      {modal?.type === "share" && (
        <Modal
          onClose={() => setModal(null)}
          title="Compartir propiedad"
          footer={
            <>
              <Button onClick={() => setModal(null)} variant="secondary">
                Cancelar
              </Button>
              <Button onClick={shareProperty} variant="gold">
                <Share2 aria-hidden="true" size={16} />
                Compartir con prospecto
              </Button>
            </>
          }
        >
          <div className="stack">
            <p>
              Comparte <strong>{modal.property.title}</strong> con un prospecto
              de tu cartera.
            </p>
            <Select
              label="Prospecto"
              onChange={(event) => setProspect(event.target.value)}
              options={commercialProspects}
              value={prospect}
            />
          </div>
        </Modal>
      )}
    </div>
  )
}
