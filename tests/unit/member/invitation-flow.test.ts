import { describe, it, expect, vi, beforeEach } from "vitest"
import { Role } from "@/prisma/generated/prisma/enums"

vi.mock("react", () => ({
  cache: (fn: unknown) => fn,
}))

vi.mock("@/src/features/member/member.repository", () => ({
  memberRepository: {
    findUserByEmail: vi.fn(),
    findMemberInOrganization: vi.fn(),
    findBarberMembershipElsewhere: vi.fn(),
    findUserRole: vi.fn(),
    updateUserRole: vi.fn(),
  },
}))

vi.mock("@/src/shared/guards", () => ({
  requireOrganizationForOwner: vi.fn(),
}))

import { memberService } from "@/src/features/member/member.service"
import { memberRepository } from "@/src/features/member/member.repository"
import { requireOrganizationForOwner } from "@/src/shared/guards"

describe("memberService — fluxo de convite", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("validateInvitationRecipient", () => {
    it("normaliza o e-mail", async () => {
      vi.mocked(memberRepository.findUserByEmail).mockResolvedValue(null)

      const email = await memberService.validateInvitationRecipient(
        "org-1",
        "  Barbeiro@Example.COM ",
      )

      expect(email).toBe("barbeiro@example.com")
      expect(memberRepository.findUserByEmail).toHaveBeenCalledWith(
        "barbeiro@example.com",
      )
    })

    it("rejeita barbeiro já vinculado a outra barbearia", async () => {
      vi.mocked(memberRepository.findUserByEmail).mockResolvedValue({
        id: "user-1",
        members: [{ id: "member-1" }],
      } as never)

      await expect(
        memberService.validateInvitationRecipient(
          "org-1",
          "barbeiro@example.com",
        ),
      ).rejects.toThrow("Este usuário já é barbeiro em outra barbearia")
    })

    it("rejeita usuário que já pertence à mesma barbearia", async () => {
      vi.mocked(memberRepository.findUserByEmail).mockResolvedValue({
        id: "user-1",
        members: [],
      } as never)
      vi.mocked(memberRepository.findMemberInOrganization).mockResolvedValue({
        id: "member-in-org",
      } as never)

      await expect(
        memberService.validateInvitationRecipient(
          "org-1",
          "barbeiro@example.com",
        ),
      ).rejects.toThrow("Este usuário já pertence a esta barbearia")
    })
  })

  describe("validateInvitationAcceptance", () => {
    it("impede aceite quando já é barbeiro noutra org", async () => {
      vi.mocked(memberRepository.findBarberMembershipElsewhere).mockResolvedValue(
        { id: "member-elsewhere" } as never,
      )

      await expect(
        memberService.validateInvitationAcceptance(
          "org-1",
          "user-1",
          "member",
        ),
      ).rejects.toThrow("Você já é barbeiro em outra barbearia")
    })

    it("ignora validação para papéis que não são barbeiro", async () => {
      await memberService.validateInvitationAcceptance(
        "org-1",
        "user-1",
        "manager",
      )

      expect(
        memberRepository.findBarberMembershipElsewhere,
      ).not.toHaveBeenCalled()
    })
  })

  describe("finalizeMemberAfterInvitation", () => {
    it("promove CLIENT para MEMBER após aceite", async () => {
      vi.mocked(memberRepository.findUserRole).mockResolvedValue({
        role: Role.CLIENT,
      })
      vi.mocked(memberRepository.updateUserRole).mockResolvedValue({} as never)

      await memberService.finalizeMemberAfterInvitation("user-1", "MEMBER")

      expect(memberRepository.updateUserRole).toHaveBeenCalledWith(
        "user-1",
        Role.MEMBER,
      )
    })

    it("não altera role se usuário já não é CLIENT", async () => {
      vi.mocked(memberRepository.findUserRole).mockResolvedValue({
        role: Role.OWNER,
      })

      await memberService.finalizeMemberAfterInvitation("user-1", "member")

      expect(memberRepository.updateUserRole).not.toHaveBeenCalled()
    })
  })

  describe("prepareInvitation", () => {
    it("valida ownership e devolve dados do convite", async () => {
      vi.mocked(requireOrganizationForOwner).mockResolvedValue({
        id: "org-1",
      } as never)
      vi.mocked(memberRepository.findUserByEmail).mockResolvedValue(null)

      const invitation = await memberService.prepareInvitation(
        "owner-1",
        "org-1",
        "novo@example.com",
        Role.MEMBER,
      )

      expect(requireOrganizationForOwner).toHaveBeenCalledWith(
        "owner-1",
        "org-1",
      )
      expect(invitation).toEqual({
        email: "novo@example.com",
        organizationId: "org-1",
        role: Role.MEMBER,
      })
    })
  })

  describe("createBarberOwner", () => {
    it("reutiliza validação de convite antes de vincular", async () => {
      vi.mocked(requireOrganizationForOwner).mockResolvedValue({
        id: "org-1",
      } as never)
      vi.mocked(memberRepository.findUserByEmail).mockResolvedValue({
        id: "user-1",
        members: [{ id: "member-1" }],
      } as never)

      await expect(
        memberService.createBarberOwner(
          "owner-1",
          "org-1",
          "barbeiro@example.com",
        ),
      ).rejects.toThrow("Este usuário já é barbeiro em outra barbearia")
    })
  })
})
