# Painel unificado: autorização e escopo

Documento de **direção técnica** — o que nomear, onde colocar a lógica e em que ordem confiar em dados. O detalhe de implementação está no código referenciado.

---

## 1. Princípio

- **`Role` (sessão / Prisma):** define **área grossa** (painel owner vs barber vs cliente) e gates de rota/UI.
- **Regras sobre recursos:** definem **quem pode tocar em que ID**. Toda leitura ou escrita sensível deve usar **IDs já validados** por helpers em `src/lib/authz/` ou equivalente nas features — nunca só o ID que veio do cliente.

RBAC sozinho não basta: o ponto seguro é **posse** (dono da barbearia, barbeiro ligado ao `user.id`).

---

## 2. Nomenclatura

| Nome | Uso |
|------|-----|
| **`shopId`** | Query string canónica no painel (**não** usar `barbershop` na URL). |
| **`barbershopId`** | ID no modelo Prisma / base de dados. |
| **`PanelContext`** | `src/types/panel-context.ts` — resultado de `resolvePanelContext`: `{ role, userId, barbershopId }` e, se barbeiro, `barberId`. |
| **`getBarbershopForOwner(userId, barbershopId)`** | Confirma que a loja pertence ao dono. |
| **`getBarberForUser(userId)`** | Authz mínima: `{ id, barbershopId }` do barbeiro. |
| **`getBarberByUserId`** | Dados ricos para UI em `features/barber` — não substitui `getBarberForUser` em regras de escrita. |

**Identidade na regra:** para BARBER, queries críticas usam **`Barber.id`** resolvido a partir da sessão, não `User.id` como se fosse o mesmo identificador de agendamento.

---

## 3. Onde está o quê

| Responsabilidade | Local |
|-------------------|--------|
| Política de authz + barrel | `src/lib/authz/` (`index.ts`) |
| Contexto do painel (union) | `src/types/panel-context.ts` |
| Resolver escopo por papel + `shopId` | `src/lib/authz/resolve-panel-context.ts` |
| `shopId` na URL (agregado vs escopado) | `src/lib/panel/shop-query.ts` |
| BARBER não entra em rotas só dono | `src/lib/panel/ensure-panel-owner.ts` |
| Rotas do painel | `src/app/(authenticated)/panel/` |
| Nav por papel | `src/resources/sidebar-items.ts` + `AppSidebar` |
| Dados/ações owner | `src/features/owner/_data/`, `_actions/` |
| Dados/ações barbeiro | `src/features/barber/_data/`, `_actions/` |

Imports novos: `@/src/lib/authz`.

---

## 4. Comportamento por papel (produto)

| | **OWNER** | **BARBER** |
|---|-----------|------------|
| Loja(s) | Uma ou várias; seletor no header quando aplicável. | Uma loja — a do vínculo. |
| `shopId` na URL | Controla filtro / escopo (agregado vs uma loja). | Pode repetir na URL por **paridade de rotas**; **autorização** vem do vínculo. Se cruzares com input, exige `shopId === barbershopId` do contexto. |
| Dashboard / agenda | Métricas e lista ao nível dono (agregado ou filtrado). | Só o que é **dele** (ex.: bookings do seu `barberId`). |
| Serviços, barbeiros, horário da loja | Gestão na loja escopada. | Sem acesso — redirecionar (já tratado em `ensure-panel-owner`). |

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

Para BARBER, `resolvePanelContext` **não** usa `shopId` para inferir loja: o `barbershopId` vem de `getBarberForUser`. Validar `shopId` externo contra esse valor se fizer sentido para o produto.

---

## 7. Padrões no código atual (espelhar no barbeiro)

- **Posse na query:** ex. booking só se `barbershop.owners` contém o dono, ou `getBarbershopForOwner` antes de mutar.
- **Loaders owner:** listas de IDs de loja já limitadas no layout/página; filtros adicionais não podem ultrapassar esse conjunto.
- **Barbeiro em session:** `requireBarberForSession` nas actions do módulo `barber`; em authz preferir **`getBarberForUser`** para política explícita.

---

## 8. Roadmap enxuto

**Feito (base):** pasta `authz/`, `PanelContext`, `getBarbershopForOwner`, `getBarberForUser`, `requireRole`, `resolvePanelContext`, `shop-query`, redirect BARBER de rotas só dono, nav por papel, smoke E2E sem sessão.

**A fazer (prioridade sugerida):**

- [ ] Loaders/actions **unificados** (ex.: dashboard) com `resolvePanelContext` + ramos por papel (**TODO 2.3**).
- [ ] Camada de dados: funções `getOwner*` / `getBarber*` recebem só IDs já validados; revisar aceitação de `barbershopId` cru do cliente (**Fase 3**).
- [ ] Testes unitários em `getBarbershopForOwner` / `getBarberForUser`; um ou dois testes de integração em actions críticas (**Fase 5**).
- [ ] (Opcional) Extrair shell comum sidebar + header.

---

## 9. O que evitar

- Aceitar `barbershopId` ou `bookingId` do request **sem** cruzar com dono ou barbeiro na query ou num helper.
- Misturar **`User.id`** com **`Barber.id`** em filtros de agendamento.
- Motor de políticas genérico (PDP) antes de existir complexidade real — **YAGNI**.

Para exemplos de assinatura, abrir os ficheiros em `src/lib/authz/` e `src/types/panel-context.ts` (são a fonte de verdade).
