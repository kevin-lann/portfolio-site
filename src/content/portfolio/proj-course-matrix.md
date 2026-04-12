---
title: Course Matrix
section: projects
overview: Agentic timetable builder platform for students
order: 20
links:
  - label: GitHub
    href: https://github.com/UTSC-CSCC01-Software-Engineering-I/Course-Matrix
metadata:
  - label: Stack
    value:
      - NodeJS (Express)
      - PostgreSQL (Supabase)
      - Pinecone
      - Vercel AI SDK
      - Langchain
      - OpenAI API
      - React
      - Tailwind
      - Microsoft Azure
    icon: Shapes
  - label: Date
    value: Mar 2025
    icon: CalendarRange
  - label: Duration
    value: 2 months
    icon: CalendarRange
  - label: Team
    value: Thomas Yang, Masahisa Sekita, Austin Xu, Minh Tran, Myself
    icon: User
  - label: Links
    value:
      - text: GitHub
        url: https://github.com/UTSC-CSCC01-Software-Engineering-I/Course-Matrix
    icon: Link2
---
![course matrix banner](/imgs/course-matrix-banner.png)
# Overview

Course Matrix is an <u>intelligent course timetable builder</u> that generates an optimal timetable for you based on a specific set of restrictions. It also leverages an <u>AI agent</u> that easily translates complex requirements into personalized timetables.
![course matrix timetable](/imgs/course-matrix-timetable.png)
I built out the AI infrastructure behind this project. It uses the following tools:
- **Pinecone** to store vectorized indices of course info and offering info (semester, timeslot, remote/in-person etc)
- **LangChain** to orchestrate the RAG pipeline
- **Vercel AI SDK** to handle text streaming
- <a href="https://www.assistant-ui.com/" target="_blank" rel="noopener noreferrer">assistant-ui</a> to bring a chat/thread based UX to the app and to store conversations

# ChatGPT-like UX
I added a lot of functionality to the client-side experience when interacting with the chatbot. The app supports multiple conversations, thread branching, message edit + resend, message copying, and more. Conversation threads are persisted to <a href="https://accounts.assistant-ui.com" target="_blank" rel="noopener noreferrer">assistant-ui cloud</a>.
![course matrix chat interface](/imgs/course-matrix-chat-interface.png)

# Agent Pipeline
A major goal of ours was to provide an AI agent that balanced speed and response quality. I tested various approaches and ended up with a dual-mode chat flow, with one mode being question-and-answer-based (e.g., "What 3rd year math courses can I take in Winter 2026 that satisfy my degree requirements?") and the other being action-based (e.g., "Generate me a timetable that follows criteria X, Y, Z."). These are the pipeline steps:
1. **Determine Mode**: Mode is determined by the query prefix. In the UI, the user is prompted to use the command `/timetable` to trigger the agentic flow in which the system uses tool calling to perform a task. Otherwise, the flow defaults to Q&A.
![course matrix chat 2](/imgs/course-matrix-chat-2.png)
2. **Q&A mode**:

-  **Reformulate Query**: I found that if the user's raw query were used as the search prompt within our vector DB, the search results often lacked full context. In a multi-message conversation, previous messages add context to the most recent message.

-  **Filter by namespace**: Our vector indices are sorted into namespaces on Pinecone, which are essentially buckets for similar documents. We have namespaces for courses, offerings, programs, prerequisites, corequisites, and departments. This allows us to speed up vector searches by narrowing our search to the most relevant group of documents.
-  **Build response**: Given the last few messages in the conversation history and the retrieval results, another call is made to the LLM to write a response.
3. **Agentic mode**: In this flow, tool calls are made by the agent. Results are returned and the agent can determine whether to make another tool call or return a response. This is implemented using Vercel's AI SDK.
```ts
generateTimetable: tool({
    description:
        "Return a list of possible timetables based on provided courses and restrictions.",
    parameters: TimetableFormSchema,
    execute: async (args) => {
        console.log("restrictions :", JSON.stringify(args.restrictions));
        const data = await availableFunctions.generateTimetable(
          args,
          req,
        );
        console.log("Generated timetable: ", data);
        return data;
    },
}),
```
4. **Stream response**: The AI SDK streams response data using Server-Sent Events (SSE), which sends data in chunks to avoid a long wait time. The response is rendered with full markdown capabilities as well as in-app hyperlinks.
```ts
const result = streamText({
    model: openai("gpt-4o-mini"),
    system: `System prompt ...`,
    messages,
    tools: {...},
    maxSteps: CHATBOT_TOOL_CALL_MAX_STEPS, 
})
result.pipeDataStreamToResponse(res);
```
![course matrix chat 1](/imgs/course-matrix-chat-1.png)

# Data Extraction
Course data is scraped from the school's course search site. Offering data is scraped from the school's timetable archive, which is downloadable as PDFs. I wrote a script that extracts data from these sources using regex matching and PDF tooling in Python, namely pdfplumber.

# Timetable Generation
This uses a backtracking algorithm to output the top 10 timetables consisting of all selected course sessions and meeting all time restrictions. Restrictions include blocking off certain times, setting a maximum number of days per week, and more. Results are shuffled for better randomness (variation).

![course matrix course list](/imgs/course-matrix-course-list.png)

# Other contributions I made
- Email notifications: Used a cron job and the Brevo email API to send opt-in notifications when a class is starting soon
- Timetable Diffing (comparison): Share and compare timetables with friends to align schedules side by side
