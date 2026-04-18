# Painel unificado: autorização e escopo

Documento de **direção técnica** — o que nomear, onde colocar a lógica e em que ordem confiar em dados. O detalhe de implementação está no código referenciado.

---

## 1. Princípio

- **`Role` (sessão / Prisma):** define **área grossa** (painel owner vs barber vs cliente) e gates de rota/UI.
- **Regras sobre recursos:** definem **quem pode tocar em que ID**. Toda leitura ou escrita sensível deve usar **IDs já validados** por helpers em `src/lib/authz/` ou equivalente nas features — nunca só o ID que veio do cliente.

RBAC sozinho não basta: o ponto seguro é **posse** (dono da barbearia, barbeiro ligado ao `user.id`).

---

## 2. Nomenclatura

| Nome                                              | Uso                                                                                                                             |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **`shopId`**                                      | Query string canónica no painel (**não** usar `barbershop` na URL).                                                             |
| **`barbershopId`**                                | ID no modelo Prisma / base de dados.                                                                                            |
| **`PanelContext`**                                | `src/types/panel-context.ts` — resultado de `resolvePanelContext`: `{ role, userId, barbershopId }` e, se barbeiro, `barberId`. |
| **`getBarbershopForOwner(userId, barbershopId)`** | Confirma que a loja pertence ao dono.                                                                                           |
| **`getBarberForUser(userId)`**                    | Authz mínima: `{ id, barbershopId }` do barbeiro.                                                                               |
| **`getBarberByUserId`**                           | Dados ricos para UI em `features/barber` — não substitui `getBarberForUser` em regras de escrita.                               |

**Identidade na regra:** para BARBER, queries críticas usam **`Barber.id`** resolvido a partir da sessão, não `User.id` como se fosse o mesmo identificador de agendamento.

---

## 3. Onde está o quê

| Responsabilidade                       | Local                                           |
| -------------------------------------- | ----------------------------------------------- |
| Política de authz + barrel             | `src/lib/authz/` (`index.ts`)                   |
| Contexto do painel (union)             | `src/types/panel-context.ts`                    |
| Resolver escopo por papel + `shopId`   | `src/lib/authz/resolve-panel-context.ts`        |
| `shopId` na URL (agregado vs escopado) | `src/lib/panel/shop-query.ts`                   |
| BARBER não entra em rotas só dono      | `src/lib/panel/ensure-panel-owner.ts`           |
| `shopId` URL === loja do vínculo (BARBER) | `src/lib/panel/ensure-barber-shop-query.ts` (`ensureBarberShopIdMatchesUrl`) |
| Filtro OWNER `barbershopId` vs conjunto de lojas | `src/lib/panel/resolve-owner-shop-ids.ts` (`resolveOwnerShopIdsForQueries`) |
| Contratos tipados lista de lojas dono  | `src/types/panel-data-scope.ts` (`OwnerBarbershopIdList`) |
| Rotas do painel                        | `src/app/(authenticated)/panel/`                |
| Nav por papel                          | `src/resources/sidebar-items.ts` + `AppSidebar` |
| Dados/ações owner                      | `src/features/owner/_data/`, `_actions/`        |
| Dados/ações barbeiro                   | `src/features/barber/_data/`, `_actions/`       |

Imports novos: `@/src/lib/authz`.

---

## 4. Comportamento por papel (produto)

|                                      | **OWNER**                                              | **BARBER**                                                                                                                                                                                                                           |
| ------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Loja(s)                              | Uma ou várias; seletor no header quando aplicável.     | Uma loja — a do vínculo.                                                                                                                                                                                                             |
| `shopId` na URL                      | Controla filtro / escopo (agregado vs uma loja).       | Pode repetir na URL por **paridade de rotas**; **autorização** vem do vínculo. Se cruzares com input, exige `shopId === barbershopId` do contexto.                                                                                   |
| Dashboard / agenda                   | Métricas e lista ao nível dono (agregado ou filtrado). | **Paridade com o dono:** mesmos tipos de métricas e gráficos (receita, distribuição, etc.), sempre **filtrados ao `barberId`** do utilizador. Implementação: alargar/refatorar `src/features/barber/_data/` (e consumo em `/panel`). |
| Serviços, barbeiros, horário da loja | Gestão na loja escopada.                               | Sem acesso — redirecionar (já tratado em `ensure-panel-owner`).                                                                                                                                                                      |

### 4.1. Dashboard unificado (`/panel`)

- **Uma rota** (`src/app/(authenticated)/panel/page.tsx`) e **um componente de apresentação** partilhado (`dashboard-content.tsx` ou equivalente), com **dados** resolvidos após `resolvePanelContext` e ramos OWNER vs BARBER.
- **OWNER:** agregado ou filtrado por `shopId` como na política de URL.
- **BARBER:** loaders e queries escopados a **um** barbeiro e **uma** loja (a do vínculo); UI alinhada à do dono onde fizer sentido.

### 4.2. `shopId` e BARBER (decisão fixada)

- **Paridade de rotas:** o BARBER usa as mesmas URLs com `shopId` na query quando o dono também usa.
- **Validação obrigatória:** qualquer `shopId` vindo da URL (ou input) deve coincidir com o `barbershopId` do contexto do barbeiro (`getBarberForUser` / `PanelContext`); caso contrário, corrigir com redirect (mesmo padrão que “loja inválida” para o dono).

### 4.3. Assinatura e acesso ao painel (OWNER e BARBER)

