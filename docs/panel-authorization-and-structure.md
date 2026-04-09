# Painel Owner/Barber: regras de acesso e estrutura

Este documento alinha **regras explícitas** (validação de escopo) com o **papel** do usuário (`Role` no Prisma / sessão), propõe uma estrutura de pastas e lista **TODOs** com exemplos de código para implementação incremental.

## Rule-based vs Role-based (e o que usar aqui)

| Abordagem                   | O que é                                                                                                                   | No seu projeto                                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Role-based**              | Acesso guiado por **papel** fixo (OWNER, BARBER, CLIENT).                                                                 | O enum `Role` e a sessão (`session.user.role`) definem **qual área** do app e **quais ações grossas** são possíveis. |
| **Rule-based** (“R = Rule”) | **Regras explícitas** do tipo: “só se `barbershopId` pertencer ao usuário”, “só bookings do `barber` ligado a `user.id`”. | Funções de política em `src/lib/authz/` + queries sempre com **IDs já validados**.                                   |

**Recomendação:** usar **os dois juntos**:

1. **Papel (Role)** — roteamento de UI, middleware, e “este endpoint é só OWNER ou só BARBER”.
2. **Regras** — cada leitura/escrita crítica passa por helpers que implementam a regra de negócio (posse da barbearia, vínculo barbeiro–usuário).

Isso **é** o que foi sugerido antes: não é “só RBAC clássico”; o núcleo seguro são as **regras** sobre recursos. O `Role` só reduz o espaço de regras aplicáveis.

## Arquitetura alvo (resumo)

```
Sessão (id + role)
       ↓
Regras / authz (validar recurso → IDs confiáveis ou erro)
       ↓
Camada de dados (Prisma: dashboards, bookings, etc.)
```

## TODOs

Marque `[x]` conforme for concluindo.

### Fase 1 — Base de autorização

- [ ] **1.1** Criar pasta `src/lib/authz/` e um `index.ts` (re-export) opcional.
- [ ] **1.2** Documentar tipos de contexto do painel (union discriminada) em `src/lib/authz/panel-context.ts` (ou `src/types/panel-context.ts`).
- [ ] **1.3** Mover ou re-exportar `getBarbershopForOwner` de `owner/_features/_data/assert-owner-barbershop.ts` para `src/lib/authz/barbershop-for-owner.ts` (evitar duplicação; atualizar imports).
- [ ] **1.4** Implementar `getBarberForUser(userId)` (ou equivalente) que retorna `{ id, barbershopId, ... } | null` para regras do papel BARBER.
- [ ] **1.5** Implementar `requireRole(user, allowedRoles)` que lança ou retorna erro tipado — usar em Server Actions sensíveis.

### Fase 2 — Resolver contexto do painel

- [ ] **2.1** Implementar `resolvePanelContext(user, input)` conforme exemplo abaixo (ajustar `input` ao que vem de URL/form: `barbershopId` opcional).
- [ ] **2.2** Para OWNER com várias barbearias, definir regra: barbearia padrão vs obrigatoriedade de `barbershopId` na rota (alinhar com UI).
- [ ] **2.3** Usar `resolvePanelContext` nas Server Actions que hoje ramificam `if (role === OWNER)` / `BARBER` manualmente.

### Fase 3 — Camada de dados

- [ ] **3.1** Garantir que funções `getOwner*` / agregações recebam **apenas** `barbershopId` já validado (assinatura clara nos nomes ou JSDoc).
- [ ] **3.2** Garantir que funções `getBarber*` recebam `barberId` validado ou derivem sempre de `getBarberForUser`.
- [ ] **3.3** Revisar queries que aceitam `barbershopId` do cliente sem passar por `getBarbershopForOwner`.

### Fase 4 — UI compartilhada (opcional, paralelo)

- [ ] **4.1** Extrair shell comum (sidebar + header) para componente/feature compartilhada.
- [ ] **4.2** Configurar navegação por papel (`sidebar-items` ou `getPanelNav(role)`).

