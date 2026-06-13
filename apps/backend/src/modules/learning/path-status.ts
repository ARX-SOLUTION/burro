import type { ModuleCardDto, ModuleCardStatus } from "@burro/shared";
import type { ModuleProgressRecord } from "./learning.ports";

/**
 * Maps the per-module progress rows into the five UI statuses the learning path
 * uses. Rules, applied in order per module:
 *  - premium gate wins: a premium module without an active grant is
 *    `premium_locked` regardless of progress (gate access only, never mutate).
 *  - `completed` progress -> `completed`.
 *  - `in_progress` progress -> `current`.
 *  - `locked` progress -> `locked` (sequencing already enforced in the DB).
 *  - `not_started` or no row yet -> `available` (the next reachable module).
 *
 * The stored `student_module_progress.status` already encodes the available vs
 * locked sequencing, so we trust it rather than recomputing a frontier.
 */
export function mapPathStatuses(
  records: ModuleProgressRecord[],
  hasActivePremium: boolean
): ModuleCardDto[] {
  return records.map((record) => ({
    id: record.moduleId,
    sequenceNo: record.sequenceNo,
    title: record.title,
    description: record.description,
    estimatedMinutes: record.estimatedMinutes,
    status: resolveStatus(record, hasActivePremium),
    progressPercent: record.progressPercent,
    premiumRequired: record.premiumRequired
  }));
}

/** Resolves a single module's UI status from its progress + the premium gate. */
export function resolveStatus(record: ModuleProgressRecord, hasActivePremium: boolean): ModuleCardStatus {
  if (record.premiumRequired && !hasActivePremium) {
    return "premium_locked";
  }
  switch (record.progressStatus) {
    case "completed":
      return "completed";
    case "in_progress":
      return "current";
    case "locked":
      return "locked";
    default:
      // not_started or no progress row: the next module the student can begin.
      return "available";
  }
}
