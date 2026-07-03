# Plano de Atualização de Dependências

Guia operacional para atualizar as dependências do France Barbershop **por partes**, minimizando o risco de quebrar a aplicação.

## Como usar este documento

- Executar **uma onda de cada vez**, na ordem apresentada.
- Após cada onda: `npm install`, `npm run dev`, `npm test` e validar os fluxos críticos no browser.
- **Nunca** correr `npm run build` sem pedir permissão (ver `project-core`).
- Fazer commit apenas quando o utilizador pedir, idealmente **uma onda por commit** para facilitar rollback.
- Marcar cada item `[x]` só depois de validado no browser.

## Fluxos críticos a validar em cada onda

- **Agendamento público** — `/{slug}` → escolher serviço → calendário → confirmar reserva.
- **Painel do dono** — dashboard (gráficos), barbeiros, serviços, horários/bloqueios.
- **Autenticação** — login, signup, recuperação de password, criação de organização.
- **Pagamentos** — checkout Stripe e confirmação de subscrição.
- **Tema** — alternar claro/escuro.

## Legenda de risco

| Risco | Significado |
| --- | --- |
| 🔴 Alto | Breaking changes prováveis; migração manual e testes cuidados |
| 🟡 Médio | Pode afetar áreas específicas; rever changelog |
| 🟢 Baixo | Tooling/tipos; não afeta runtime de produção |

---

## Onda 0 — Minors e patches seguros (dentro da major atual)

Atualizações compatíveis sem breaking changes. Baixo risco, bom para começar.

- [ ] Rever `npm outdated` e subir apenas patches/minors dentro da major atual
- [ ] `tailwindcss@^3.4` (última 3.x, **sem** ir para 4)
- [ ] `zod@^3.25` (última 3.x, **sem** ir para 4)
- [ ] `react@^18.3` / `react-dom@^18.3` (última 18.x)
- [ ] `npm install` + `npm run dev` + `npm test`
- [ ] Validar todos os fluxos críticos

---

## Onda 1 — Tooling isolado (dev only) 🟢

Não afeta o runtime de produção. Pode partir lint/testes/CI, mas não a app.

- [ ] `eslint@^10` + `@eslint/js@^10`
- [ ] `lint-staged@^17`
- [ ] `prettier-plugin-tailwindcss@^0.8` (⚠️ só depois do Tailwind 4 — ver Onda 6)
- [ ] `@types/node@^26`
- [ ] `vitest@^4` (rever config/API de testes)
- [ ] `npm test` verde + `npm run lint`
- [ ] Confirmar que o pre-commit (lint-staged) continua a funcionar

---

## Onda 2 — Ícones e UI leve 🟡

- [ ] `lucide-react@^1` — verificar exports de ícones usados (público + painel)
- [ ] `sonner@^2` — validar toasts (`sonner.tsx`, welcome toast, booking)
- [ ] `next-themes@^0.4` — validar `ThemeSwitcher` e layout global
- [ ] Validar UI pública e painel no browser

---

## Onda 3 — Datas 🔴

`date-fns` afeta horários, timezone e dashboard.

- [ ] `date-fns@^4` + confirmar compatibilidade de `date-fns-tz`
- [ ] Rever imports e funções em:
  - [ ] `src/shared/lib/schedule-utils.ts`
  - [ ] `src/shared/lib/timezone-utils.ts`
  - [ ] `src/features/dashboard/_lib/dashboard-aggregates.ts`
  - [ ] `src/features/booking/_lib/booking-conflict.ts`
  - [ ] `src/features/schedule/_lib/*`
- [ ] Validar agendamento (slots, conflitos) e gráficos do dashboard

---

## Onda 4 — Validação: Zod + resolvers 🔴

⚠️ **Subir os dois em conjunto.** Zod 4 tem breaking changes de API.

- [ ] `zod@^4` **e** `@hookform/resolvers@^5` na mesma onda
- [ ] Rever schemas:
  - [ ] `src/features/organization/organization.schema.ts`
  - [ ] `src/features/booking/booking.schema.ts`
  - [ ] `src/features/member/member.schema.ts`
  - [ ] `src/features/service/service.schema.ts`
- [ ] Rever formulários com `zodResolver` (auth, criação de organização, etc.)
- [ ] Validar validação de erros em todos os formulários

---

## Onda 5 — Calendário 🔴

`react-day-picker` v9/v10 reescreveu a API; o `calendar.tsx` (Shadcn) está em v8.

- [ ] `react-day-picker@^10`
- [ ] Migrar `src/components/ui/calendar.tsx` para a nova API (`classNames`, navegação, etc.)
- [ ] Validar o calendário de agendamento em `/{slug}` de ponta a ponta

---

## Onda 6 — Tailwind 4 🔴

Migração mais trabalhosa. Impacta praticamente toda a UI e o Shadcn.

- [ ] `tailwindcss@^4` + `tailwind-merge@^3` (juntos)
- [ ] Migrar `tailwind.config.ts` e a configuração PostCSS para o formato v4
- [ ] Rever `globals.css` (tokens/`@layer`) e utilities alteradas
- [ ] Revalidar componentes Shadcn em `src/components/ui/*`
- [ ] `prettier-plugin-tailwindcss@^0.8` (se ficou pendente da Onda 1)
- [ ] Revisão visual completa da UI (público + painel + auth)

---

## Onda 7 — React 19 🔴

Next 16 suporta React 19, mas exige cuidado.

- [ ] `react@^19` + `react-dom@^19`
- [ ] `@types/react@^19` + `@types/react-dom@^19` (juntos)
- [ ] Rever refs, `useActionState`/`useFormState` e mudanças de comportamento
- [ ] Validar todos os fluxos críticos

---

## Onda 8 — Recharts 3 🔴

Gráficos do dashboard do dono.

- [ ] `recharts@^3`
- [ ] Rever:
  - [ ] `src/components/ui/chart.tsx`
  - [ ] `.../dashboard-content/chart-revenue.tsx`
  - [ ] `.../dashboard-content/chart-bookings.tsx`
  - [ ] `.../dashboard-content/chart-distribution.tsx`
- [ ] Validar dashboard com dados reais

---

## Onda 9 — Stripe 🔴

Área sensível de pagamentos. Subir o SDK e os pacotes de UI juntos.

- [ ] `stripe@^22` + `@stripe/react-stripe-js@^6` + `@stripe/stripe-js@^9`
- [ ] Rever versão da API Stripe e tipos em:
  - [ ] `src/shared/lib/stripe.ts`
  - [ ] `src/features/subscription/subscription.service.ts`
  - [ ] `src/features/subscription/_lib/map-stripe-subscription.ts`
  - [ ] `src/features/subscription/_lib/subscription-access.ts`
  - [ ] `src/app/(stripe)/_components/checkout.tsx`
- [ ] Validar checkout e webhook de subscrição (`npm test` dos testes de subscription)

---

## Onda 10 — TypeScript 6 🟡

Fazer por último; pode revelar erros de tipos das ondas anteriores.

- [ ] `typescript@^6`
- [ ] Resolver erros de tipos revelados
- [ ] `npm test` verde

---

## Regras de ouro

1. **Uma major de cada vez** — nunca combinar várias majors 🔴 numa só onda.
2. **Pares acoplados sobem juntos** — Zod + resolvers; Tailwind + tailwind-merge; React + @types/react; Stripe SDK + UI.
3. **Validar no browser** antes de marcar como concluído.
4. **Um commit por onda** (quando o utilizador pedir) para permitir rollback fácil.
5. Se uma onda falhar e não for trivial, reverter e registar o bloqueio aqui.