### Fase 5 — Testes e hardening

- [ ] **5.1** Testes unitários para `getBarbershopForOwner` e `getBarberForUser` (casos: dono errado, barbeiro inexistente).
- [ ] **5.2** Testes de integração mínimos em 1–2 Server Actions críticas (OWNER com `barbershopId` alheio → negado).

---

## Exemplos de código

### Tipos de contexto (union discriminada)

```ts
// src/lib/authz/panel-context.ts
export type PanelContextOwner = {
  role: "OWNER"
  userId: string
  barbershopId: string
}

export type PanelContextBarber = {
  role: "BARBER"
  userId: string
  barberId: string
  barbershopId: string
}

export type PanelContext = PanelContextOwner | PanelContextBarber

export function isOwnerContext(c: PanelContext): c is PanelContextOwner {
  return c.role === "OWNER"
}
```

### Regra: barbearia pertence ao owner

```ts
// src/lib/authz/barbershop-for-owner.ts
import { db } from "@/src/lib/prisma"

export async function getBarbershopForOwner(
  userId: string,
  barbershopId: string,
) {
  return db.barbershop.findFirst({
    where: {
      id: barbershopId,
      owners: { some: { id: userId } },
    },
    select: { id: true, slug: true },
  })
}
```

### Regra: barbeiro ligado ao usuário

```ts
// src/lib/authz/barber-for-user.ts
import { db } from "@/src/lib/prisma"

export async function getBarberForUser(userId: string) {
  return db.barber.findFirst({
    where: { userId },
    select: { id: true, barbershopId: true },
  })
}
```

### Exigir papel (gate por Role)

```ts
// src/lib/authz/require-role.ts
import type { AuthUser } from "@/src/lib/auth"

type AppRole = NonNullable<AuthUser["role"]>

export function requireRole(user: AuthUser, allowed: AppRole[]) {
  if (!allowed.includes(user.role as AppRole)) {
    throw new Error("Forbidden")
  }
}
```

### Resolver contexto (regras + papel)

```ts
// src/lib/authz/resolve-panel-context.ts
import type { AuthUser } from "@/src/lib/auth"
import { getBarbershopForOwner } from "./barbershop-for-owner"
import { getBarberForUser } from "./barber-for-user"
import type { PanelContext } from "./panel-context"

type ResolveInput = {
  /** Opcional: filtro de barbearia para OWNER (URL, form, etc.) */
  barbershopId?: string
}

export async function resolvePanelContext(
  user: AuthUser,
  input: ResolveInput,
): Promise<PanelContext | null> {
  if (user.role === "OWNER") {
    if (!input.barbershopId) {
      // TODO: implementar “barbearia padrão” ou exigir ID — ver Fase 2.2
      return null
    }
    const shop = await getBarbershopForOwner(user.id, input.barbershopId)
    if (!shop) return null
    return { role: "OWNER", userId: user.id, barbershopId: shop.id }
  }

  if (user.role === "BARBER") {
    const barber = await getBarberForUser(user.id)
    if (!barber) return null
    return {
      role: "BARBER",
      userId: user.id,
      barberId: barber.id,
      barbershopId: barber.barbershopId,
    }
  }

  return null
}
```

### Server Action: orquestração

```ts
"use server"

import { getCurrentUser } from "@/src/lib/auth"
import { resolvePanelContext } from "@/src/lib/authz/resolve-panel-context"
// import { getBarbershopDashboard } from "..."
// import { getBarberDashboard } from "..."

export async function loadDashboardAction(formData: FormData) {
  const user = await getCurrentUser()
  const barbershopId = formData.get("barbershopId")?.toString()

  const ctx = await resolvePanelContext(user, { barbershopId })
  if (!ctx) {
    return {
      success: false as const,
      error: "Sem permissão ou contexto inválido",
    }
  }

  if (ctx.role === "OWNER") {
    // return { success: true, data: await getBarbershopDashboard(ctx.barbershopId) }
  }
  // ctx.role === "BARBER"
  // return { success: true, data: await getBarberDashboard(ctx.barberId) }

  return { success: false as const, error: "Não implementado" }
}
```

