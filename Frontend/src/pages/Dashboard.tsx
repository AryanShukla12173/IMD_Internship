import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

export default function Dashboard() {
  const { logout } = useAuth()

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/50 p-6 md:p-10">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="text-center flex flex-col gap-4">
          <p className="\text-muted-foreground font-medium">
            You are successfully logged in!
          </p>
          <Button variant="destructive" onClick={logout} className="mt-2">
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}