import { describe, expect, test } from 'vitest';

import {
  APPLICATION_STATUSES,
  ASSIGNMENT_STATUSES,
  REPORT_STATUSES,
} from './enums.js';
import {
  APPLICATION_TRANSITIONS,
  ASSIGNMENT_TRANSITIONS,
  REPORT_TRANSITIONS,
  allowedTransitions,
  canTransition,
} from './transitions.js';

describe('status lamaran', () => {
  test('mengizinkan PENDING ke REVIEWING', () => {
    expect(canTransition(APPLICATION_TRANSITIONS, 'PENDING', 'REVIEWING')).toBe(
      true,
    );
  });

  test('menolak ACCEPTED kembali ke PENDING', () => {
    expect(canTransition(APPLICATION_TRANSITIONS, 'ACCEPTED', 'PENDING')).toBe(
      false,
    );
  });

  test('menolak lompatan PENDING langsung ke ACCEPTED', () => {
    expect(canTransition(APPLICATION_TRANSITIONS, 'PENDING', 'ACCEPTED')).toBe(
      false,
    );
  });

  test('REJECTED bisa dicapai dari setiap tahap review', () => {
    for (const from of ['PENDING', 'REVIEWING', 'INTERVIEW'] as const) {
      expect(canTransition(APPLICATION_TRANSITIONS, from, 'REJECTED')).toBe(true);
    }
  });

  test('ACCEPTED dan REJECTED tidak punya transisi keluar', () => {
    expect(allowedTransitions(APPLICATION_TRANSITIONS, 'ACCEPTED')).toEqual([]);
    expect(allowedTransitions(APPLICATION_TRANSITIONS, 'REJECTED')).toEqual([]);
  });
});

describe('status laporan mingguan', () => {
  test('laporan yang dikirim bisa diminta revisi lalu dikirim ulang', () => {
    expect(
      canTransition(REPORT_TRANSITIONS, 'SUBMITTED', 'REVISION_REQUESTED'),
    ).toBe(true);
    expect(
      canTransition(REPORT_TRANSITIONS, 'REVISION_REQUESTED', 'SUBMITTED'),
    ).toBe(true);
  });

  test('laporan yang sudah direview tidak bisa dibuka lagi', () => {
    expect(allowedTransitions(REPORT_TRANSITIONS, 'REVIEWED')).toEqual([]);
  });

  test('draft tidak bisa langsung dianggap sudah direview', () => {
    expect(canTransition(REPORT_TRANSITIONS, 'DRAFT', 'REVIEWED')).toBe(false);
  });
});

describe('status penugasan', () => {
  test('harus lewat ACTIVE sebelum COMPLETED', () => {
    expect(canTransition(ASSIGNMENT_TRANSITIONS, 'ONBOARDING', 'ACTIVE')).toBe(
      true,
    );
    expect(
      canTransition(ASSIGNMENT_TRANSITIONS, 'ONBOARDING', 'COMPLETED'),
    ).toBe(false);
  });
});

// Guard struktural: menambah status baru tanpa memutuskan transisinya akan
// membuat test ini merah, bukan lolos diam-diam.
describe('kelengkapan tabel transisi', () => {
  test('setiap status lamaran punya baris di tabel', () => {
    expect(Object.keys(APPLICATION_TRANSITIONS).sort()).toEqual(
      [...APPLICATION_STATUSES].sort(),
    );
  });

  test('setiap status laporan punya baris di tabel', () => {
    expect(Object.keys(REPORT_TRANSITIONS).sort()).toEqual(
      [...REPORT_STATUSES].sort(),
    );
  });

  test('setiap status penugasan punya baris di tabel', () => {
    expect(Object.keys(ASSIGNMENT_TRANSITIONS).sort()).toEqual(
      [...ASSIGNMENT_STATUSES].sort(),
    );
  });

  test('tidak ada tujuan transisi yang bukan status sah', () => {
    for (const targets of Object.values(APPLICATION_TRANSITIONS)) {
      for (const target of targets) {
        expect(APPLICATION_STATUSES).toContain(target);
      }
    }
  });
});
