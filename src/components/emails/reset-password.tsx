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

type ResetPasswordEmailProps = {
  userName: string
  resetUrl: string
}

export function ResetPasswordEmail({
  userName,
  resetUrl,
}: ResetPasswordEmailProps) {
  return (
    <Html lang="pt-BR" dir="ltr">
      <Head />
      <Preview>Redefina sua senha para continuar acessando sua conta</Preview>
      <Tailwind>
        <Body className="bg-gray-100 py-[40px] font-sans">
          <Container className="mx-auto max-w-[600px] rounded-[8px] bg-white p-[40px] shadow-sm">
            <Section>
              <Heading className="mb-[24px] text-center text-[24px] font-bold text-gray-900">
                Redefinição de senha
              </Heading>

              <Text className="mb-[16px] text-[16px] text-gray-700">
                Olá{userName ? `, ${userName}` : ""}!
              </Text>

              <Text className="mb-[16px] text-[16px] text-gray-700">
                Recebemos uma solicitação para redefinir a senha da sua conta.
                Clique no botão abaixo para criar uma nova senha com segurança.
              </Text>

              <Section className="my-[32px] text-center">
                <Button
                  href={resetUrl}
                  className="box-border rounded-[6px] bg-blue-600 px-[32px] py-[12px] text-[16px] font-medium text-white no-underline"
                >
                  Redefinir senha
                </Button>
              </Section>

              <Text className="mb-[16px] text-[14px] text-gray-600">
                Se o botão acima não funcionar, você também pode copiar e colar
                o link abaixo no seu navegador:
              </Text>

              <Text className="mb-[24px] break-all text-[14px] text-blue-600">
                {resetUrl}
              </Text>

              <Text className="mb-[16px] text-[14px] text-gray-600">
                Se você não solicitou a redefinição, ignore este email. Sua
                senha atual permanecerá a mesma.
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
