/**
 * Enum dipakai sebagai const array + union type, bukan `enum` TypeScript,
 * supaya nilainya bisa dipakai saat runtime (validasi Zod, iterasi test)
 * sekaligus jadi tipe saat compile.
 */

export const ROLES = ['ADMIN', 'COMPANY', 'INTERN'] as const;
export type Role = (typeof ROLES)[number];

export const WORK_TYPES = ['ONSITE', 'HYBRID', 'REMOTE'] as const;
export type WorkType = (typeof WORK_TYPES)[number];

export const INTERNSHIP_STATUSES = ['DRAFT', 'OPEN', 'CLOSED'] as const;
export type InternshipStatus = (typeof INTERNSHIP_STATUSES)[number];

export const APPLICATION_STATUSES = [
  'PENDING',
  'REVIEWING',
  'INTERVIEW',
  'ACCEPTED',
  'REJECTED',
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const REPORT_STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'REVISION_REQUESTED',
  'REVIEWED',
] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const ASSIGNMENT_STATUSES = ['ONBOARDING', 'ACTIVE', 'COMPLETED'] as const;
export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];
