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
    title: "Software Engineer, Borderpass (2025-26)",
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
        value: [
          "TypeScript",
          "Python",
          "Next.js",
          "PostgreSQL",
          "AWS",
          "GraphQL",
        ],
        icon: "Shapes",
      },
    ],
    links: [{ label: "Site", href: "https://www.borderpass.ai/" }],
    markdown: `
# Overview\n
Borderpass is a legaltech startup that streamlines immigration pathways for individuals coming to Canada. I contributed over several core features and products since joining the team in May 2025. 

# My key contributions \n
- Leveraged **AI vision models** such as **Google Gemini** to read & extract information from user documents, constructing a comprehesive overview of applicant information
- Developed headless **Puppeteer** automations for performing browser-based tasks such as form submissions, resulting in hundreds of hours saved for the operations team weekly
- Delivered an end-to-end **AI Job Search Tool** which produces LLM synthesized filters based off of user resumes to perform a web crawl of popular job sites, returning a personalized list of job postings in seconds
- Designed, built, and maintained several core **AWS lambda functions** for document processing and integration

# Personalized Job Search Tool
A major project I led was a personalized job search tool that leverages document context (stored as vector embeddings) to generate personalized search filters for a given job seeker. It then uses Scrapy (A Python based web crawler) to perform a web crawl of popular job sites, returning a custom list of job postings in seconds.

## Architecture
Scrapy crawler is hosted on an AWS lambda split into staging and prod environments. 

![Architecture diagram](/imgs/job-search-architecture.png)

1. User triggers run from the app frontend by REST API call to server, which is then queued up for processing by the crawler lambda. THe operation is asynchrounous so the user is not blocked. Response is polled for every 1 secound.
  a. An optional description that the user enters is passed in the request. The selected resume content is also passed.
  \`\`\`json
  {
    resumeContent: ResumeContentSection[], // Taken from Resume table
    description: string, // User fills out in frontend
  }
  \`\`\` 
2. Lambda handler recieves request and starts by **Generating Filters** using GPT-4o. These are relevant to the user's info given from their description and resume.
\`\`\`json
{
  keywords: ["Dancer", "Singer", "Musician"],
  province: "ON",
  employment_conditions: ["Day", "Night", "Weekend"],
  hours_of_work: ["Full time"],
  salary: "60,000+",
  work_location: ["On site", "Hybrid"],
  education_or_training: ["College or apprenticeship"],
  years_of_experience: ["1 year to less than 3 years"],
}
\`\`\`
3. **Construct Job bank URL**: To kick off the search, the url is customized with specific query parameters. Ex:
  
\`https://www.jobbank.gc.ca/jobsearch/job_search_advanced.xhtml?fn21=21211&fper=F&fwcl=D&term=data+scientist&sort=M&fprov=ON&fskl=%C2%AC100000&fskl=%C2%AC100001&fskl=%C2%AC15141\`
  
  - fper=F filters by full time jobs only
  - fwcl=D filters by $40,000-$59,999 salary jobs
  - term=data+scientist filters by keyword search for "data scientist"
  - fprov=ON filters by province = Ontario
  - fksl=... filters by work locations like On site, remote, hybrid etc
  - Likewise for other filters

4. **View and extract results**: Scraping kicks in. It navigates to the URL generated with the filter query params. Parses the HTML and finds target job postings. For each individual result, it clicks on the link. This opens up a page with the specific details of that job. It then extracts the basic info provided in the "Job Details" card. 

5. **Follow Links**. If the job posting is from an external link such as Indeed or LinkedIn, the crawler navigates to those links and extracts further job details from there.

6. **Storing Results**: Each job posting is stored as so:
\`\`\`json
{
  job_title: "Lead Data Scientist, AI and Technology Strategy",
  employer_name: "RBC Dominion Securities",
  job_description: "...",
  location: "Ottawa, ON",
  work_setting: "On-site",
  salary: "79,000 to 119,000 annually",
  work_type: "Permanent Employment Full-time",
  start_date: "As soon as possible",
  job_source: "Indeed.com"
  link: "https://ca.indeed.com/viewjob?jk=2ba329de2f81eb23" // or job bank link if its not external
  is_external: true
}
\`\`\`
7. **Filter Data** Feed the results into GPT 4o and have it return the top K results by judging against the user's description and resume.
8. **Display Results**: The results are displayed in the frontend to the user after polling returns true.

Users can also save their favourite results and view search history.

# Workflow Automation
An ongoing project I contributed to was a headless browser automation tool built with Python, Puppeteer, and Google Gemini. It mixes tranditional browser based automation with improvisational capabilities of LLM's to perform repetitive online form submissions in order to save manual labor.
The main challenge of working on this automation was balancing several moving pieces. The automation is must follow a strict series of steps that are logged and reported by the server and integrations such as Slack. It has the capability to read/parse emails, upload and download files, and perform complex form submissions in a headless browser.
The automation is deployed on an EC2 instance with a configurable cron scedule to perform runs daily.
I helped bridge a lot of these gaps and helped bring up the overall reliability of the bot through resolving bot detection issues, improving memory usage, and managing async workflows to ensure tasks like email verification codes are read before proceeding with the next step in the workflow.

## Integration with Internal Systems
A core architectural problem with the automation was that it was split from the main application codebase. This meant that complex business logic needed to be translated over from Typescript to Python when adding new decision flows each time. 
I abstracted this away by introducing a REST API interface allowing the automation to communicate with the main API server essentially offshoring the business logic decisions to be made from there. This signifigantly improved the maintainability of the automation and reduced the chances of incorrect business logic being copied over.

![System planning placeholder](/placeholders/placeholder-1.svg)
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
    links: [
      { label: "Demo", href: "https://demo.example.com" },
      { label: "GitHub", href: "https://github.com/example/portfolio-console" },
    ],
    markdown: `# Project Story\n
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
    links: [
      { label: "GitHub", href: "https://github.com/example/writing-lab" },
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
