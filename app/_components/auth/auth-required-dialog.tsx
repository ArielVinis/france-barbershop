"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent } from "../ui/dialog"
import SignInDialog from "./sign-in-dialog"

const AuthRequiredDialog = () => {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      setIsOpen(true)
    } else if (status === "authenticated" && session?.user) {
      setIsOpen(false)
    }
  }, [status, session])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-[90%]">
        <SignInDialog />
      </DialogContent>
    </Dialog>
  )
}

export default AuthRequiredDialog
