import { signIn } from "@/src/lib/auth-client"
import { Button } from "../ui/button"
import { DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import Image from "next/image"

const SignInDialog = ({ callbackUrl }: { callbackUrl?: string }) => {
  const handleLoginWithGoogleClick = () =>
    signIn.social({ provider: "google", callbackURL: callbackUrl })

  return (
    <>
      <DialogHeader>
        <DialogTitle>Faça login na plataforma</DialogTitle>
        <DialogDescription>
          Conecte-se usando sua conta do Google.
        </DialogDescription>
      </DialogHeader>

      <Button
        variant="outline"
        className="gap-1 font-bold"
        onClick={handleLoginWithGoogleClick}
      >
        <Image
          alt="Fazer login com o Google"
          src="/google.svg"
          width={18}
          height={18}
        />
        Google
      </Button>
    </>
  )
}

export default SignInDialog
