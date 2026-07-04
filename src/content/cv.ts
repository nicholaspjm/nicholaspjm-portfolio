/**
 * Curriculum vitae data — awards, press, performances, teaching, education.
 * Rendered on the homepage (short list) and the /info page (full).
 */

export interface CVEntry {
  year: string;
  title: string;
  detail?: string;
  link?: { href: string; label: string };
}

export const performances: CVEntry[] = [
  {
    year: "2026",
    title: "Pitch Music & Arts",
    detail: "Grampian Plains, Victoria. Visual design and live performance.",
  },
  {
    year: "2026",
    title: "Luminous Festival",
    detail: "Presented a commissioned work.",
  },
  {
    year: "2026",
    title: "For The Cause",
    detail: "Naarm / Melbourne. Visual design and live performance.",
  },
  {
    year: "2025",
    title: "For The Cause",
    detail: "Naarm / Melbourne. Visual design and live performance.",
  },
  {
    year: "2025",
    title: "Hybrid 2.0",
    detail: "Live audiovisual performance.",
  },
  {
    year: "2025",
    title: "Platform Presents",
    detail: "Group exhibition, Naarm / Melbourne.",
  },
  {
    year: "2025",
    title: "Reptant",
    detail: "Live visual design.",
  },
  {
    year: "2025",
    title: "Pitch Music & Arts — Far from God, Close to Heaven",
    detail:
      "Grampian Plains, Victoria. Three-hour improvised audiovisual set.",
  },
  {
    year: "2025",
    title: "A3 Festival, Main Stage",
    detail: "Visual design and live performance.",
  },
  {
    year: "2025",
    title: "TESSELATE's TOPIA Festival, Main Stage",
    detail: "Visual design and live performance.",
  },
  {
    year: "—",
    title: "Thread",
    detail: "Ongoing visual design for the club night.",
  },
  {
    year: "—",
    title: "Babie Club",
    detail: "Ongoing visual design for the club night.",
  },
];

/** Local parties, clubs, and festivals I've contributed visual work to. */
export const events: string[] = [
  "Concordia",
  "Pythia",
  "Atmos",
  "Thread",
  "Step Count",
  "A3 Festival",
  "Pitch Music & Arts",
  "Mach1",
  "1800Play",
  "TOPIA",
  "Ode",
  "Order Up",
];

export const awards: CVEntry[] = [
  {
    year: "2026",
    title: "Grammy Award — Best Rock Song",
    detail:
      "Nine Inch Nails, “As Alive As You Need Me To Be”, 68th Annual Grammy Awards, 1 February 2026. Visual design for the Grammy-winning single's official music video.",
  },
];

export const press: CVEntry[] = [
  {
    year: "2026",
    title:
      "Gabriella Brown, “Abstracted organica: The design trend taking root in Naarm, and the designers doing it best”",
    detail: "It's Nice That (The View From…), 16 March 2026.",
  },
  {
    year: "2025",
    title: "“Nine Inch Nails Share ‘As Alive As You Need Me to Be' Music Video”",
    detail: "Rolling Stone Australia, 4 September 2025.",
  },
  {
    year: "2025",
    title: "“2016LYFE — smokedope2016”",
    detail: "Lyrical Lemonade, 13 September 2025.",
  },
];

export const teaching: CVEntry[] = [
  {
    year: "—",
    title: "Touch Collective, Co-founder",
    detail:
      "Regular TouchDesigner workshops, artist talks, and live visual events. Naarm / Melbourne.",
  },
  {
    year: "2025",
    title: "Speaker — Creative Technology Melbourne",
    detail: "Talk on real-time visual systems.",
  },
  {
    year: "—",
    title: "YouTube (@nicholaspjm)",
    detail:
      "Technical TouchDesigner tutorials and creative coding education.",
    link: { href: "https://youtube.com/@nicholaspjm", label: "@nicholaspjm" },
  },
];

export const education: CVEntry[] = [
  {
    year: "2021",
    title: "B.A. Computer Science",
    detail: "University of Auckland.",
  },
  {
    year: "2021",
    title: "B.A. of Arts",
    detail: "University of Auckland.",
  },
  {
    year: "2018",
    title: "上智大学",
  },
];
