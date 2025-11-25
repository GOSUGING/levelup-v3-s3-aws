import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

export const AuthContext = createContext();

const LS_KEY = "levelup:user";

// ========================
// BASE URL AUTH SERVICE
// ========================
// Debe existir en tu .env como:
// VITE_AUTH_API_URL=http://56.228.34.53:8081/api/auth
const baseURL =
  import.meta.env.VITE_AUTH_API_URL ??
  "http://localhost:8081/api/auth";

// ========================
// HTTP WRAPPER
// ========================
async function http(path, { method = "GET", body, headers = {} } = {}) {
  const res = await fetch(`${baseURL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  // devolver texto si no hay body
  if (res.status === 204) return {};

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`HTTP ${res.status}: ${msg}`);
  }

  return res.json();
}

// ========================
// PROVIDER
// ========================
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Guardar usuario en localStorage
  const persist = (u) => {
    setUser(u);
    localStorage.setItem(LS_KEY, JSON.stringify(u));
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem(LS_KEY);
  };

  // ========================
  // LOGIN
  // ========================
 const login = useCallback(async ({ email, password }) => {
  setLoading(true);
  try {
    const data = await http("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });

    persist(data);
    return data;
  } finally {
    setLoading(false);
  }
}, []);

const register = useCallback(async ({ name, email, password, address, phone, role }) => {
  setLoading(true);
  try {
    const data = await http("/api/auth/register", {
      method: "POST",
      body: { name, email, password, address, phone, role },
    });

    persist(data);
    return data;
  } finally {
    setLoading(false);
  }
}, []);



  // ========================
  // UPDATE PROFILE (opcional)
  // ⚠ usa otro microservicio (users.js)
  // ========================
  const updateProfile = useCallback(async () => {
    throw new Error("updateProfile debe hacerse desde users.js");
  }, []);

  // value del contexto
  const value = useMemo(
    () => ({
      user,
      loading,

      login,
      register,
      logout,
      updateProfile,

      // expongo la URL base para debug
      apiUrl: baseURL,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
