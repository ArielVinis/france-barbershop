import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components"

type OrganizationInvitationEmailProps = {
  inviteUrl: string
  inviterName: string
  inviterEmail: string
  organizationName: string
  role: string
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  manager: "Gerente",
  member: "Membro",
  client: "Cliente",
}

function formatRole(role: string) {
  return ROLE_LABELS[role.toLowerCase()] ?? role
}

export function OrganizationInvitationEmail({
  inviteUrl,
  inviterName,
  organizationName,
  role,
}: OrganizationInvitationEmailProps) {
  return (
    <Html lang="pt-BR" dir="ltr">
      <Head />
      <Preview>
        Convite para participar da organização {organizationName} na France
        Barber
      </Preview>
      <Tailwind>
        <Body className="bg-gray-100 py-[40px] font-sans">
          <Container className="mx-auto max-w-[600px] rounded-[8px] bg-white p-[40px] shadow-sm">
            <Section>
              <Heading className="mb-[24px] text-center text-[24px] font-bold text-gray-900">
                Você foi convidado
              </Heading>

              <Text className="mb-[16px] text-[16px] text-gray-700">Olá!</Text>

              <Text className="mb-[16px] text-[16px] text-gray-700">
                <span className="font-medium">{inviterName}</span> convidou você
                para entrar na barbearia{" "}
                <span className="font-medium">{organizationName}</span> na
                plataforma France Barber, com o papel de{" "}
                <span className="font-medium">{formatRole(role)}</span>.
              </Text>

              <Text className="mb-[16px] text-[16px] text-gray-700">
                Para aceitar o convite, faça login com este e-mail (se ainda não
                tiver conta, cadastre-se) e clique no botão abaixo.
              </Text>

              <Section className="my-[32px] text-center">
                <Button
                  href={inviteUrl}
                  className="box-border rounded-[6px] bg-blue-600 px-[32px] py-[12px] text-[16px] font-medium text-white no-underline"
                >
                  Aceitar convite
                </Button>
              </Section>

              <Text className="mb-[16px] text-[14px] text-gray-600">
                Se o botão não funcionar, copie e cole o link no navegador:
              </Text>

              <Text className="mb-[24px] break-all text-[14px] text-blue-600">
                {inviteUrl}
              </Text>

              <Text className="text-[14px] text-gray-600">
                Se você não esperava este convite, pode ignorar este e-mail.
              </Text>
            </Section>

            <Section className="mt-[32px] border-t border-gray-200 pt-[24px]">
              <Text className="m-0 text-center text-[12px] text-gray-500">
                © 2026 Seu Nome da Empresa. Todos os direitos reservados.
              </Text>
              <Text className="m-0 text-center text-[12px] text-gray-500">
                123 Rua da Empresa, São José, BR
              </Text>
              <Text className="m-0 text-center text-[12px] text-gray-500">
                <Link href="#" className="text-gray-500 no-underline">
                  Desinscrever
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
