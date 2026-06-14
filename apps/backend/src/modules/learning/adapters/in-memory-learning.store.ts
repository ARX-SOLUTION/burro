import { Injectable } from "@nestjs/common";
import type { LearningStorePort, ModuleProgressRecord, ModuleResultStats } from "../learning.ports";

@Injectable()
export class InMemoryLearningStore implements LearningStorePort {
  private readonly path = new Map<string, ModuleProgressRecord[]>();
  private readonly premium = new Set<string>();
  private readonly stats = new Map<string, ModuleResultStats>();

  /** Test helper: seed a student's ordered path. */
  setPath(studentId: string, records: ModuleProgressRecord[]): void {
    this.path.set(studentId, records);
  }

  /** Test helper: grant active premium. */
  setActivePremium(studentId: string): void {
    this.premium.add(studentId);
  }

  /** Test helper: seed module result stats. */
  setResultStats(studentId: string, moduleId: string, stats: ModuleResultStats): void {
    this.stats.set(`${studentId}:${moduleId}`, stats);
  }

  async listPath(studentId: string): Promise<ModuleProgressRecord[]> {
    return this.path.get(studentId) ?? [];
  }

  async getModuleProgress(studentId: string, moduleId: string): Promise<ModuleProgressRecord | undefined> {
    return (this.path.get(studentId) ?? []).find((record) => record.moduleId === moduleId);
  }

  async hasActivePremiumGrant(studentId: string): Promise<boolean> {
    return this.premium.has(studentId);
  }

  async getModuleResultStats(studentId: string, moduleId: string): Promise<ModuleResultStats> {
    return (
      this.stats.get(`${studentId}:${moduleId}`) ?? {
        xpEarned: 0,
        correctCount: 0,
        totalAnswered: 0,
        finalQuizBestScore: null,
        finalQuizPassed: false
      }
    );
  }
}
