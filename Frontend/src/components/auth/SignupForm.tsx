import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface SignupFormProps {
  onSignupSuccess: () => void;
}

export default function SignupForm({ onSignupSuccess }: SignupFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
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

    if (!formData.fullName || !formData.email || !formData.password) {
      setError("Please fill in all fields")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Password and confirm password do not match")
      return
    }

    setSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: "user", // Registration always sets role to "user"
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || "Registration failed")
      }

      setSuccess("Registration successful. You can login now.")
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: ""
      })
      setTimeout(() => {
        onSignupSuccess()
      }, 1500)
    } catch (apiError: any) {
      setError(apiError.message || "Registration failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2 w-full">
      <div className="flex flex-col gap-2 relative text-left">
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

      <div className="flex flex-col gap-2 relative text-left">
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

      <div className="flex flex-col gap-2 relative text-left">
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

      {error && <div className="text-sm font-semibold text-left text-destructive mt-1 bg-destructive/10 p-3 rounded-md border-l-4 border-destructive">{error}</div>}
      {success && <div className="text-sm font-semibold text-left text-green-700 mt-1 bg-green-100 p-3 rounded-md border border-green-200 border-l-4">{success}</div>}

      <Button type="submit" className="w-full font-bold h-12 text-[15px] mt-2 shadow-md transition-all active:scale-[0.98]" disabled={submitting}>
        {submitting ? "Registering..." : "Register"}
      </Button>
    </form>
  )
}