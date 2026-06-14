import type { ModuleCardDto } from "@burro/shared";

// Local re-export keeps existing imports working; the canonical type lives in
// @burro/shared (docs/13 §7).
export type { ModuleCardDto };
export type ModuleStatus = ModuleCardDto["status"];

/**
 * Dev fallback path. Mirrors the 8-node reference (`docs/design/reference-screens/20-modules-path.png`):
 *   m1 completed · m2 current · m3-5 available · m6 premium_locked · m7-8 locked.
 * Arabic glyphs come from the reference screenshot so the path view renders
 * the same labels even before the backend seeds module text.
 */
export const mockStudentModules: ModuleCardDto[] = [
  {
    id: "module-alif-ba-ta",
    sequenceNo: 1,
    title: "Alif, ba, ta",
    description: "3 ta harf bo'yicha mashq.",
    estimatedMinutes: 6,
    status: "completed",
    progressPercent: 100,
    premiumRequired: false
  },
  {
    id: "module-sa-jim-ha",
    sequenceNo: 2,
    title: "Sa, jim, ha",
    description: "3 ta harf bo'yicha mashq.",
    estimatedMinutes: 6,
    status: "current",
    progressPercent: 35,
    premiumRequired: false
  },
  {
    id: "module-tas",
    sequenceNo: 3,
    title: "Tas",
    description: "Tas harfini ko'rish va tinglash.",
    estimatedMinutes: 6,
    status: "available",
    progressPercent: 0,
    premiumRequired: false
  },
  {
    id: "module-thaa",
    sequenceNo: 4,
    title: "Thaa",
    description: "Thaa harfini ko'rish va tinglash.",
    estimatedMinutes: 6,
    status: "available",
    progressPercent: 0,
    premiumRequired: false
  },
  {
    id: "module-jeem",
    sequenceNo: 5,
    title: "Jeem",
    description: "Jeem harfini ko'rish va tinglash.",
    estimatedMinutes: 6,
    status: "available",
    progressPercent: 0,
    premiumRequired: false
  },
  {
    id: "module-haa",
    sequenceNo: 6,
    title: "Haa",
    description: "Haa harfini ko'rish va tinglash.",
    estimatedMinutes: 8,
    status: "premium_locked",
    progressPercent: 0,
    premiumRequired: true
  },
  {
    id: "module-khaa",
    sequenceNo: 7,
    title: "Khaa",
    description: "Khaa harfini ko'rish va tinglash.",
    estimatedMinutes: 8,
    status: "locked",
    progressPercent: 0,
    premiumRequired: false
  },
  {
    id: "module-daal",
    sequenceNo: 8,
    title: "Daal",
    description: "Daal harfini ko'rish va tinglash.",
    estimatedMinutes: 8,
    status: "locked",
    progressPercent: 0,
    premiumRequired: false
  }
];

export function fetchStudentModulesMock(): Promise<ModuleCardDto[]> {
  return Promise.resolve(mockStudentModules.map((module) => ({ ...module })));
}

export function findModuleById(moduleId: string): ModuleCardDto | undefined {
  return mockStudentModules.find((module) => module.id === moduleId);
}
