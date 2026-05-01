"use client"

import { Organization } from "@/prisma/generated/prisma/client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { authClient } from "@/src/lib/auth-client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type OrganizationSwitcherProps = {
  organizations: Organization[]
}

export function OrganizationSwitcher({
  organizations,
}: OrganizationSwitcherProps) {
  const router = useRouter()
  const { data: activeOrganization } = authClient.useActiveOrganization()

  const handleChangeOrganization = async (organizationId: string) => {
    try {
      const { error } = await authClient.organization.setActive({
        organizationId,
      })
      if (error) {
        toast.error("Erro ao alterar barbearia")
        return
      }

      router.refresh()
      toast.success("Barbearia alterada com sucesso")
    } catch (error) {
      console.error(error)
      toast.error("Erro ao alterar barbearia")
    }
  }

  return (
    <Select
      onValueChange={handleChangeOrganization}
      defaultValue={activeOrganization?.name}
    >
      <SelectTrigger>
        <SelectValue placeholder="Barbearias" />
      </SelectTrigger>
      <SelectContent>
        {organizations.map((organization) => (
          <SelectItem key={organization.id} value={organization.id}>
            {organization.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
