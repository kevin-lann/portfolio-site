---
title: Knockouts
section: projects
overview: Realtime multiplayer trivia game
order: 40
links:
  - label: Demo
    href: https://knockouts.vercel.app/
  - label: GitHub
    href: https://github.com/kevin-lann/knockouts
metadata:
  - label: Stack
    value:
      - Partykit (Cloudflare Workers/Durable Objects)
      - NextJs
      - Tailwind
      - Vercel
      - Supabase
      - Python

    icon: Shapes
  - label: Date
    value: May 2026
    icon: CalendarRange
  - label: Duration
    value: 2 weeks
    icon: CalendarRange
  - label: Team
    value: Solo Project
    icon: User
  - label: Links
    value:
      - text: Demo
        url: https://knockouts.vercel.app/
      - text: GitHub
        url: https://github.com/kevin-lann/knockouts
    icon: Link2
---

![Knockouts banner](/imgs/knockouts-banne.png)

# Overview
Knockouts is a real-time multiplayer game I built with the <a href="https://www.partykit.io/" target="_blank" rel="noopener noreferrer">PartyKit framework</a> (Cloudflare Workers + Durable Objects), NextJS, Vercel, and Supabase. My goal with this project was to build a dynamically scalable architecture that spins up new rooms as players create them and to make the game as performant as possible.

![Knockouts 1](/imgs/knockouts-2.png)

# Architecture
PartyKit is a real-time app framework that builds on top of Cloudflare Workers + Durable Objects. Each server represents a room that players join (public or private) and acts as an isolated state machine handling the game for that group of players. The server and client side communicate with WebSockets for instant feedback.

![Knockouts menu](/imgs/knockouts-menu.png)

# Features
- Public/Private room scoping with room codes
- Ability to add bots (easy, medium, chaos difficulties)
- Game settings: speed, bot count, theme selection
- Built in reconnection
- Avatar selection (Hand drawn!)

# Question generation
- Questions are generated in batches with Gemini Flash
- The pipeline needs to handle thousands of questions, each with dozens of answers. I wrote a python script to orchestrate multiple AI calls, handle deduplication, manage context, and validate answers. It essentially runs in a loop until it enough unique questions have been generated per difficulty level and theme.







