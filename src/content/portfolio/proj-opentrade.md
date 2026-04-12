---
title: Opentrade
section: projects
overview: A social network for traders
order: 30
links:
  - label: GitHub
    href: https://github.com/kevin-lann/Opentrade
metadata:
  - label: Stack
    value:
      - NodeJS (Express)
      - Python
      - PostgreSQL
      - React
      - Tailwind
      - ShadCN
      - React Echarts

    icon: Shapes
  - label: Date
    value: Apr 2025
    icon: CalendarRange
  - label: Duration
    value: 2 weeks
    icon: CalendarRange
  - label: Team
    value: Thomas Yang, Myself
    icon: User
  - label: Links
    value:
      - text: GitHub
        url: https://github.com/kevin-lann/Opentrade
    icon: Link2
---
# Overview

Opentrade is a social network for traders where you can share watchlists and portfolios, start conversations, visualize S&P 500 stock charts, and run a basic price forecast using <a href="https://pypi.org/project/prophet/" target="_blank" rel="noopener noreferrer">Prophet</a>. This project serves as a proof of concept and does not actually maintain real portfolios or handle real transactions.

![Opentrade portfolio](/imgs/stock-social-portfolio.png)

# Full price charts

Charts are built on top of <a href="https://echartsforreact.com/examples/" target="_blank" rel="noopener noreferrer">React Echarts</a> and render tuples of (open, close, high, low) over the time period. There are view options for week, month, quarter, and year.

![Opentrade chart](/imgs/stock-social-chart.png)

The frontend uses Zustand and TanStack Query for state management. Client-side query caching is frequently used in the app to prevent refetching large amounts of data, such as price data.

# Advanced Insights

A neat tool we built into this platform is a **correlation matrix and beta calculation tool** for each portfolio/watchlist. These give insights into how correlated each stock is to the others in the portfolio and help pinpoint potential skews toward certain sectors. The beta value calculation is also useful in determining how volatile a given stock is relative to the S&P 500. **All calculations are done entirely via SQL** and are cached in a **cache table** for speedy retrieval.
![Opentrade matrix](/imgs/stock-social-matrix.png)




