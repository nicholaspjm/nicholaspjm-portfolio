/**
 * Selected Works: the curated, hand-ordered highlight reel shown first on the
 * homepage. Driven by the "content/selected works/" folder tree; the number
 * prefix on each folder name ("01 the-xx-festival-tour") sets the order.
 * Rename, add, or remove folders there, then run `npm run scan-images`.
 */
import { structure } from "@/content/structure";

export const selectedWorks: string[] = structure.selected;
