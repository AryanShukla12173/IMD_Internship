import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function AuthPage() {
  const { checkAuth } = useAuth()
  
  const [mode, setMode] = useState<"login" | "register">("login")
  const [loginType, setLoginType] = useState<"user" | "admin">("user")
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: ""
  })
  
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError("")
    setSuccess("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1. Initial validations mimicking the legacy code
    if (!formData.username || !formData.password) {
      setError("Please fill in all fields")
      return
    }

    setSubmitting(true)
    setError("")
    setSuccess("")

    try {
      if (mode === "register") {
        if (loginType === "admin") {
          setError("Admin registration is disabled. Please use User Login to register.")
          setSubmitting(false)
          return
        }
        if (!formData.fullName || !formData.email) {
          setError("Please fill in all fields")
          setSubmitting(false)
          return
        }
        if (formData.password.length < 8) { // Updated to 8 based on previous backend schema
          setError("Password must be at least 8 characters long")
          setSubmitting(false)
          return
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Password and confirm password do not match")
          setSubmitting(false)
          return
        }

        // Register request
        const response = await fetch("/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: formData.fullName,
            email: formData.email,
            password: formData.password,
            role: loginType, 
          }),
        })

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          throw new Error(errData.detail || "Registration failed")
        }

        setSuccess("Registration successful. You can login now.")
        setMode("login")
        setFormData(prev => ({
          ...prev,
          password: "",
          confirmPassword: ""
        }))
      }

      if (mode === "login") {
        // Adjust the payload mapping to backend specs
        const response = await fetch("/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ 
            email: formData.username, // Legacy component used "username", backend needs "email"
            password: formData.password 
          }),
        })
        
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          throw new Error(errData.detail || "Authentication failed")
        }
        
        await checkAuth()
      }
    } catch (apiError: any) {
      setError(apiError.message || "Authentication failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-svh bg-muted/30">
      {/* Header */}
      <header className="bg-primary text-primary-foreground border-b border-primary/20 py-4 px-6 shadow-md z-10 text-center md:text-left">
        <div className="text-xl font-bold tracking-wider">Indian Meteorological Department</div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-10">
        <Card className="w-full max-w-112.5 shadow-xl border-muted rounded-xl bg-card">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-[1.7rem] font-bold tracking-tight text-primary">
            Employee Management System
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col gap-4.5">
            
            {/* Login / Register Toggle inside gray box */}
            <div className="flex p-1 bg-muted rounded-md border border-muted/80 shadow-sm">
              <button
                type="button"
                onClick={() => {
                  setMode("login")
                  setError("")
                  setSuccess("")
                }}
                className={`flex-1 flex items-center justify-center py-2 text-sm font-semibold transition-all rounded-lg ${mode === "login" ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register")
                  setLoginType("user")
                  setError("")
                  setSuccess("")
                  setFormData({ fullName: "", email: "", username: "", password: "", confirmPassword: "" })
                }}
                className={`flex-1 flex items-center justify-center py-2 text-sm font-semibold transition-all rounded-lg ${mode === "register" ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
              >
                Register
              </button>
            </div>

            {/* User / Admin Toggle styled as outline toggles */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setLoginType("user")
                  setError("")
                  setSuccess("")
                  setFormData({ fullName: "", email: "", username: "", password: "", confirmPassword: "" })
                }}
                className={`flex-1 flex items-center justify-center rounded-md border-2 px-4 py-2.5 text-sm font-bold transition-all hover:border-primary/50 hover:bg-muted ${loginType === "user" ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-transparent bg-muted/60 text-muted-foreground"}`}
              >
                User Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginType("admin")
                  setError("")
                  setSuccess("")
                  setMode("login")
                  setFormData({ fullName: "", email: "", username: "", password: "", confirmPassword: "" })
                }}
                className={`flex-1 flex items-center justify-center rounded-md border-2 px-4 py-2.5 text-sm font-bold transition-all hover:border-primary/50 hover:bg-muted ${loginType === "admin" ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-transparent bg-muted/60 text-muted-foreground"}`}
              >
                Admin Login
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
              {mode === "register" && (
                <>
                  <div className="flex flex-col gap-2 relative">
                    <Label htmlFor="fullName" className="text-foreground/80 font-semibold mb-0.5">Full Name</Label>
                    <Input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="bg-background border-muted h-11"
                    />
                  </div>
                  <div className="flex flex-col gap-2 relative">
                    <Label htmlFor="email" className="text-foreground/80 font-semibold mb-0.5">Email</Label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="bg-background border-muted h-11"
                    />
                  </div>
                </>
              )}

              <div className="flex flex-col gap-2 relative">
                <Label htmlFor="username" className="text-foreground/80 font-semibold mb-0.5">Email / Username</Label>
                <Input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder={loginType === "user" ? "Enter username or email" : "Enter admin username"}
                  className="bg-background border-muted h-11"
                />
              </div>

              <div className="flex flex-col gap-2 relative">
                <Label htmlFor="password" className="text-foreground/80 font-semibold mb-0.5">Password</Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="bg-background border-muted h-11"
                />
              </div>

              {mode === "register" && (
                <div className="flex flex-col gap-2 relative">
                  <Label htmlFor="confirmPassword" className="text-foreground/80 font-semibold mb-0.5">Confirm Password</Label>
                  <Input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="bg-background border-muted h-11"
                  />
                </div>
              )}

              {error && <div className="text-sm font-semibold text-destructive mt-1 bg-destructive/10 p-3 rounded-md border-l-4 border-destructive">{error}</div>}
              {success && <div className="text-sm font-semibold text-green-700 mt-1 bg-green-100 p-3 rounded-md border border-green-200 border-l-4">{success}</div>}

              <Button type="submit" className="w-full font-bold h-12 text-[15px] mt-2 shadow-md transition-all active:scale-[0.98]" disabled={submitting}>
                {submitting ? "Please wait..." : mode === "register" ? "Create Account" : `Login as ${loginType === "user" ? "User" : "Admin"}`}
              </Button>
            </form>

            <div className="mt-4 rounded-lg bg-primary/5 p-4 text-[13px] text-muted-foreground border border-primary/20 shadow-inner">
              <h4 className="font-bold text-primary mb-2">Authentication:</h4>
              <p className="mb-1"><strong className="text-primary/90 font-semibold">Register:</strong> Create a new user account saved in DB</p>
              <p><strong className="text-primary/90 font-semibold">Login:</strong> Credentials are verified via backend API</p>
            </div>

          </div>
        </CardContent>
      </Card>
      </main>

      {/* Footer */}
      <footer className="bg-primary/90 text-primary-foreground py-10 mt-auto border-t-[3px] border-primary-foreground/10">
        <div className="container mx-auto px-6 max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 mb-8 text-center md:text-left">
          <div className="flex flex-col gap-2">
              <h3 className="font-bold text-xl tracking-wide border-b border-primary-foreground/20 pb-2 mb-1 inline-block w-fit mx-auto md:mx-0">About Us</h3>
              <p className="text-primary-foreground/80 text-sm font-medium">We provide quality services and solutions.</p>
          </div>

          <div className="flex flex-col gap-2">
              <h3 className="font-bold text-xl tracking-wide border-b border-primary-foreground/20 pb-2 mb-1 inline-block w-fit mx-auto md:mx-0">Address</h3>
              <p className="text-primary-foreground/80 text-sm leading-relaxed font-medium">
                  123, RC Church Road,<br/>
                  Mumbai, Maharashtra,<br/>
                  India - 400001
              </p>
          </div>

          <div className="flex flex-col gap-2">
              <h3 className="font-bold text-xl tracking-wide border-b border-primary-foreground/20 pb-2 mb-1 inline-block w-fit mx-auto md:mx-0">Contact</h3>
              <p className="text-primary-foreground/80 text-sm font-medium"><strong>Email:</strong> info@mywebsite.com</p>
              <p className="text-primary-foreground/80 text-sm font-medium"><strong>Phone:</strong> +91 98765 43210</p>
          </div>
        </div>

        <div className="text-center text-sm border-t border-primary-foreground/20 pt-6 text-primary-foreground/70 font-medium">
            © 2026 MyWebsite | All Rights Reserved
        </div>
      </footer>
    </div>
  )
}