import { z } from "zod"

export const CreateServiceOwnerInputSchema = z.object({
  barbershopId: z.string().min(1, "Barbearia é obrigatória"),
  name: z.string().trim().min(1, "Nome do serviço é obrigatório"),
  description: z.string().trim().optional() ?? "",
  imageUrl: z.string().trim() ?? "/banner.png",
  price: z.coerce.number().min(0, "Preço não pode ser negativo"),
  durationMinutes: z.coerce
    .number()
    .int("Duração deve ser um número inteiro")
    .min(1, "Duração mínima é 1 minuto"),
})

export type CreateServiceOwnerInput = z.infer<
  typeof CreateServiceOwnerInputSchema
>

/** Output DTO (resposta mínima após criar o serviço). */
export type CreateServiceOwnerOutput = {
  id: string
}
