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
  Text,
  Tailwind,
} from "@react-email/components"

type VerifyEmailProps = {
  userName: string
  verificationUrl: string
}

export function VerifyEmail({ userName, verificationUrl }: VerifyEmailProps) {
  return (
    <Html lang="pt-BR" dir="ltr">
      <Head />
      <Preview>
        {" "}
        Verifique seu endereço de email para completar seu registro{" "}
      </Preview>
      <Tailwind>
        <Body className="bg-gray-100 py-[40px] font-sans">
          <Container className="mx-auto max-w-[600px] rounded-[8px] bg-white p-[40px] shadow-sm">
            <Section>
              <Heading className="mb-[24px] text-center text-[24px] font-bold text-gray-900">
                Verifique seu endereço de email
              </Heading>

              <Text className="mb-[16px] text-[16px] text-gray-700">
                Olá{userName ? `, ${userName}` : ""}!
              </Text>

              <Text className="mb-[16px] text-[16px] text-gray-700">
                Obrigado por se cadastrar! Estamos ansiosos para ter você na
                equipe. Para completar seu registro e começar a usar sua conta,
                por favor verifique seu endereço de email clicando no botão
                abaixo.
              </Text>

              <Section className="my-[32px] text-center">
                <Button
                  href={verificationUrl}
                  className="box-border rounded-[6px] bg-blue-600 px-[32px] py-[12px] text-[16px] font-medium text-white no-underline"
                >
                  Verificar endereço de email
                </Button>
              </Section>

              <Text className="mb-[16px] text-[14px] text-gray-600">
                Se o botão acima não funcionar, você também pode copiar e colar
                o link abaixo no seu navegador:
              </Text>

              <Text className="mb-[24px] break-all text-[14px] text-blue-600">
                {verificationUrl}
              </Text>

              <Text className="mb-[16px] text-[14px] text-gray-600">
                Este link de verificação expirará em 24 horas por motivos de
                segurança.
              </Text>

              <Text className="text-[14px] text-gray-600">
                Se você não criou uma conta conosco, pode ignorar este email com
                segurança.
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