- **Mesmo critério de acesso** ao painel quando a assinatura do **plano da barbearia** não está ativa: redirecionar para `PATHS.PANEL.SUBSCRIPTION` (`/panel/subscription`), tal como o dono.
- **Conteúdo por papel na rota de subscrição:**
  - **OWNER:** fluxo atual (detalhes Stripe, checkout, portal, etc.).
  - **BARBER:** ecrã **informativo** — plano expirado ou pagamento em falta; explicar que **só o dono** pode regularizar a assinatura e que, após isso, o barbeiro volta a ter acesso ao painel de gestão. **Não** assumir que o email do barbeiro é o da fatura; a fonte de verdade da subscrição deve seguir a **loja / dono** (ex.: email ou customer associado ao dono da barbearia do vínculo). Implementação: `barber-subscription-panel.tsx` + `hasBarbershopSubscriptionAccess`.

---

## 5. Política de `shopId` (URL)

- **Rotas agregadas** (`/panel`, `/panel/schedule`, …): com várias lojas, `shopId` ausente ou `all` = visão “todas”; `shopId=<uuid>` = filtra. Com uma loja, a UI tende a normalizar para o UUID dessa loja.
- **Rotas escopadas** (serviços, barbeiros, horários da loja): exige uma loja válida; com várias lojas, ausência ou ID inválido → redirect com `shopId` corrigido (ver `shop-query.ts`).

`resolvePanelContext` **não** substitui o agregado: para OWNER, `shopId` vazio ou `all` devolve `null` — nesse modo use `resolveShopIdForAggregate` / loaders que já restringem ao conjunto de lojas do dono.

---

## 6. Escolha do helper (resumo)

1. **Só dono, uma loja explícita** — `getBarbershopForOwner` **ou** `resolvePanelContext` + confirmar `ctx.role === "OWNER"`. Evita duas queries diferentes para a mesma regra.
2. **Mesma rota ou action para OWNER e BARBER** — `resolvePanelContext` → `if (ctx.role === …)` → funções de dados específicas por papel.
3. **Dono em modo “todas as lojas”** — não passar pelo caminho “uma loja” de `resolvePanelContext`; usar fluxo agregado já descrito em `shop-query` / loaders.

Para BARBER, `resolvePanelContext` **não** usa `shopId` para inferir loja: o `barbershopId` vem de `getBarberForUser`. **Obrigatório** validar `shopId` externo contra esse `barbershopId` (paridade de rotas com segurança).

---

## 7. Padrões no código atual (espelhar no barbeiro)

- **Posse na query:** ex. booking só se `barbershop.owners` contém o dono, ou `getBarbershopForOwner` antes de mutar.
- **Loaders owner:** listas de IDs de loja já limitadas no layout/página; filtros adicionais não podem ultrapassar esse conjunto.
- **Barbeiro em session:** `requireBarberForSession` nas actions do módulo `barber`; em authz preferir **`getBarberForUser`** para política explícita.

---

## 8. Roadmap enxuto

**Feito (base):** pasta `authz/`, `PanelContext`, `getBarbershopForOwner`, `getBarberForUser`, `requireRole`, `resolvePanelContext`, `shop-query`, redirect BARBER de rotas só dono, nav por papel, smoke E2E sem sessão.

**A fazer (prioridade sugerida):**

- [x] Loaders/actions **unificados** (ex.: dashboard) com ramos por papel em `/panel`; métricas/gráficos **paritários** filtrados por `barberId` (`src/features/barber/_data/get-barber-dashboard-stats.ts`, `get-barber-chart-data.ts`). _Nota:_ o ramo BARBER usa `getBarberForUser` + validação de `shopId` na página; `resolvePanelContext` continua disponível para actions/rotas escopadas.
- [x] Gate de subscrição no painel para **BARBER** (`hasBarbershopSubscriptionAccess` + redirect para `/panel/subscription`) + variante de UI (`barber-subscription-panel.tsx`; ver secção 4.3).
- [x] Validação rígida `shopId` === `barbershopId` do vínculo (BARBER): `ensureBarberShopIdMatchesUrl` em `/panel` (`PanelDashboardBarberSection`) e `/panel/schedule`; agenda alinhada a `getBarberForUser`. Novas rotas BARBER com query devem chamar o mesmo helper.
- [x] Camada de dados: `OwnerBarbershopIdList` + `resolveOwnerShopIdsForQueries` em leituras agregadas (`getOwnerDashboardStats`, charts, `getOwnerBookings`); filtro explícito inválido → vazio (sem alargar a “todas as lojas”). JSDoc em `getOwnerServices` / `getOwnerBarbers` / `getOwnerBarbershopHours` / `getBarberBookings`; `createBarberOwner` usa `getBarbershopForOwner`.
- [x] Testes unitários em `getBarbershopForOwner` / `getBarberForUser` e integração em `createBarberOwner` / `createServiceOwner` — `tests/unit/` (`npm run test`). **Fase 5**.
- [ ] (Opcional) Extrair shell comum sidebar + header.

---

## 9. O que evitar

- Aceitar `barbershopId` ou `bookingId` do request **sem** cruzar com dono ou barbeiro na query ou num helper.
- Misturar **`User.id`** com **`Barber.id`** em filtros de agendamento.
- Motor de políticas genérico (PDP) antes de existir complexidade real — **YAGNI**.

Para exemplos de assinatura, abrir os ficheiros em `src/lib/authz/` e `src/types/panel-context.ts` (são a fonte de verdade).
