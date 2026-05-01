"use client"

import { CreateOrganizationForm } from "@/src/components/auth/create-organization-form"
import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/src/components/ui/dialog"
import { getOrganizationById } from "@/src/server/organizations/organizations"
import { PlusIcon } from "lucide-react"
import { MembersTable } from "./members-table"
import { getCurrentUser } from "@/src/server/auth/users"

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
      <MembersTable members={organization?.members || []} />
    </>
  )
}
