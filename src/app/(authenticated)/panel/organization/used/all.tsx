import Link from "next/link"
import { CreateOrganizationForm } from "@/src/components/auth/create-organization-form"
import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/src/components/ui/dialog"
import { getOrganizationById } from "@/src/features/organization/organization.actions"
import { PlusIcon } from "lucide-react"
import { MembersTable } from "./members-table"
import { getCurrentUser } from "@/src/server/auth/users"
import { PATHS } from "@/src/shared/constants/PATHS"

export async function All() {
  const { session } = await getCurrentUser()

  const organization = await getOrganizationById(
    session?.activeOrganizationId ?? "",
  )

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 lg:px-6">
        <h2 className="text-lg font-semibold">Gestão de organizações</h2>
        <div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="size-4" />
                Criar organização
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar organização</DialogTitle>
              </DialogHeader>
              <CreateOrganizationForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="px-4 py-4 lg:px-6">
        <p className="text-sm text-muted-foreground">
          Para convidar barbeiros ou vincular utilizadores existentes, use a
          página{" "}
          <Link
            href={PATHS.PANEL.BARBERS}
            className="font-medium text-foreground underline underline-offset-4"
          >
            Barbeiros
          </Link>
          .
        </p>
      </div>

      <MembersTable members={organization?.members || []} />
    </>
  )
}
