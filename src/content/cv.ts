/**
 * Curriculum vitae data: performances, awards, press, teaching, education.
 *
 * The source of truth is content/cv.csv, a spreadsheet you can open in
 * Excel / Numbers / Google Sheets. Edit rows there, save the file back, and
 * run `npm run scan-images` (or restart dev); the scan regenerates
 * src/content/cv-data.ts from it. Rows keep their file order on the site.
 */

export type { CVEntry } from "./cv-data";
export {
  performances,
  awards,
  press,
  teaching,
  education,
} from "./cv-data";
