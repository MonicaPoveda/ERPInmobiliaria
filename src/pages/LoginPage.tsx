import { useState, type FormEvent } from "react"
import { Navigate, useNavigate } from "react-router"
import type { StaffProfile } from "../core/types"
import { demoUsers } from "../data/seed"
import { useApp } from "../state/AppContext"
import { Button, Input, Modal } from "../components/ui"

function demoUserForProfile(profile: StaffProfile) {
  const user = demoUsers.find((candidate) => candidate.staffProfile === profile)
  if (!user) throw new Error(`No existe usuario demo para el rol ${profile}.`)
  return user
}

const roleDemos = [
  {
    label: "Superadministrador / Gerente de TI",
    detail: "Usuarios, permisos, auditoría y configuración",
    mark: "SA",
    user: demoUsers[0],
  },
  {
    label: "Asesor Comercial",
    detail: "Pipeline personal, prospectos y agenda",
    mark: "AC",
    user: demoUsers[1],
  },
  {
    label: "Director Comercial",
    detail: "Métricas de equipo, reasignación y descuentos",
    mark: "DC",
    user: demoUsers[2],
  },
  {
    label: "Coordinador de Proveedores",
    detail: "Directorio, evaluaciones e historial de servicios",
    mark: "CP",
    user: demoUsers[3],
  },
  {
    label: "Auxiliar Contable / Tesorero",
    detail: "Facturación, recaudos, egresos y flujo de caja",
    mark: "AT",
    user: demoUserForProfile("finance"),
  },
  {
    label: "Analista de Recursos Humanos",
    detail: "Expedientes, novedades y preliquidación",
    mark: "RH",
    user: demoUserForProfile("hr"),
  },
  {
    label: "Jefe de Inventario / Almacenista",
    detail: "Existencias, órdenes de compra y movimientos",
    mark: "IN",
    user: demoUserForProfile("inventory"),
  },
]

