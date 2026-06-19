"use client"

import { CreateOrganizationForm } from "@/src/components/auth/create-organization-form"
import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog"
import { getOrganizationById } from "@/src/features/organization/organization.actions"
import { PlusIcon } from "lucide-react"
import { MembersTable } from "./members-table"
import { getCurrentUser } from "@/src/server/auth/users"
import { addMember } from "@/src/features/member/member.actions"
import { Role } from "@/prisma/generated/prisma/enums"
import { sendInvitationMember } from "@/src/features/member/member.actions"

export async function All() {
  const { session, user } = await getCurrentUser()

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
      <div className="grid gap-4 py-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              onClick={() =>
                addMember(user.id, organization?.id ?? "", Role.MEMBER)
              }
            >
              <PlusIcon className="size-4" />
              Adicionar membro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar membro</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Adicione um novo membro à organização.
            </DialogDescription>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <PlusIcon className="size-4" />
              Enviar convite de membro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar convite de membro</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Envie um convite de membro para um novo membro.
            </DialogDescription>
            {/* TODO: Add SendInvitationMemberForm */}
            {/* <SendInvitationMemberForm onSubmit={sendInvitationMember} /> */}
          </DialogContent>
        </Dialog>
      </div>
      <MembersTable members={organization?.members || []} />
    </>
  )
}
