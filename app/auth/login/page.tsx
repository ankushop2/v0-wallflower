import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="font-bold text-lg">WF</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold">WallFlower</h1>
          <p className="text-sm text-muted-foreground">Workplace Grievance Platform</p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}
