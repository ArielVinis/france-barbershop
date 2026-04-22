# Template RBAC + ABAC para Server Actions

Este documento define o padrão oficial para aplicar autorização em **todas** as Server Actions do projeto.

Objetivo: manter segurança consistente, baixo acoplamento e implementação previsível.

---

## 1) Modelo adotado

- **RBAC:** papel do usuário (`DEV`, `OWNER`, `MANAGER`, `BARBER`, `CLIENT`).
- **ABAC:** atributos de contexto/recurso (`barbershopId`, `barberId`, `clientId`, etc.).
- **Deny by default:** se não houver regra explícita, a ação deve ser negada.

---

## 2) Arquivos de autorização

```txt
src/auth/
  types.ts      # tipos base: role, action, resource, contexto
  policies.ts   # matriz de permissões por role (com condições ABAC)
  can.ts        # can(...) e assertCan(...)
  index.ts      # exports
```

---

## 3) Fluxo obrigatório para toda Server Action

Use esta ordem sempre:

1. **Validar input** (DTO/Zod).
2. **Resolver auth context** (`getAuthContext()`).
3. **Autorizar antes de qualquer side effect** com `assertCan(...)`.
4. **Validar posse no banco** (quando houver ID de recurso): ex. `requireBarbershopForOwner(...)`.
5. **Executar regra de negócio + persistência**.
6. **Revalidar cache** (`revalidatePath`) quando necessário.

---

## 4) Template base (copiar e adaptar)

```ts
"use server"

import { revalidatePath } from "next/cache"
import { assertCan } from "@/src/auth"
import { getAuthContext } from "@/src/lib/auth"
import { ValidationError } from "@/src/lib/authz/errors"
import { db } from "@/src/lib/prisma"

export async function actionName(input: unknown) {
  // 1) DTO/schema
  const parsed = SomeInputSchema.safeParse(input)
  if (!parsed.success)
    throw new ValidationError(parsed.error.issues[0]?.message)
  const data = parsed.data

  // 2) Contexto de auth
  const ctx = await getAuthContext()

  // 3) RBAC + ABAC (sempre antes do banco)
  assertCan(ctx, "create", "service", { barbershopId: data.barbershopId })

  // 4) Posse/vínculo real no banco (quando aplicável)
  const shop = await requireBarbershopForOwner(ctx.userId, data.barbershopId)

  // 5) Regra de negócio + persistência
  const created = await db.barbershopService.create({
    data: {
      barbershopId: shop.id,
      name: data.name.trim(),
      description: data.description?.trim() ?? "",
      imageUrl: data.imageUrl,
      price: data.price,
      durationMinutes: data.durationMinutes,
    },
    select: { id: true },
  })

  // 6) Cache/UI
  revalidatePath("/panel")
  return created
}
```

---

## 5) Exemplo prático atual (create service owner)

A action `create-service-owner` já segue o padrão:

- usa DTO com Zod para input;
- resolve contexto com `getAuthContext()`;
- chama `assertCan(ctx, "create", "service", { barbershopId })`;
- valida vínculo de dono via `requireBarbershopForOwner`;
- cria no banco e revalida paths.

Use este mesmo padrão como base para `update`, `delete`, `create-break`, `create-blocked-slot`, etc.

---

## 6) Quando usar `assertCan` vs `require*`

- **`assertCan`**: autorização declarativa (RBAC/ABAC via policy).
- **`require*`** (ex.: `requireBarbershopForOwner`): validação forte no banco + erros semânticos (`404` vs `403`).

Regra prática: em ações sensíveis com ID de recurso, usar **os dois**.

---

## 7) Convenções de implementação

- Preferir DTO por ação em `src/features/<feature>/_dto`.
- `Input` e `Output` no mesmo DTO quando fizer sentido.
- Não confiar em IDs vindos do cliente sem cruzar com contexto de sessão e banco.
- Evitar `throw new Error(...)` genérico para validação/autorização; preferir erros tipados.

---

## 8) Checklist rápido (PR)

- [ ] Input validado com schema.
- [ ] `getAuthContext()` usado na action.
- [ ] `assertCan(...)` antes de qualquer `db.*`.
- [ ] Validação de posse no banco aplicada quando necessário.
- [ ] Paths revalidados após mutação.
- [ ] Teste cobrindo: permitido, negado, recurso inexistente.
