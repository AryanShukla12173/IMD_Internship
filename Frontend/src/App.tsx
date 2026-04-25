
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import './index.css'
import AuthPage from "./pages/AuthPage"
import Dashboard from "./pages/Dashboard"
import type { JSX } from "react"

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()
  
  if (isLoading) return <div className="flex min-h-svh items-center justify-center"><p className="animate-pulse text-muted-foreground">Loading...</p></div>
  if (!isAuthenticated) return <Navigate to="/auth" state={{ from: location }} replace />
  
  return children
}

const GuestRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) return <div className="flex min-h-svh items-center justify-center"><p className="animate-pulse text-muted-foreground">Loading...</p></div>
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  
  return children
}

// Global array configuration for all routes
const publicRoutes = [
  { path: "/", element: <Navigate to="/auth" replace /> },
  { path: "/auth", element: <AuthPage /> },
]

const protectedRoutes = [
  { path: "/dashboard", element: <Dashboard /> },
  // Easily add more protected components here later:
  // { path: "/profile", element: <Profile /> },
]

function AppRoutes() {
  return (
    <Routes>
      {/* Map through explicitly public/guest routes */}
      {publicRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={<GuestRoute>{route.element}</GuestRoute>} />
      ))}
      
      {/* Map through explicit protected routes */}
      {protectedRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={<ProtectedRoute>{route.element}</ProtectedRoute>} />
      ))}
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}
