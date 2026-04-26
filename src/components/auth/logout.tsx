import { authClient } from "@/src/lib/auth-client"
import { Button } from "../ui/button"
import { LogOutIcon } from "lucide-react"

export function Logout() {
  const handleLogout = async () => {
    await authClient.signOut()
  }

  return (
    <Button variant="outline" type="button" onClick={handleLogout}>
      <LogOutIcon className="size-4" />
      Sair da conta
    </Button>
  )
}
