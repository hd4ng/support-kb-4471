<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { problemsIn, type Problem } from '#lib/kb/problems';

  // tickets: where each problem is filed now, problem → URL.
  let { ticket, tickets = {} }: { ticket: number; tickets?: Partial<Record<Problem, string>> } = $props();

  const result = $derived(problemsIn(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const raw = (reports as Report[]).length;
  const num = (url: string) => url.replace(/.*\/issues\//, '#');
</script>

<p class="sum">
  <strong>{result.merged.length}</strong> reports merged into #{ticket} ({raw} rows in the export, {raw - result.merged.length} of them repeats) ·
  <strong>{result.groups.length}</strong> problems
</p>

<table>
  <thead><tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr></thead>
  <tbody>
    {#each result.groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td>{g.reports.length}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if tickets[g.problem]}<a href={tickets[g.problem]}>{num(tickets[g.problem]!)}</a>{:else}none yet{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each result.groups as g (g.problem)}
  {#each g.alsoIn as other (other)}
    {@const shared = g.reports.filter((r) => result.groups.find((x) => x.problem === other)?.reports.includes(r)).length}
    {#if g.problem === 'one-day move'}
      <p class="note">The {shared} <code>{g.problem}</code> reports are filed under <code>{other}</code> by tenant, so they count in both rows.</p>
    {/if}
  {/each}
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .note { color: var(--muted); font-size: 0.85em; }
</style>