---

## Como as regras aparecem hoje em `owner/_features`

O painel do owner **já implementa** o espírito de “regra + recurso”, em quatro formas (vale espelhar para o barbeiro com outro escopo).

### 1. Actions: `getCurrentUser` + `findFirst` com vínculo à barbearia

Ex.: `update-booking-status-owner.ts` e `reschedule-booking-owner.ts` carregam o booking só se `service.barbershop.owners` contém `user.id`. É a **regra de posse** na query — não basta conhecer o `bookingId`.

### 2. Actions: validar `barbershopId` antes de mutar

Ex.: `create-service-owner.ts` e `upsert-barbershop-schedules-owner.ts` usam `getBarbershopForOwner` para garantir que o `barbershopId` **pertence ao dono**, depois criam/atualizam registros.

### 3. Data loaders: escopo em lote + filtros opcionais

Ex.: `get-owner-bookings.ts` e `get-owner-dashboard-stats.ts` recebem `barbershopIds` **já limitados** às barbearias do owner (p.ex. via `getOwnerByUserId` na página). Filtros `barbershopId` / `barberId` devem continuar **dentro** desse conjunto (validados na UI ou na action).

### 4. Leitura de um barbeiro específico

`get-barber-for-owner.ts` — `findFirst` com `barber.id` **e** `barbershop.owners` contém `ownerId`. O dono não acessa barbeiro de outra barbearia.

---

## Escopo BARBER: só os dados dele, menos ações

| Aspecto | OWNER (hoje) | BARBER (regra desejada) |
|--------|----------------|-------------------------|
| **Identidade na regra** | `user.id` como dono (`owners.some`) | Resolver **`Barber.id`** a partir de `User.id` e usar nas queries |
| **Agendamentos** | Todos da(s) barbearia(s), filtro opcional por barbeiro | Somente `booking.barberId ===` do barbeiro logado |
| **Dashboard / stats** | Agregados por barbearia | Agregados **só** das linhas do barbeiro (ou métricas omitidas) |
| **Serviços / barbeiros / horário da loja** | CRUD e gestão ampla | **Sem** gestão de outros barbeiros ou serviços da loja; só o que o produto permitir (agenda/pausas/bloqueios **próprios**) |

**Resumo:** mesmo padrão técnico do owner (action → usuário → **regra no `where` do Prisma**), trocando “sou dono desta barbearia” por “sou este `Barber`”.

---

## Código do barbeiro: `User.id` ≠ `Barber.id`

- Helper **`requireBarberForSession`** em `barber/_features/_data/require-barber-for-session.ts` — `getCurrentUser` + `getBarberByUserId`; as actions de booking, pausas, bloqueios e agenda usam `barber.id` correto.
- Quando existir `src/lib/authz/`, esse helper pode ser **movido ou re-exportado** (paralelo a `getBarbershopForOwner`).

---

## Melhor opção (resposta direta)

- **Sim:** a linha que você gostou (regras na query + papel na sessão) continua sendo a **melhor opção** para este app.
- Tratar **“R = Rule”** como camada **`src/lib/authz`** com funções pequenas e testáveis; tratar **papel** como **gate** em rota/action e como ramo em `resolvePanelContext`.
- Evitar um único motor de regras genérico (estilo PDP completo) **até** o produto exigir muitas regras variáveis — YAGNI. Se no futuro as regras explodirem, aí se avalia biblioteca ou tabela de políticas.

Quando avançar na Fase 2.2, atualize este documento com a regra exata de “barbearia padrão” vs `barbershopId` obrigatório.
