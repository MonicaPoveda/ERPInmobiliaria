import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import type { ModuleId, Role, User } from "../core/types"
import { permissionMatrix } from "../core/permissions"
import { repository } from "../data/repository"

interface ToastMessage {
  id: string
  tone: "success" | "error" | "warning" | "info"
  message: string
}

interface LoginResult {
  ok: boolean
  error?: string
  otpRequired?: boolean
}

interface AppState {
  user: User | null
  pendingUser: User | null
  toasts: ToastMessage[]
  sessionWarning: boolean
  login: (
    email: string,
    password: string,
    remember: boolean,
  ) => Promise<LoginResult>
  verifyOtp: (otp: string) => Promise<LoginResult>
  logout: () => void
  extendSession: () => void
  notify: (message: string, tone?: ToastMessage["tone"]) => void
  removeToast: (id: string) => void
}

const AppContext = createContext<AppState | null>(null)
const SESSION_KEY = "arias-session"
const LOCAL_KEY = "arias-session-remembered"
const OTP = "258963"

function storedUser() {
  const saved =
    sessionStorage.getItem(SESSION_KEY) ?? localStorage.getItem(LOCAL_KEY)
  if (!saved) return null
  const parsed = JSON.parse(saved) as { user?: User }
  if (!parsed.user) return null
  return parsed.user.role in permissionMatrix ? parsed.user : null
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(storedUser)
  const [pendingUser, setPendingUser] = useState<User | null>(null)
  const [rememberPending, setRememberPending] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [sessionWarning, setSessionWarning] = useState(false)
  const warningTimer = useRef<number | undefined>(undefined)
  const logoutTimer = useRef<number | undefined>(undefined)

  const notify = useCallback(
    (message: string, tone: ToastMessage["tone"] = "info") => {
      const id = crypto.randomUUID()
      setToasts((items) => [...items, { id, tone, message }])
      window.setTimeout(
        () => setToasts((items) => items.filter((item) => item.id !== id)),
        4500,
      )
    },
    [],
  )

  const removeToast = useCallback(
    (id: string) =>
      setToasts((items) => items.filter((item) => item.id !== id)),
    [],
  )

  const persist = useCallback((nextUser: User, remember: boolean) => {
    const target = remember ? localStorage : sessionStorage
    const other = remember ? sessionStorage : localStorage
    target.setItem(
      remember ? LOCAL_KEY : SESSION_KEY,
      JSON.stringify({ user: nextUser, signedAt: Date.now() }),
    )
    other.removeItem(remember ? SESSION_KEY : LOCAL_KEY)
    setUser(nextUser)
  }, [])

  const login = useCallback(
    async (
      email: string,
      password: string,
      remember: boolean,
    ): Promise<LoginResult> => {
      await new Promise((resolve) => setTimeout(resolve, 700))
      if (!email.trim() || !password.trim())
        return { ok: false, error: "Complete el correo y la contraseña." }
      let directory
      try {
        directory = await repository.getAll("users")
      } catch (error) {
        return {
          ok: false,
          error:
            error instanceof Error
              ? `No fue posible consultar el directorio: ${error.message}`
              : "No fue posible consultar el directorio de usuarios.",
        }
      }
      const account = directory.find(
        (item) =>
          String(item.email).toLowerCase() === email.trim().toLowerCase(),
      )
      const roles = Object.keys(permissionMatrix) as Role[]
      const role =
        typeof account?.role === "string" &&
        roles.includes(account.role as Role)
          ? account.role as Role
          : undefined
      let storedPermissions: ModuleId[] | undefined
      if (typeof account?.modulePermissions === "string") {
        try {
          const parsed = JSON.parse(account.modulePermissions) as unknown
          if (
            !Array.isArray(parsed) ||
            parsed.some(
              (module) =>
                typeof module !== "string" ||
                !(module in permissionMatrix.superAdmin),
            )
          )
            return {
              ok: false,
              error: "Los permisos de esta cuenta no son válidos.",
            }
          storedPermissions = (parsed as ModuleId[])
        } catch {
          return {
            ok: false,
            error: "No fue posible leer los permisos de esta cuenta.",
          }
        }
      }
      const found: User | undefined =
        account && role
          ? {
              id: account.id,
              name: String(account.name ?? ""),
              email: String(account.email ?? ""),
              password: String(account.password ?? ""),
              role,
              active: account.active === true,
              avatar: String(account.avatar ?? "AE"),
              modulePermissions: storedPermissions,
            }
          : undefined
      if (!found || found.password !== password)
        return {
          ok: false,
          error: "Credenciales inválidas. Revise el correo y la contraseña.",
        }
      if (!found.active)
        return {
          ok: false,
          error: "Esta cuenta está inactiva. Contacte al administrador.",
        }
      if (found.role === "superAdmin") {
        setPendingUser(found)
        setRememberPending(remember)
        return { ok: true, otpRequired: true }
      }
      persist(found, remember)
      return { ok: true }
    },
    [persist],
  )

  const verifyOtp = useCallback(
    async (otp: string): Promise<LoginResult> => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      if (!pendingUser)
        return {
          ok: false,
          error: "La verificación expiró. Inicie sesión nuevamente.",
        }
      if (otp !== OTP)
        return {
          ok: false,
          error: "Código OTP inválido. En demostración use 258963.",
        }
      persist(pendingUser, rememberPending)
      setPendingUser(null)
      return { ok: true }
    },
    [pendingUser, persist, rememberPending],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(LOCAL_KEY)
    sessionStorage.removeItem(SESSION_KEY)
    setUser(null)
    setPendingUser(null)
    setSessionWarning(false)
  }, [])

  const resetTimers = useCallback(() => {
    if (!user) return
    window.clearTimeout(warningTimer.current)
    window.clearTimeout(logoutTimer.current)
    setSessionWarning(false)
    warningTimer.current = window.setTimeout(
      () => setSessionWarning(true),
      13 * 60 * 1000,
    )
    logoutTimer.current = window.setTimeout(
      () => {
        logout()
        notify("La sesión se cerró por inactividad.", "warning")
      },
      15 * 60 * 1000,
    )
  }, [logout, notify, user])

  useEffect(() => {
    if (!user) return
    const events = ["click", "keydown", "mousemove", "touchstart"]
    events.forEach((event) =>
      window.addEventListener(event, resetTimers, { passive: true }),
    )
    resetTimers()
    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimers))
      window.clearTimeout(warningTimer.current)
      window.clearTimeout(logoutTimer.current)
    }
  }, [resetTimers, user])

  const value = useMemo(
    () => ({
      user,
      pendingUser,
      toasts,
      sessionWarning,
      login,
      verifyOtp,
      logout,
      extendSession: resetTimers,
      notify,
      removeToast,
    }),
    [
      user,
      pendingUser,
      toasts,
      sessionWarning,
      login,
      verifyOtp,
      logout,
      resetTimers,
      notify,
      removeToast,
    ],
  )
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const value = useContext(AppContext)
  if (!value) throw new Error("useApp must be used inside AppProvider")
  return value
}

export const demoOtp = OTP
