import { devRepository } from "@/src/features/dev/dev.repository"

export const devService = {
  async setCurrentUserAsOwner(userId: string, organizationId: string) {
    if (process.env.NODE_ENV !== "development") {
      throw new Error("Disponível apenas em desenvolvimento")
    }

    const organization = await devRepository.findOrganization(organizationId)
    if (!organization) {
      throw new Error("Barbearia não encontrada")
    }

    await devRepository.setUserAsOwner(userId, organization.id)
  },
}