export default function LoginPage() {
  const { user, login, verifyOtp, notify } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [selectedRole, setSelectedRole] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [otpOpen, setOtpOpen] = useState(false)
  const [otp, setOtp] = useState("")
  const [forgotOpen, setForgotOpen] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState("")
  const [recoverySent, setRecoverySent] = useState(false)
  if (user) return <Navigate replace to="/dashboard" />

  const selectDemo = (index: number) => {
    const demo = roleDemos[index]
    if (!demo) return
    setEmail(demo.user.email)
    setPassword(demo.user.password)
    setSelectedRole(demo.label)
    setError("")
    notify(`Credenciales demo de ${demo.label} cargadas.`, "info")
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError("")
    setLoading(true)
    const result = await login(email, password, remember)
    setLoading(false)
    if (!result.ok)
      return setError(result.error ?? "No fue posible iniciar sesión.")
    if (result.otpRequired) {
      setOtpOpen(true)
      notify("Código OTP demo enviado. Use 258963.", "info")
      return
    }
    notify("Bienvenido a Arias Empire.", "success")
    navigate("/")
  }

  const submitOtp = async () => {
    setLoading(true)
    const result = await verifyOtp(otp)
    setLoading(false)
    if (!result.ok) return setError(result.error ?? "Código inválido")
    setOtpOpen(false)
    notify("Identidad verificada correctamente.", "success")
    navigate("/")
  }

  const recover = (event: FormEvent) => {
    event.preventDefault()
    if (!recoveryEmail.includes("@")) return
    setRecoverySent(true)
    notify("Correo de recuperación simulado enviado.", "success")
  }

  return (
    <main className="login-page">
      <section className="login-hero">
        <div>
          <span className="brand-dot" />
          ARIAS EMPIRE ASSET MANAGEMENT
        </div>
        <p>PLATAFORMA ERP CORE V4.8</p>
        <h1>
          Seguridad &<br />
          Gobernanza
          <br />
          Financiera
        </h1>
        <p>
          Portal institucional de control fiduciario, valoración de activos
          inmobiliarios y administración de cartera corporativa.
        </p>
        <div className="login-hero__asset">
          <small>SEDE CENTRAL EL POBLADO</small>
          <strong>Torre Arias Financial Park</strong>
          <span>ACTIVO AAA</span>
        </div>
        <div className="security-strip">
          <span>Cifrado Militar 256-bit</span>
          <span>Habeas Data · Ley 1581</span>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-wordmark">
          ARIAS
          <br />
          EMPIRE
        </div>
        <div className="role-picker">
          <div className="section-heading">
            <span>ACCESO ASISTIDO</span>
            <h2>Seleccionar rol de acceso</h2>
          </div>
          <div className="role-selection">
            <label className="ui-field" htmlFor="login-role">
              <span>Rol de acceso</span>
              <select
                id="login-role"
                onChange={(event) => {
                  const index = roleDemos.findIndex(
                    (demo) => demo.label === event.target.value,
                  )
                  if (index >= 0) selectDemo(index)
                  else {
                    setSelectedRole("")
                    setEmail("")
                    setPassword("")
                  }
                }}
                value={selectedRole}
              >
                <option value="">Seleccione el rol con el que va a ingresar</option>
                {roleDemos.map((demo) => (
                  <option key={demo.label} value={demo.label}>
                    {demo.label}
                  </option>
                ))}
              </select>
            </label>
            {selectedRole && (
              <div className="role-selection__detail">
                <span className="role-card__mark">
                  {roleDemos.find((demo) => demo.label === selectedRole)?.mark}
                </span>
                <div>
                  <strong>{selectedRole}</strong>
                  <p>
                    {
                      roleDemos.find((demo) => demo.label === selectedRole)
                        ?.detail
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        <form className="login-form" onSubmit={submit}>
          <div className="section-heading">
            <span>INICIAR SESIÓN SEGURA</span>
            <h2>Ingrese sus credenciales registradas</h2>
          </div>
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          <Input
            autoComplete="email"
            label="Correo corporativo o cédula / NIT"
            onChange={(event) => setEmail(event.target.value)}
            value={email}
          />
          <Input
            autoComplete="current-password"
            label="Contraseña institucional"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
          <div className="form-options">
            <label>
              <input
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                type="checkbox"
              />
              Recordar sesión
            </label>
            <Button
              onClick={() => setForgotOpen(true)}
              type="button"
              variant="ghost"
            >
              ¿Olvidó su contraseña?
            </Button>
          </div>
          <Button disabled={loading} type="submit">
            {loading ? "Validando credenciales..." : "Ingresar de forma segura"}
          </Button>
          <p className="demo-note">
            Modo demostración: seleccione un rol para cargar sus credenciales.
          </p>
        </form>
      </section>
      {otpOpen && (
        <Modal
          footer={
            <>
              <Button onClick={() => setOtpOpen(false)} variant="secondary">
                Cancelar
              </Button>
              <Button
                disabled={loading || otp.length !== 6}
                onClick={submitOtp}
              >
                {loading ? "Verificando..." : "Verificar OTP"}
              </Button>
            </>
          }
          onClose={() => setOtpOpen(false)}
          title="Verificación de doble factor"
        >
          <p>
            Ingrese el código enviado al dispositivo del administrador. Código
            demo: <strong>258963</strong>.
          </p>
          <Input
            inputMode="numeric"
            label="Código OTP"
            maxLength={6}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
            value={otp}
          />
        </Modal>
      )}
      {forgotOpen && (
        <Modal
          onClose={() => {
            setForgotOpen(false)
            setRecoverySent(false)
          }}
          title="Recuperar contraseña"
        >
          {recoverySent ? (
            <div className="success-state">
              <strong>Revise su correo</strong>
              <p>Enviamos un enlace simulado a {recoveryEmail}.</p>
              <Button
                onClick={() => {
                  setForgotOpen(false)
                  setRecoverySent(false)
                }}
              >
                Volver al login
              </Button>
            </div>
          ) : (
            <form className="stack" onSubmit={recover}>
              <p>Escriba el correo asociado a la cuenta.</p>
              <Input
                label="Correo de recuperación"
                onChange={(event) => setRecoveryEmail(event.target.value)}
                required
                type="email"
                value={recoveryEmail}
              />
              <Button type="submit">Enviar enlace de recuperación</Button>
            </form>
          )}
        </Modal>
      )}
    </main>
  )
}
