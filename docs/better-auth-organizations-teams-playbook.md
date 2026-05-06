# Better Auth com Organizations e Teams

## Objetivo

Padronizar autenticação e multi-tenant com Better Auth, usando `organization` como fonte de verdade para cada barbearia e `teams` para segmentação interna.

## Arquitetura adotada

- **Tenant principal:** tabela `organization` (plugin Better Auth).
- **Domínio de negócio:** tabela `Barbershop`.
- **Vínculo tenant/domínio:** `Barbershop.organizationId -> Organization.id` (1:1 opcional).
- **Sessão ativa:** `session.activeOrganizationId` e `session.activeTeamId`.

## Arquivos implementados

- `src/lib/auth.ts`
  - plugin `organization` habilitado com `teams.enabled: true`
  - convite por e-mail via `sendInvitationEmail`
  - helpers `getSession()` e `getCurrentUser()`
- `src/lib/auth-client.ts`
  - `organizationClient({ teams: { enabled: true } })`
- `src/features/organization/_actions/organization-management.ts`
  - ações para criar org, ativar org, criar team, convidar e aceitar convite
  - ação para vincular organização ativa em uma barbearia
- `src/app/(authenticated)/panel/organization/page.tsx`
  - tela operacional para owner
- `src/app/(not-authenticated)/(main)/organization/invitations/accept/page.tsx`
  - tela de aceite de convite por URL
- `prisma/schema.prisma`
  - modelos de organization/team/member/invitation
  - campos de sessão ativa
  - vínculo com `Barbershop`

## Fluxo recomendado

1. Owner cria organização (`createOrganization`).
2. Owner define organização ativa (`setActiveOrganization`).
3. Owner cria teams (`createTeam`).
4. Owner convida membros (`createInvitation`), que recebem URL com `invitationId`.
5. Usuário convidado aceita (`acceptInvitation`).
6. Owner vincula organização ativa a uma `Barbershop`.

## Convenções de ID e slug

- `Organization.id`: ID técnico do tenant.
- `Organization.slug`: slug único e estável para URL/contexto.
- `Barbershop.organizationId`: chave para isolamento por tenant.
- Recomendação: reutilizar slug da barbearia no slug da organização quando possível.

## Migração Prisma (segura)

Como a base já possui dados, rode em ambiente de desenvolvimento com revisão humana:

1. Validar schema:
   - `npx prisma validate --schema prisma/schema.prisma`
2. Formatar:
   - `npx prisma format --schema prisma/schema.prisma`
3. Gerar SQL de diff para revisão antes de aplicar:
   - `npx prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/<timestamp>_better_auth_org_teams/migration.sql`
4. Revisar SQL para evitar drops indevidos em tabelas já populadas.
5. Aplicar somente após revisão em ambiente de staging.

## Segurança e operação

- Configure `BETTER_AUTH_SECRET` e `BETTER_AUTH_URL`.
- Opcional para envio de convites:
  - `BETTER_AUTH_INVITATION_WEBHOOK_URL`
  - `BETTER_AUTH_INVITATION_ACCEPT_URL`
- Sem webhook configurado, o sistema loga a URL do convite no servidor.

## Próximos passos sugeridos

- Restringir queries do painel por `organizationId` (isolamento completo multi-tenant).
- Sincronizar automaticamente criação de `Barbershop` ao criar `Organization`.
- Evoluir controle de papéis: papel global da plataforma (`User.role`) + papel por organização (`Member.role`).
