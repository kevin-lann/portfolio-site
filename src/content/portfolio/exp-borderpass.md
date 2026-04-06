---
title: Software Engineer, Borderpass (2025-26)
section: experience
overview: Built AI & automation tools for legaltech workflows.
order: 10
links:
  - label: Site
    href: https://www.borderpass.ai/
metadata:
  - label: Location
    value: Toronto
    icon: MapPin
  - label: Timeline
    value: May 2025 - Aug 2026 (12 months intern, 4 months part-time)
    icon: CalendarRange
  - label: Tools
    value:
      - TypeScript
      - Python
      - Next.js
      - NodeJS (Express) + GraphQL
      - PostgreSQL
      - AWS
      - Terraform
      - OpenAI, Gemini APIs
    icon: Shapes
---

![Borderpass Banner](/imgs/bp-banner.png)

# Overview

[Borderpass](https://www.borderpass.ai/) is a legaltech startup that streamlines immigration pathways for individuals coming to Canada. I contributed over several core features and products since joining the team in May 2025.

# My key contributions

- Leveraged **AI vision models** such as **Google Gemini** to read and extract information from user documents, constructing a comprehensive overview of applicant information.
- Developed headless **Puppeteer** automations for performing browser-based tasks such as form submissions, resulting in hundreds of hours saved for the operations team weekly.
- Delivered an end-to-end **AI Job Search Tool** which produces LLM synthesized filters based off user resumes to perform a web crawl of popular job sites, returning a personalized list of job postings in seconds.
- Designed, built, and maintained several core **AWS lambda functions** for document processing and integration.

# Personalized Job Search Tool

A major project I led was a personalized job search tool that leverages document context (stored as vector embeddings) to generate personalized search filters for a given job seeker. It then uses Scrapy (a Python-based web crawler) to crawl popular job sites, returning a custom list of job postings in seconds.

## Architecture

Scrapy crawler is hosted on an AWS lambda split into staging and prod environments.

![Architecture diagram](/imgs/job-search-architecture.png)

1. User triggers run from the app frontend by REST API call to server, which is then queued up for processing by the crawler lambda. The operation is asynchronous so the user is not blocked. Response is polled for every second.
   An optional description that the user enters is passed in the request. The selected resume content is also passed.

```json
{
  "resumeContent": "ResumeContentSection[]",
  "description": "string"
}
```

2. Lambda handler receives request and starts by **Generating Filters** using GPT-4o. These are relevant to the user info given from their description and resume.

```json
{
  "keywords": ["Dancer", "Singer", "Musician"],
  "province": "ON",
  "employment_conditions": ["Day", "Night", "Weekend"],
  "hours_of_work": ["Full time"],
  "salary": "60,000+",
  "work_location": ["On site", "Hybrid"],
  "education_or_training": ["College or apprenticeship"],
  "years_of_experience": ["1 year to less than 3 years"]
}
```

3. **Construct Job Bank URL**: To kick off the search, the URL is customized with specific query parameters.

`https://www.jobbank.gc.ca/jobsearch/job_search_advanced.xhtml?fn21=21211&fper=F&fwcl=D&term=data+scientist&sort=M&fprov=ON&fskl=%C2%AC100000&fskl=%C2%AC100001&fskl=%C2%AC15141`

- `fper=F` filters by full-time jobs only.
- `fwcl=D` filters by salary range.
- `term=data+scientist` filters by keyword search.
- `fprov=ON` filters by province.
- `fskl=...` filters by work locations like onsite, remote, hybrid.

4. **View and extract results**: Scraping navigates to the URL generated with filter query params. It parses HTML and finds target postings. For each result, it opens the detail page and extracts the job details card.
5. **Follow links**: If the posting is from an external source such as Indeed or LinkedIn, the crawler follows that link and extracts more details.
6. **Store results**: Each job posting is stored in a normalized format.

```json
{
  "job_title": "Lead Data Scientist, AI and Technology Strategy",
  "employer_name": "RBC Dominion Securities",
  "job_description": "...",
  "location": "Ottawa, ON",
  "work_setting": "On-site",
  "salary": "79,000 to 119,000 annually",
  "work_type": "Permanent Employment Full-time",
  "start_date": "As soon as possible",
  "job_source": "Indeed.com",
  "link": "https://ca.indeed.com/viewjob?jk=2ba329de2f81eb23",
  "is_external": true
}
```

7. **Filter data**: Feed the results into GPT-4o and return the top K results judged against the user description and resume.
8. **Display results**: Results are displayed in the frontend after polling returns complete.

![Job Search Tool](/imgs/job-search-page-1.png)
![Job Search Tool](/imgs/job-search-page-2.png)

Users can also save favorite results and view search history.

# Workflow Automation

An ongoing project I contributed to was a **headless browser automation tool** built with **Python**, **Puppeteer**, and **Google Gemini**. It mixes traditional browser-based automation with improvisational capabilities of LLMs to perform repetitive online form submissions and reduce manual labor.

![Automation](/imgs/automation-2.png)

The main challenge was balancing several moving pieces. The automation must follow a strict sequence of steps that are logged and reported by the server and integrations such as Slack. It can read and parse emails, upload and download files, and perform complex form submissions in a headless browser.

## Deployment

The automation is deployed on an EC2 instance with a configurable cron schedule to perform daily runs.

## Improvements

I helped improve reliability by resolving bot detection issues, improving memory usage, and managing async workflows to ensure tasks like email verification code retrieval finish before proceeding.

## Integration with Internal Systems

A core architectural problem with the automation was that it was split from the main application codebase. This meant that complex business logic needed to be translated from TypeScript to Python when adding decision flows.

![Automation](/imgs/automation-3.png)

A major refactor I did was introducing a **REST API** interface allowing the automation to communicate with the main API server, which offloaded business logic decisions to the existing backend. This significantly improved maintainability and reduced the risk of business-logic drift.
