# 💈 France Barbershop

Sistema de agendamento para barbearias desenvolvido com Next.js 14, TypeScript, Prisma e PostgreSQL.

## 📋 Índice

- [Sobre o Projeto](#🎯-sobre-o-projeto)
- [Tecnologias](#🛠-tecnologias)
- [Estrutura do Projeto](#📁-estrutura-do-projeto)
- [Como Rodar](#🚀-como-rodar)
- [Funcionalidades Implementadas](#✨-funcionalidades-implementadas)
- [TODOs](#📝-todos)
- [Estrutura do Banco de Dados](#🗄️-estrutura-do-banco-de-dados)

## 🎯 Sobre o Projeto

Sistema completo de gestão e agendamento para barbearias com três perfis de usuário:

- **CLIENT**: Visualiza barbearias, serviços e faz agendamentos
- **BARBER**: Painel de agenda e gestão de atendimentos
- **OWNER**: Dashboard administrativo completo da barbearia

## 🛠 Tecnologias

- **Framework**: Next.js 16 (App Router)
- **Linguagem**: TypeScript
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **Autenticação**: NextAuth.js
- **Estilização**: Tailwind CSS
- **Componentes**: shadcn/ui
- **Validação**: Zod
- **Notificações**: Sonner

## 📁 Estrutura do Projeto

```
app/
├── (auth)/              # Rotas de autenticação
│   └── api/auth/       # NextAuth [...nextauth]
├── (main)/              # Rotas públicas e autenticadas
│   ├── barbershops/     # Listagem e detalhes de barbearias → /barbershops, /barbershops/[slug]
│   ├── bookings/        # Agendamentos do cliente → /bookings
│   └── page.tsx         # Home pública → /
├── (barber)/            # Route group do painel do barbeiro
│   └── barber/          # Rotas em /barber/*
│       ├── layout.tsx   # Layout base: sidebar + proteção por role BARBER
│       ├── page.tsx     # Dashboard → /barber
│       ├── bookings/    # Meus agendamentos → /barber/bookings
│       ├── perfil/      # Meu perfil → /barber/perfil
│       ├── ratings/     # Avaliações → /barber/ratings
│       └── settings/    # Configurações → /barber/settings
├── _components/         # Componentes compartilhados
│   ├── auth/           # Componentes de autenticação
│   ├── barber/         # Componentes do painel do barbeiro (ex: barber-sidebar)
│   ├── barbershop/     # Componentes de barbearia
│   ├── booking/        # Componentes de agendamento
│   ├── common/         # Componentes comuns
│   ├── layout/         # Componentes de layout
│   └── ui/             # Componentes shadcn/ui
├── _constants/         # Constantes da aplicação
├── _features/          # Features organizadas por domínio
│   ├── barber/
│   │   └── _data/      # get-barber-by-user-id, etc.
│   ├── bookings/
│   │   ├── _actions/   # Server Actions
│   │   └── _data/      # Data fetching
│   └── barbershops/
├── _lib/               # Utilitários e configurações
│   ├── auth.ts         # Configuração NextAuth (session com role e barberId)
│   ├── prisma.ts       # Cliente Prisma
│   └── schedule-utils.ts # Utilitários de horários
├── _providers/         # Providers (ex: auth)
└── layout.tsx          # Layout raiz

prisma/
├── schema.prisma       # Schema do banco de dados
└── seed.ts             # Seed do banco de dados
```

### Layout base do painel do barbeiro

- **Rota**: `/barber` (e subrotas). Acesso apenas para usuários com `role === BARBER` e com registro em `Barber`; caso contrário, redireciona para `/`.
- **Estrutura visual**:
  - **Sidebar fixa** (esquerda): logo (link para home), **foto + nome do barbeiro** e nome da barbearia, bloco **Horários** (exibe os horários da barbearia por dia da semana), navegação (Início, Meus agendamentos, Configurar agenda, Meu perfil, Avaliações), botão Sair.
  - **Área principal**: `{children}` com padding, scroll independente.
- **Dados**: o layout busca o barbeiro por `userId` da sessão (incluindo barbearia e `schedules`) e repassa para a sidebar.

## 🚀 Como Rodar

### Pré-requisitos

- Node.js 18+
- PostgreSQL
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd france-barbershop
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/france_barbershop"
NEXTAUTH_SECRET="seu-secret-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

4. Configure o banco de dados:
```bash
# Criar migration
npx prisma migrate dev

# Popular banco com dados de teste
npx prisma db seed
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## ✅ Funcionalidades Implementadas

### Cliente (CLIENT)

- [x] Visualização de barbearias
- [x] Busca de barbearias
- [x] Visualização de serviços
- [x] Seleção de barbeiro
- [x] Agendamento de serviços
- [x] Visualização de agendamentos confirmados
- [x] Visualização de agendamentos concluídos
- [x] Cancelamento de agendamentos
- [x] Autenticação com NextAuth

### Sistema Base

- [x] Schema do banco de dados completo
- [x] Modelos: User, Barber, Barbershop, Service, Booking, Schedule
- [x] Sistema de horários de funcionamento por dia da semana
- [x] Status de agendamento (CONFIRMED, IN_PROGRESS, FINISHED, CANCELLED, NO_SHOW)
- [x] Métodos de pagamento (CREDIT_CARD, DEBIT_CARD, PIX, CASH)
- [x] Status de pagamento (PENDING, PAID, REFUNDED, CANCELLED)
- [x] Duração de serviços
- [x] Observações em agendamentos

## 📝 TODOs

### 🔴 Alta Prioridade

#### Painel do Barbeiro (BARBER)

- [x] **Layout base do barbeiro**
  - [x] Sidebar ou topbar com foto + nome
  - [x] Exibição de horários configurados

- [x] **Meus agendamentos**
  - [ ] Lista do dia / semana
  - [ ] Status: Confirmado, Em andamento, Finalizado, Cancelado
  - [ ] Botão "Iniciar atendimento"
  - [ ] Botão "Finalizar atendimento"
  - [ ] Visualização de informações do cliente

- [x] **Minha agenda**
  - [ ] Definir dias de trabalho
  - [ ] Configurar horário de início e fim
  - [ ] Gerenciar pausas
  - [ ] Bloquear horários específicos

- [x] **Meu perfil**
  - [ ] Serviços que realiza
  - [ ] Tempo médio por serviço
  - [ ] Foto e bio
  - [ ] Ativar / desativar disponibilidade

- [x] **Avaliações**
  - [ ] Feedback dos clientes
  - [ ] Nota média
  - [ ] Comentários recebidos

#### Painel do Dono (OWNER)

- [ ] **Dashboard inicial**
  - [ ] Agendamentos do dia
  - [ ] Faturamento
  - [ ] Barbeiros ativos
  - [ ] Serviços mais vendidos
  - [ ] Gráficos e estatísticas

- [ ] **Gestão de barbeiros**
  - [ ] Criar barbeiro
  - [ ] Ativar / desativar barbeiro
  - [ ] Ver agenda individual
  - [ ] Ver faturamento por barbeiro

- [ ] **Gestão de serviços**
  - [ ] Criar serviço
  - [ ] Editar serviço
  - [ ] Definir preço
  - [ ] Configurar tempo médio
  - [ ] Vincular serviços a barbeiros

- [ ] **Agenda geral**
  - [ ] Visão da barbearia inteira
  - [ ] Filtro por barbeiro
  - [ ] Cancelar agendamentos
  - [ ] Realocar agendamentos

- [ ] **Gestão de horários**
  - [ ] Configurar horários de funcionamento por dia
  - [ ] Criar pausas (ex: almoço)
  - [ ] Bloquear horários específicos
  - [ ] Feriados e dias especiais

### 🟡 Média Prioridade

- [ ] **Sistema de avaliações**
  - [ ] Modelo `BarberRating` (avaliações específicas para barbeiros)
  - [ ] Implementar avaliações de barbearia (já existe modelo `Rating`)
  - [ ] Exibir avaliações na página da barbearia
  - [ ] Sistema de comentários

- [ ] **Melhorias no agendamento**
  - [ ] Validação de conflitos de horário
  - [ ] Notificações por email/SMS
  - [ ] Lembretes de agendamento
  - [ ] Histórico completo de agendamentos

- [ ] **Perfil do barbeiro**
  - [ ] Campos adicionais no modelo `Barber`:
    - [ ] `bio` (String?)
    - [ ] `isOnline` (Boolean)
    - [ ] `isAvailable` (Boolean)
    - [ ] `commission` (Decimal) - comissão/salário
  - [ ] Foto do barbeiro
  - [ ] Serviços que cada barbeiro realiza (relação muitos-para-muitos)

- [ ] **Sistema de bloqueios**
  - [ ] Modelo `BlockedTimeSlot` para horários bloqueados
  - [ ] Bloqueios por barbeiro
  - [ ] Bloqueios gerais da barbearia

### 🟢 Baixa Prioridade

- [ ] **Melhorias de UX/UI**
  - [ ] Loading states
  - [ ] Skeleton loaders
  - [ ] Animações
  - [ ] Responsividade aprimorada
  - [ ] Dark mode

- [ ] **Testes**
  - [ ] Testes unitários
  - [ ] Testes de integração
  - [ ] Testes E2E

- [ ] **Performance**
  - [ ] Otimização de queries
  - [ ] Cache de dados
  - [ ] Image optimization
  - [ ] Code splitting

- [ ] **Documentação**
  - [ ] Documentação de API
  - [ ] Guia de contribuição
  - [ ] Documentação de componentes

- [ ] **Deploy**
  - [ ] Configuração de CI/CD
  - [ ] Deploy em produção
  - [ ] Monitoramento e logs

## 🗄 Estrutura do Banco de Dados

### Modelos Principais

- **User**: Usuários do sistema (CLIENT, BARBER, OWNER)
- **Barbershop**: Barbearias
- **Barber**: Barbeiros vinculados a barbearias
- **BarbershopService**: Serviços oferecidos
- **Booking**: Agendamentos
- **BarbershopSchedule**: Horários de funcionamento por dia
- **Rating**: Avaliações de barbearias

### Relacionamentos

- Um `User` pode ser um `Barber` (1:1)
- Um `User` pode ser `Owner` de múltiplas `Barbershop` (N:M)
- Um `Barber` pertence a uma `Barbershop` (N:1)
- Um `Booking` tem um `User` (cliente), um `Service` e opcionalmente um `Barber`
- Uma `Barbershop` tem múltiplos `BarbershopSchedule` (um por dia da semana)

### Enums

- **Role**: CLIENT, BARBER, OWNER
- **BookingStatus**: CONFIRMED, IN_PROGRESS, FINISHED, CANCELLED, NO_SHOW
- **PaymentMethod**: CREDIT_CARD, DEBIT_CARD, PIX, CASH
- **PaymentStatus**: PENDING, PAID, REFUNDED, CANCELLED

## 📚 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Prisma
npx prisma studio          # Interface visual do banco
npx prisma migrate dev      # Criar nova migration
npx prisma generate         # Gerar Prisma Client
npx prisma db seed          # Popular banco com dados de teste

# Linting
npm run lint
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

---

Desenvolvido para barbearias modernas
