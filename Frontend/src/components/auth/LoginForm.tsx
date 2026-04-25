import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function LoginForm() {
  const { checkAuth } = useAuth()
  
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  })
  
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError("")
    setSuccess("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.username || !formData.password) {
      setError("Please fill in all fields")
      return
    }

    setSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          email: formData.username, // Using email param based on backend specs
          password: formData.password 
        }),
      })
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || "Authentication failed")
      }
      
      await checkAuth()
    } catch (apiError: any) {
      setError(apiError.message || "Authentication failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2 w-full">
      <div className="flex flex-col gap-2 relative text-left">
        <Label htmlFor="username" className="text-foreground/80 font-semibold mb-0.5">Email</Label>
        <Input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Enter Email"
          className="bg-background border-muted h-11"
        />
      </div>

      <div className="flex flex-col gap-2 relative text-left">
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

      {error && <div className="text-sm text-left font-semibold text-destructive mt-1 bg-destructive/10 p-3 rounded-md border-l-4 border-destructive">{error}</div>}
      {success && <div className="text-sm text-left font-semibold text-green-700 mt-1 bg-green-100 p-3 rounded-md border border-green-200 border-l-4">{success}</div>}

      <Button type="submit" className="w-full font-bold h-12 text-[15px] mt-2 shadow-md transition-all active:scale-[0.98]" disabled={submitting}>
        {submitting ? "Logging in..." : "Login"}
      </Button>
    </form>
  )
}