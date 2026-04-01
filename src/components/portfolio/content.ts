import type { PortfolioEntry, SectionKey } from "./types";

export const sectionLabels: Record<SectionKey, string> = {
  experience: "experience",
  projects: "projects",
  other: "other",
};

export const sectionOrder: SectionKey[] = ["experience", "projects", "other"];

export const entries: PortfolioEntry[] = [
  {
    id: "exp-studio-systems",
    section: "experience",
    title: "Software Engineer, Borderpass",
    overview: "Built AI & automation tools for legaltech workflows.",
    metadata: [
      { label: "Location", value: "Toronto", icon: "MapPin" },
      {
        label: "Timeline",
        value: "May 2025 - Aug 2026 (12 months intern, 4 months part-time)",
        icon: "CalendarRange",
      },
      {
        label: "Tools",
        value: ["TypeScript", "Python:", "Next.js", "PostgreSQL", "AWS", "GraphQL"],
        icon: "Shapes",
      },
    ],
    markdown: `## Overview\n
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla tincidunt dictum metus, vitae laoreet massa elementum vitae.

## What I focused on\n
- Shipping reliable internal dashboards for team visibility.
- Reducing release friction with CI quality gates.
- Improving onboarding with architecture docs and starter templates.

![System planning placeholder](/placeholders/placeholder-1.svg)

## Outcomes\n
Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Aenean elementum, velit non gravida sodales, ipsum neque facilisis dolor, et hendrerit arcu nibh non elit.
`,
  },
  {
    id: "proj-portfolio-console",
    section: "projects",
    title: "Portfolio Console",
    overview:
      "An experimental, terminal-inspired portfolio with markdown-authored stories.",
    metadata: [
      {
        label: "Stack",
        value: ["Astro", "React", "Tailwind CSS", "TypeScript"],
        icon: "Shapes",
      },
      { label: "Date", value: "Mar 2026", icon: "CalendarRange" },
      { label: "Duration", value: "2 weeks", icon: "CalendarRange" },
      { label: "Team", value: "Solo project", icon: "User" },
      {
        label: "Links",
        value: ["demo.example.com", "github.com/example/portfolio-console"],
        icon: "Link2",
      },
    ],
    markdown: `## Project Story\n
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed in arcu odio. Integer a tellus neque. Morbi fermentum vehicula convallis.

![Interface placeholder](/placeholders/placeholder-2.svg)

## Architecture\n
Curabitur mollis turpis in lorem pharetra, quis posuere lorem pulvinar. In hac habitasse platea dictumst. Maecenas iaculis hendrerit nunc in sagittis.

### Notes\n
Aenean condimentum varius velit, id finibus est tempus sit amet. Pellentesque tempor malesuada erat, vel feugiat eros rutrum in.
`,
  },
  {
    id: "other-writing-lab",
    section: "other",
    title: "Writing + Research Lab",
    overview:
      "A running archive of notes, process writeups, and visual references.",
    metadata: [
      { label: "Type", value: "Archive", icon: "BookOpen" },
      {
        label: "Format",
        value: "Markdown notes + image boards",
        icon: "FileText",
      },
      { label: "Status", value: "Ongoing", icon: "CalendarRange" },
    ],
    markdown: `## Why this exists\n
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam ac nibh et mauris gravida interdum.

- Drafts for ideas in progress.
- Research snippets and annotated references.
- Iteration logs and design rationale.

![Research placeholder](/placeholders/placeholder-3.svg)

## Future\n
Donec auctor malesuada nulla, in lacinia nulla feugiat et. Nunc pulvinar nunc eget diam malesuada malesuada.
`,
  },
];

export const getEntriesBySection = (section: SectionKey) =>
  entries.filter((entry) => entry.section === section);
