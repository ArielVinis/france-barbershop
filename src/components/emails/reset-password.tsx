type ResetPasswordEmailProps = {
  userName: string
  resetUrl: string
}

const styles = {
  page: {
    margin: 0,
    padding: "24px",
    backgroundColor: "#f4f4f5",
    fontFamily: "Arial, Helvetica, sans-serif",
    color: "#18181b",
  },
  container: {
    maxWidth: "560px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    border: "1px solid #e4e4e7",
    borderRadius: "12px",
    padding: "24px",
  },
  title: {
    margin: "0 0 16px",
    fontSize: "24px",
    lineHeight: "32px",
    color: "#09090b",
  },
  text: {
    margin: "0 0 16px",
    fontSize: "16px",
    lineHeight: "24px",
    color: "#3f3f46",
  },
  buttonWrapper: {
    margin: "24px 0",
    textAlign: "center" as const,
  },
  button: {
    display: "inline-block",
    backgroundColor: "#18181b",
    color: "#ffffff",
    textDecoration: "none",
    borderRadius: "10px",
    padding: "12px 20px",
    fontSize: "16px",
    fontWeight: 700,
  },
  urlBox: {
    margin: "16px 0 20px",
    padding: "12px",
    borderRadius: "8px",
    backgroundColor: "#fafafa",
    border: "1px solid #e4e4e7",
    wordBreak: "break-all" as const,
    fontSize: "14px",
    color: "#52525b",
  },
  divider: {
    border: "none",
    borderTop: "1px solid #e4e4e7",
    margin: "24px 0",
  },
  footer: {
    margin: 0,
    fontSize: "13px",
    lineHeight: "20px",
    color: "#71717a",
  },
}

export function ResetPasswordEmail({
  userName,
  resetUrl,
}: ResetPasswordEmailProps) {
  return (
    <html lang="pt-BR">
      <body style={styles.page}>
        <main style={styles.container}>
          <h1 style={styles.title}>Redefinição de senha</h1>

          <p style={styles.text}>
            Olá{userName ? `, ${userName}` : ""}! Recebemos uma solicitação para
            redefinir a senha da sua conta.
          </p>

          <div style={styles.buttonWrapper}>
            <a href={resetUrl} style={styles.button}>
              Redefinir senha
            </a>
          </div>

          <p style={styles.text}>
            Se o botão nao funcionar, copie e cole este link no navegador:
          </p>
          <p style={styles.urlBox}>{resetUrl}</p>

          <hr style={styles.divider} />

          <p style={styles.footer}>
            Se voce nao solicitou essa alteracao, pode ignorar este e-mail com
            seguranca. Sua senha atual continuara a mesma.
          </p>
        </main>
      </body>
    </html>
  )
}
