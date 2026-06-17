# France Barbershop

Sistema de agendamento e gestão para barbearias, construído com Next.js 16, Better Auth, Prisma e PostgreSQL.

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Rodar](#como-rodar)
- [Funcionalidades Implementadas](#funcionalidades-implementadas)
- [Roadmap](#roadmap)
- [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
- [Comandos Úteis](#comandos-úteis)
- [Testes](#testes)
- [Documentação Adicional](#documentação-adicional)

## Sobre o Projeto

Plataforma multi-tenant onde cada barbearia é uma **Organization** (plugin organization do Better Auth). O sistema cobre o fluxo público de agendamento e um painel interno unificado em `/panel`, com navegação e permissões por papel.

### Perfis de usuário

| Papel       | Descrição                                                                                          |
| ----------- | -------------------------------------------------------------------------------------------------- |
| **CLIENT**  | Cliente final: navega barbearias, agenda serviços e acompanha reservas em `/bookings`.             |
| **MEMBER**  | Barbeiro: acessa o painel com dashboard, agendamentos e gestão de atendimentos.                    |
| **MANAGER** | Gestor da barbearia: painel com permissões de gestão (barbeiros, serviços, horários, organização). |
| **OWNER**   | Dono da barbearia: gestão completa + assinatura Stripe da plataforma.                              |
| **ADMIN**   | Papel reservado no access control do Better Auth.                                                  |

> O barbeiro não é um `role` global separado: é um `User` com `role: MEMBER` vinculado à organização via tabela `Member`.

## Tecnologias

| Área                  | Stack                                     |
| --------------------- | ----------------------------------------- |
| Framework             | Next.js 16 (App Router)                   |
| Linguagem             | TypeScript                                |
| Autenticação          | Better Auth + plugin organization (teams) |
| ORM                   | Prisma 7                                  |
| Banco                 | PostgreSQL                                |
| UI                    | Tailwind CSS, shadcn/ui, next-themes      |
| Formulários           | react-hook-form + Zod                     |
| Pagamentos            | Stripe (Checkout + Customer Portal)       |
| E-mail                | Resend + React Email                      |
| Gráficos / calendário | Recharts, react-big-calendar              |
| Testes                | Vitest (unit), Playwright (E2E)           |
| Qualidade             | ESLint, Prettier, Husky, lint-staged      |

## Arquitetura

```mermaid
flowchart TB
  subgraph publico [Área pública]
    Home["/"]
    Lista["/barbershops"]
    Slug["/[slug]"]
    Bookings["/bookings"]
  end

  subgraph auth [Autenticação]
    Login["/auth/login"]
    Signup["/auth/signup"]
    Reset["/auth/reset-password"]
  end

  subgraph panel [Painel /panel]
    Dashboard["/panel"]
    Schedule["/panel/schedule"]
    Org["/panel/organization"]
    Barbers["/panel/barbers"]
    Services["/panel/services"]
    Hours["/panel/worked-hours"]
    Sub["/panel/subscription"]
  end

  Cliente --> publico
  Cliente --> auth
  MEMBER --> panel
  OWNER --> panel
  MANAGER --> panel
  panel --> Stripe
  auth --> BetterAuth[Better Auth]
  BetterAuth --> PostgreSQL
  panel --> PostgreSQL
  publico --> PostgreSQL
```

### Multi-tenant

- Cada barbearia = registro em `Organization` (slug, endereço, serviços, horários).
- Membros da equipe = `Member` (barbeiro, gestor ou dono na org).
- A sessão guarda `activeOrganizationId` para contexto do tenant ativo.
- Convites por e-mail via Resend (`/api/accept-invitation/[id]`).

### Proteção de rotas

- `src/app/proxy.ts` — matcher em `/panel/*` e `/dev/*`; só OWNER, MANAGER e MEMBER entram no painel.
- Rotas exclusivas de dono/gestor redirecionam barbeiros (MEMBER) quando necessário.
- Várias telas de gestão exigem assinatura Stripe ativa do dono.

## Estrutura do Projeto

```
src/
├── app/
│   ├── (authenticated)/panel/     # Painel interno (owner, manager, barbeiro)
│   │   ├── page.tsx                 # Dashboard → /panel
│   │   ├── schedule/                # Agendamentos → /panel/schedule
│   │   ├── organization/            # Gestão de org → /panel/organization
│   │   ├── barbers/                 # Barbeiros → /panel/barbers
│   │   ├── services/                # Serviços → /panel/services
│   │   ├── worked-hours/            # Horários → /panel/worked-hours
│   │   ├── subscription/            # Assinatura Stripe → /panel/subscription
│   │   └── layout.tsx               # Sidebar + header por papel
│   ├── (not-authenticated)/
│   │   ├── auth/                    # login, signup, forgot/reset password
│   │   └── (main)/                  # home pública, barbershops, bookings, [slug]
│   ├── (stripe)/                    # checkout e confirmação de pagamento (UI)
│   ├── api/
│   │   ├── auth/[...nextauth]/      # Handler Better Auth (rota legada)
│   │   └── accept-invitation/       # Aceite de convites
│   ├── (authenticated)/dev/         # Ferramentas de dev (só NODE_ENV=development)
│   ├── proxy.ts                     # Proteção de rotas do painel
│   └── page.tsx                     # Home → /
├── components/                      # UI, auth, layout, templates
├── features/                        # Domínios (repository / service / actions)
│   ├── booking/                     # Agendamentos (cliente, barbeiro, owner)
│   ├── dashboard/                   # Stats e gráficos do painel
│   ├── dev/                         # Actions de desenvolvimento
│   ├── member/                      # Barbeiros e membros da org
│   ├── organization/                # Organizações e contexto do owner
│   ├── public/                      # Listagem e páginas públicas
│   ├── schedule/                    # Horários, pausas e bloqueios
│   ├── service/                     # Serviços da barbearia
│   └── subscription/                # Assinatura Stripe e acesso ao plano
├── resources/                       # Itens da sidebar do painel
├── server/                          # Auth HTTP (users, permissions)
└── shared/                          # Código transversal
    ├── constants/                   # PATHS, NUMBERS, search
    ├── errors/                      # ValidationError, ForbiddenError, NotFoundError
    ├── guards/                      # Authz, panel query helpers
    ├── lib/                         # prisma, auth, stripe, utils, schedule-utils
    └── types/                       # Tipos compartilhados do painel

prisma/
├── schema.prisma                    # Schema (client gerado em prisma/generated/prisma)
├── migrations/                      # Migrations versionadas
└── seed.ts                          # Dados de demonstração

tests/
├── unit/                            # Vitest (espelha domínios: booking/, service/, shared/guards/, …)
└── e2e/                             # Playwright

docs/
└── better-auth-organizations-teams-playbook.md
```

### Convenção por feature

Cada domínio em `features/[nome]/` segue o padrão **repository / service / actions**:

| Ficheiro | Uso |
| -------- | --- |
| `[nome].repository.ts` | Acesso Prisma apenas (`db` via `@/src/shared/lib/prisma`) |
| `[nome].service.ts` | Regras de negócio (sem `'use server'`, sem `revalidatePath`) |
| `[nome].schema.ts` | Schemas Zod de input/output |
| `[nome].types.ts` | Tipos do domínio |
| `[nome].actions.ts` | Server Actions públicas/cliente (finas: validar → service → revalidar) |
| `[nome].panel.actions.ts` | Server Actions do painel (quando aplicável) |
| `_lib/` | Utilitários puros internos do domínio |

Exemplo (`booking/`):

- `booking.actions.ts` — `createBooking`, `deleteBooking`, `getBookings`, `getConfirmedBookings`, `getConcludedBookings`
- `booking.panel.actions.ts` — `updateBookingStatus`, `updateBookingStatusOwner`, `rescheduleBookingOwner`, `getOwnerBookings`, `getBarberBookings`

Domínios só de leitura (`public`, `dashboard`) usam `service` + `repository`; páginas podem importar `*.service.ts` em Server Components ou `*.actions.ts` quando precisam de `'use server'`.

### Regras de importação

- **`features/`** não importam entre si — código comum vai para `shared/`.
- **`app/`** importa de `features/` e `shared/`.
- **`components/`** importa de `shared/` (tipos, utils); evitar import direto de `features/`.
- **`shared/`** e **`server/`** não importam de `app/` nem de `features/`.

### Rotas principais

| Rota                  | Descrição                                                         |
| --------------------- | ----------------------------------------------------------------- |
| `/`                   | Home com busca e barbearias em destaque                           |
| `/barbershops`        | Listagem e busca de barbearias                                    |
| `/[slug]`             | Página pública da barbearia (serviços, horários, agendamento)     |
| `/bookings`           | Agendamentos do cliente autenticado                               |
| `/auth/login`         | Login (e-mail/senha ou Google)                                    |
| `/auth/signup`        | Cadastro com verificação de e-mail                                |
| `/panel`              | Dashboard do painel (cards e gráficos por papel)                  |
| `/panel/schedule`     | Agenda: tabela + calendário (owner) ou atendimentos (barbeiro)    |
| `/panel/organization` | Gestão da organização e membros                                   |
| `/panel/barbers`      | CRUD de barbeiros, ativar/desativar, ver agenda individual        |
| `/panel/services`     | CRUD de serviços (preço, duração)                                 |
| `/panel/worked-hours` | Horários, pausas e bloqueios da barbearia                         |
| `/panel/subscription` | Assinatura Stripe (dono) ou bloqueio por plano inativo (barbeiro) |
| `/dev`                | Em desenvolvimento: vincular usuário logado como OWNER            |

### Sidebar do painel (por papel)

Definida em `src/resources/sidebar-items.ts`:

- **MEMBER** (barbeiro): Dashboard, Agendamentos
- **OWNER / MANAGER**: Dashboard, Agendamentos, Organização, Barbeiros, Serviços, Horários de trabalho

## Como Rodar

### Pré-requisitos

- Node.js 18+
- PostgreSQL (local ou remoto)
- Contas opcionais: [Resend](https://resend.com), [Stripe](https://stripe.com), Google OAuth

### 1. Clonar e instalar

```bash
git clone <url-do-repositorio>
cd france-barbershop
npm install
```

### 2. Banco de dados local (opcional)

```bash
docker compose up -d
```

O `docker-compose.yml` sobe PostgreSQL em `localhost:5432` com:

- usuário: `postgres`
- senha: `password`
- database: `fullstack-barbershop`

### 3. Variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
# Obrigatórias
BETTER_AUTH_SECRET="gere-um-secret-aleatorio"
BETTER_AUTH_URL="http://localhost:3000"
DATABASE_URL="postgresql://postgres:password@localhost:5432/fullstack-barbershop"
RESEND_API_KEY="re_..."
EMAIL_NO_REPLY="France Barber <no-reply@seudominio.com>"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Stripe (painel do dono e assinatura)
STRIPE_PRICE_ID="price_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_CUSTOMER_PORTAL_URL="https://billing.stripe.com/p/login/..."
STRIPE_WEBHOOK_SECRET=""   # opcional em dev
```

#### Supabase (produção)

Use **duas URLs** do painel do Supabase:

```env
# App (Vercel, serverless) — connection pooling
DATABASE_URL="postgresql://...@...pooler.supabase.com:6543/postgres?pgbouncer=true"

# CLI: migrate, seed, studio — conexão directa
DIRECT_DATABASE_URL="postgresql://...@...pooler.supabase.com:5432/postgres"
```

A app usa `DATABASE_URL`; o Prisma CLI (`migrate`, `seed`) usa `DIRECT_DATABASE_URL` quando definida. Em dev local com Docker, só `DATABASE_URL` basta.

### 4. Migrations e seed

```bash
npx prisma migrate dev
npx prisma db seed
```

O seed cria:

- 10 barbearias (`Organization`) com serviços e horários
- 1 barbeiro (`MEMBER`) por barbearia
- 1 usuário dono: `dono@francebarber.com` (sem senha — ver abaixo)

> Os usuários do seed **não têm conta de e-mail/senha**. Para testar o painel:
>
> 1. Cadastre-se em `/auth/signup` com seu e-mail.
> 2. Em desenvolvimento, acesse `/dev` e vincule-se como OWNER a uma barbearia.
> 3. Para Stripe em dev, use chaves de teste e assine via `/panel/subscription`.

### 5. Servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Funcionalidades Implementadas

### Cliente (CLIENT)

- [x] Home com busca e barbearias em destaque
- [x] Listagem e busca em `/barbershops`
- [x] Página pública da barbearia em `/[slug]`
- [x] Seleção de barbeiro e agendamento de serviços
- [x] Agendamentos confirmados e concluídos em `/bookings`
- [x] Cancelamento de agendamentos
- [x] Autenticação (e-mail/senha, Google, verificação de e-mail, reset de senha)

### Barbeiro (MEMBER)

- [x] Painel unificado em `/panel` com sidebar
- [x] Dashboard com estatísticas
- [x] Agendamentos em `/panel/schedule` (lista do dia/semana/mês)
- [x] Iniciar, finalizar, cancelar e marcar não comparecimento
- [x] Registrar método de pagamento ao finalizar
- [x] Observações nos atendimentos
- [x] Bloqueio de acesso quando a barbearia não tem assinatura ativa

### Dono / Gestor (OWNER / MANAGER)

- [x] Dashboard com agendamentos, faturamento, barbeiros ativos e gráficos
- [x] Gestão de barbeiros (criar, excluir, ativar/desativar, ver agenda)
- [x] Gestão de serviços (criar, editar, preço, duração)
- [x] Agenda geral com calendário, filtro por barbeiro, cancelar e realocar
- [x] Horários de funcionamento, pausas e bloqueios (feriados/dias especiais)
- [x] Gestão de organização e membros (convites)
- [x] Assinatura Stripe: plano, status, portal de pagamento, cancelamento

### Sistema base

- [x] Schema Prisma com organizations, members, bookings, schedules
- [x] Status de agendamento: CONFIRMED, IN_PROGRESS, FINISHED, CANCELLED, NO_SHOW
- [x] Métodos de pagamento: CREDIT_CARD, DEBIT_CARD, PIX, CASH
- [x] Status de pagamento: PENDING, PAID, REFUNDED, CANCELLED
- [x] Dark mode (ThemeSwitcher)
- [x] Testes unitários e E2E (parcial)
- [x] Husky + lint-staged no pre-commit

## Roadmap

### Alta prioridade

- [ ] Webhook Stripe para sincronizar status de assinatura automaticamente
- [ ] Fluxo completo de convite → aceite → primeiro acesso do barbeiro
- [ ] Validação robusta de conflitos de horário no agendamento

### Média prioridade

- [ ] Sistema de avaliações
  - [ ] Avaliações por barbeiro (hoje só existe `Rating` para organização)
  - [ ] Exibir avaliações na página pública da barbearia
- [ ] Perfil do barbeiro (bio, foto, serviços que realiza)
- [ ] Notificações por e-mail/SMS e lembretes de agendamento
- [ ] Bloqueios de horário por barbeiro (hoje bloqueios são da organização)

### Baixa prioridade

- [ ] Melhorias de UX (skeletons em mais telas, animações, responsividade)
- [ ] Ampliar cobertura de testes (unit, integração, E2E)
- [ ] Otimização de queries e cache
- [ ] CI/CD e deploy em produção
- [ ] Documentação de componentes e guia de contribuição

## Estrutura do Banco de Dados

### Modelos principais

| Modelo                                 | Descrição                                                |
| -------------------------------------- | -------------------------------------------------------- |
| `User`                                 | Usuários do sistema                                      |
| `Session` / `Account` / `Verification` | Sessões e credenciais (Better Auth)                      |
| `Organization`                         | Barbearia (tenant): nome, slug, endereço, telefones      |
| `Member`                               | Vínculo usuário ↔ organização (barbeiro, gestor ou dono) |
| `Team` / `TeamMember`                  | Times dentro da organização                              |
| `Invitation`                           | Convites pendentes para a organização                    |
| `OrganizationService`                  | Serviços oferecidos                                      |
| `Booking`                              | Agendamentos (cliente, serviço, barbeiro opcional)       |
| `OrganizationSchedule`                 | Horário de funcionamento por dia da semana               |
| `OrganizationBreak`                    | Pausas recorrentes (ex.: almoço)                         |
| `OrganizationBlockedSlot`              | Bloqueios por período (feriados, férias)                 |
| `Rating`                               | Avaliações da organização                                |

### Relacionamentos

- `User` ↔ `Member` ↔ `Organization` (N:M via Member)
- `Booking` → `User` (cliente), `OrganizationService`, `Member?` (barbeiro)
- `Organization` → `OrganizationSchedule`, `OrganizationBreak`, `OrganizationBlockedSlot`, `OrganizationService`

### Enums

```prisma
Role:           ADMIN | MEMBER | OWNER | MANAGER | CLIENT
BookingStatus:  CONFIRMED | IN_PROGRESS | FINISHED | CANCELLED | NO_SHOW
PaymentMethod:  CREDIT_CARD | DEBIT_CARD | PIX | CASH
PaymentStatus:  PENDING | PAID | REFUNDED | CANCELLED
```

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev
npm run build          # requer permissão explícita em CI/produção
npm run start

# Prisma
npx prisma studio
npx prisma migrate dev
npx prisma generate
npx prisma db seed

# Qualidade
npm run lint
npm run format

# Testes
npm test               # Vitest (unit)
npm run test:watch
npm run test:e2e       # Playwright
npm run test:e2e:ui
```

## Testes

### Unitários (Vitest)

Localizados em `tests/unit/`. Cobrem autorização e actions do painel do dono.

```bash
npm test
```

### E2E (Playwright)

Localizados em `tests/e2e/`. O Playwright sobe o dev server automaticamente se não estiver rodando.

```bash
npm run test:e2e
```

## Documentação Adicional

- [Better Auth — Organizations e Teams](docs/better-auth-organizations-teams-playbook.md)
- Regras do projeto em `.cursor/rules/` (actions, UI, middleware, testes)

## Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/minha-feature`)
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT.

---

Desenvolvido para barbearias modernas.
