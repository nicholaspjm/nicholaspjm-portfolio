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
    year: "2025",
    title: "Cat Among Animals, Oddany Gallery",
    detail:
      "Naarm / Melbourne. Headline audiovisual performance with Steve Pan.",
  },
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
  {
    year: "—",
    title: "Featured artist, TouchDesigner Official Instagram (Derivative)",
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
    title: "Bachelor of Computer Science",
    detail:
      "University of Auckland, Aotearoa New Zealand. Completed alongside a full arts degree — the engineering half of a double degree, and the systems rigour behind every show since.",
  },
  {
    year: "2021",
    title: "Bachelor of Arts",
    detail:
      "University of Auckland, Aotearoa New Zealand. The critical half of the double degree — theory and writing that keep the machines honest.",
  },
  {
    year: "2021–",
    title: "Industry software development",
    detail:
      "Professional software engineering practice before moving to stages — production code, versioned and tested, now applied to rooms and shows.",
  },
];
