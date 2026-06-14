import type { StudentStatsSummaryDto } from "@burro/shared";
import { api } from "../../lib/api";

export function fetchStatsSummary(): Promise<StudentStatsSummaryDto> {
  return api.get<StudentStatsSummaryDto>("/student/stats/summary");
}
