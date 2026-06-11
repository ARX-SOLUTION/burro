export type ModuleStatus = "completed" | "current" | "available" | "locked" | "premium_locked";

export interface ModuleCardDto {
  id: string;
  sequenceNo: number;
  title: string;
  description: string;
  estimatedMinutes: number | null;
  status: ModuleStatus;
  progressPercent: number;
  premiumRequired: boolean;
}

export const mockStudentModules: ModuleCardDto[] = [
  {
    id: "module-vowels-1",
    sequenceNo: 1,
    title: "Unli tovushlar",
    description: "Qisqa va cho‘ziq unlilarni eshitib ajratish.",
    estimatedMinutes: 8,
    status: "completed",
    progressPercent: 100,
    premiumRequired: false
  },
  {
    id: "module-letters-1",
    sequenceNo: 2,
    title: "Harflar: Alif",
    description: "Alif harfi va uning tovushini topish mashqlari.",
    estimatedMinutes: 12,
    status: "current",
    progressPercent: 62,
    premiumRequired: false
  },
  {
    id: "module-letters-ba",
    sequenceNo: 3,
    title: "Harflar: Ba",
    description: "Ba harfini ko‘rish, tinglash va to‘g‘ri tanlash.",
    estimatedMinutes: 10,
    status: "available",
    progressPercent: 0,
    premiumRequired: false
  },
  {
    id: "module-letters-ta",
    sequenceNo: 4,
    title: "Harflar: Ta",
    description: "Ta harfi bilan boshlanadigan tovushlarni mustahkamlash.",
    estimatedMinutes: 11,
    status: "premium_locked",
    progressPercent: 0,
    premiumRequired: true
  },
  {
    id: "module-listening-1",
    sequenceNo: 5,
    title: "Eshitib topish",
    description: "Tovushni tinglab mos harfni tanlash.",
    estimatedMinutes: 14,
    status: "locked",
    progressPercent: 0,
    premiumRequired: true
  },
  {
    id: "module-sounds-throat",
    sequenceNo: 6,
    title: "Halq tovushlari",
    description: "Arab tilidagi chuqur talaffuz tovushlariga kirish.",
    estimatedMinutes: 15,
    status: "premium_locked",
    progressPercent: 0,
    premiumRequired: true
  }
];

export function fetchStudentModulesMock(): Promise<ModuleCardDto[]> {
  return Promise.resolve(mockStudentModules.map((module) => ({ ...module })));
}

export function findModuleById(moduleId: string): ModuleCardDto | undefined {
  return mockStudentModules.find((module) => module.id === moduleId);
}
