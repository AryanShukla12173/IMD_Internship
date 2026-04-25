import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import LoginForm from "../components/auth/LoginForm"
import SignupForm from "../components/auth/SignupForm"

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login")

  return (
    <div className="flex flex-col min-h-svh bg-muted/30">
      {/* Header */}
      <header className="bg-primary text-primary-foreground border-b border-primary/20 p-6 shadow-md z-10 flex flex-col items-center md:text-left">
        <div className="text-3xl font-bold tracking-wider ">Indian Meteorological Department</div>
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
              <div className="flex p-1 bg-muted rounded-md border border-muted/80 shadow-sm gap-1">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`flex-1 flex items-center justify-center py-2 text-sm font-semibold transition-all rounded-lg ${mode === "login" ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Login
                </button>
                <button
                   type="button"
                   onClick={() => setMode("register")}
                   className={`flex-1 flex items-center justify-center py-2 text-sm font-semibold transition-all rounded-lg ${mode === "register" ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Register
                </button>
              </div>

              {/* Dynamic Form Render based on Active Tab */}
              <div className="mt-2 text-center w-full">
                {mode === "login" ? (
                  <LoginForm />
                ) : (
                  <SignupForm onSignupSuccess={() => setMode("login")} />
                )}
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
