import type {
  ApplicationStatus,
  AssignmentStatus,
  ReportStatus,
} from './enums.js';

/**
 * Aturan perpindahan status ditulis sebagai tabel, bukan `if` yang tersebar di
 * controller. Satu tabel dipakai backend untuk menolak transisi tidak sah dan
 * dipakai frontend untuk menentukan tombol mana yang boleh muncul, jadi kedua
 * sisi tidak bisa berbeda pendapat soal status.
 *
 * Daftar lengkapnya ada di docs/prd.md §5.
 */
export type TransitionTable<S extends string> = Readonly<Record<S, readonly S[]>>;

export const APPLICATION_TRANSITIONS: TransitionTable<ApplicationStatus> = {
  PENDING: ['REVIEWING', 'REJECTED'],
  REVIEWING: ['INTERVIEW', 'REJECTED'],
  INTERVIEW: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: [],
  REJECTED: [],
};

export const REPORT_TRANSITIONS: TransitionTable<ReportStatus> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['REVIEWED', 'REVISION_REQUESTED'],
  REVISION_REQUESTED: ['SUBMITTED'],
  REVIEWED: [],
};

export const ASSIGNMENT_TRANSITIONS: TransitionTable<AssignmentStatus> = {
  ONBOARDING: ['ACTIVE'],
  ACTIVE: ['COMPLETED'],
  COMPLETED: [],
};

export function allowedTransitions<S extends string>(
  table: TransitionTable<S>,
  from: S,
): readonly S[] {
  // Nilai status bisa datang dari database, jadi pencariannya tidak
  // diasumsikan selalu ketemu meski tipenya bilang begitu.
  const targets: readonly S[] | undefined = table[from];
  return targets ?? [];
}

export function canTransition<S extends string>(
  table: TransitionTable<S>,
  from: S,
  to: S,
): boolean {
  return allowedTransitions(table, from).includes(to);
}
