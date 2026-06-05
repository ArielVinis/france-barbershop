-- Alinhar nomes das tabelas aos models Prisma (sem @@map)

ALTER TABLE "session" RENAME TO "Session";
ALTER TABLE "account" RENAME TO "Account";
ALTER TABLE "verification" RENAME TO "Verification";
ALTER TABLE "organization" RENAME TO "Organization";
ALTER TABLE "team" RENAME TO "Team";
ALTER TABLE "teamMember" RENAME TO "TeamMember";
ALTER TABLE "member" RENAME TO "Member";
ALTER TABLE "invitation" RENAME TO "Invitation";
ALTER TABLE "organization_service" RENAME TO "OrganizationService";
ALTER TABLE "organization_schedule" RENAME TO "OrganizationSchedule";
ALTER TABLE "organization_break" RENAME TO "OrganizationBreak";
ALTER TABLE "organization_blocked_slot" RENAME TO "OrganizationBlockedSlot";
