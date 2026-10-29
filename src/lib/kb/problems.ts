// The problems inside a merged ticket, by what each report shows, not by its subject or intake tag.
// Every report counts under its cause (causes.ts), where the desk files it. A report the desk read
// as a one-day move (desk-notes.json) is not a flipped date: it also counts under its own problem,
// as the desk's footnote does (readAs).
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day move' | 'unplaced';
export const PROBLEMS: readonly Problem[] = ['parser', 'hint', 'one-day move', 'unplaced'];

export function problemsOf(r: Report, t: Tenant | undefined, oneDayMove: readonly string[]): Problem[] {
  const filed: Problem = causeOf(r, t) ?? 'unplaced';
  return oneDayMove.includes(r.id) ? [filed, 'one-day move'] : [filed];
}

export type ProblemGroup = { problem: Problem; reports: Report[]; alsoIn: Problem[]; tenants: number; firstSeen: string; lastSeen: string };

export function problemsIn(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { merged: Report[]; groups: ProblemGroup[] } {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const groups = PROBLEMS.map((problem) => {
    const rs = merged.filter((r) => problemsOf(r, tenantOf(r), oneDayMove).includes(problem));
    const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
    const alsoIn = [...new Set(rs.flatMap((r) => problemsOf(r, tenantOf(r), oneDayMove)))].filter((p) => p !== problem);
    return { problem, reports: rs, alsoIn, tenants: new Set(rs.map((r) => r.tenant)).size, firstSeen: days[0], lastSeen: days[days.length - 1] };
  }).filter((g) => g.reports.length > 0);
  return { merged, groups };
}
