import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components"

type ChangeEmailVerificationProps = {
  userName: string
  verificationUrl: string
}

export function ChangeEmailVerificationEmail({
  userName,
  verificationUrl,
}: ChangeEmailVerificationProps) {
  return (
    <Html lang="pt-BR" dir="ltr">
      <Head />
      <Preview>Verifique seu novo endereço de e-mail</Preview>
      <Tailwind>
        <Body className="bg-gray-100 py-[40px] font-sans">
          <Container className="mx-auto max-w-[600px] rounded-[8px] bg-white p-[40px] shadow-sm">
            <Section>
              <Heading className="mb-[24px] text-center text-[24px] font-bold text-gray-900">
                Verifique seu novo e-mail
              </Heading>

              <Text className="mb-[16px] text-[16px] text-gray-700">
                Olá{userName ? `, ${userName}` : ""}!
              </Text>

              <Text className="mb-[16px] text-[16px] text-gray-700">
                Para concluir a alteração do e-mail da sua conta, confirme o
                novo endereço clicando no botão abaixo.
              </Text>

              <Section className="my-[32px] text-center">
                <Button
                  href={verificationUrl}
                  className="box-border rounded-[6px] bg-blue-600 px-[32px] py-[12px] text-[16px] font-medium text-white no-underline"
                >
                  Verificar novo e-mail
                </Button>
              </Section>

              <Text className="mb-[16px] text-[14px] text-gray-600">
                Se o botão acima não funcionar, copie e cole o link abaixo no
                navegador:
              </Text>

              <Text className="mb-[24px] break-all text-[14px] text-blue-600">
                {verificationUrl}
              </Text>

              <Text className="text-[14px] text-gray-600">
                Se você não solicitou esta alteração, ignore este e-mail com
                segurança.
              </Text>
            </Section>

            <Section className="mt-[32px] border-t border-gray-200 pt-[24px]">
              <Text className="m-0 text-center text-[12px] text-gray-500">
                © 2026 France Barber. Todos os direitos reservados.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
