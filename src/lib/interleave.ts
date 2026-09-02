/**
 * Round-robin a set of groups into one list, so consecutive items come from
 * different groups.
 *
 * The visual index and the strip on /work were both built project by project,
 * which meant every work's images sat together in a block: three shots of the
 * same show, then three of the next. Taking one from each group in turn spreads
 * them, and the page reads as a survey rather than as clumps.
 *
 * Order within a group is preserved, so a project's own sequence still holds.
 */
export function interleave<T>(groups: T[][]): T[] {
  const out: T[] = [];
  let longest = 0;
  for (const g of groups) if (g.length > longest) longest = g.length;
  for (let i = 0; i < longest; i++) {
    for (const g of groups) if (i < g.length) out.push(g[i]);
  }
  return out;
}
