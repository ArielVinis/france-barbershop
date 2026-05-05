import { Button } from "@/src/components/ui/button"
import {
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Table,
} from "@/src/components/ui/table"
import { removeMember } from "@/src/server/organizations/member"
import { PencilIcon, TrashIcon } from "lucide-react"

type MembersTableProps = {
  id: string
  name?: string | null
  email?: string | null
  role: string
  createdAt: string | Date
  updatedAt?: string | Date | null
}

export function MembersTable({ members }: { members: MembersTableProps[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Criado em</TableHead>
          <TableHead>Atualizado em</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.id}>
            <TableCell>{member.name ?? "-"}</TableCell>
            <TableCell>{member.email ?? "-"}</TableCell>
            <TableCell>{member.role}</TableCell>
            <TableCell>
              {member.createdAt
                ? new Date(member.createdAt).toLocaleDateString("pt-BR")
                : "-"}
            </TableCell>
            <TableCell>
              {member.updatedAt
                ? new Date(member.updatedAt).toLocaleDateString("pt-BR")
                : "-"}
            </TableCell>
            <TableCell>
              <Button variant="ghost">
                <PencilIcon className="size-4" />
                Editar
              </Button>
              <Button
                variant="destructive"
                onClick={() => removeMember(member.id)}
              >
                <TrashIcon className="size-4" />
                Excluir
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
