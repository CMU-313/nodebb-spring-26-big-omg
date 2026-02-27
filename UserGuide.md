# User Guide

## Overview

This project is a customized **NodeBB** discussion forum. It supports the normal forum workflow such as registering, logging in, browsing categories, creating topics, and replying to posts. This codebase also adds two custom features:

1. A **Resolved / Open** filter for category topic lists
2. A **Homework tag filter API** for retrieving homework-related topics

This guide is written for teammates, TAs, and anyone who needs to run or use the project.

## Running the Project Locally

### Option 1: Docker Compose

The repository already includes Docker Compose files.

Start the default stack:

```bash
docker compose up --build
```

This starts the forum on:

```text
http://localhost:4567
```

Other compose files are also available:

- `docker-compose.yml`: default setup
- `docker-compose-redis.yml`: NodeBB with Redis
- `docker-compose-pgsql.yml`: NodeBB with PostgreSQL

Examples:

```bash
docker compose -f docker-compose-redis.yml up --build
docker compose -f docker-compose-pgsql.yml up --build
```

### Option 2: Standard NodeBB CLI

If you already have the project dependencies installed and want to run it like a normal NodeBB app, use the CLI entrypoint:

```bash
./nodebb setup
./nodebb build
./nodebb start
```

Requirements from the base project:

- Node.js 20+
- One supported database: MongoDB, Redis, or PostgreSQL

## Basic User Workflow

### 1. Register or log in

- Open the forum in your browser.
- Create an account on the registration page, or log in with an existing account.

### 2. Browse categories

- The home page shows forum categories and recent activity.
- Click a category to view all topics inside it.

### 3. Create a topic

- Enter a category.
- Click **New Topic**.
- Add a title and post content.
- Optionally add tags such as `hw1`, `hw2`, or other descriptive tags.

### 4. Reply to a topic

- Open any topic.
- Use the reply editor to post a response.

## Custom Feature 1: Resolved / Open Topic Workflow

This project adds a status workflow for question-like topics.

### Marking a topic as resolved

- Open a topic.
- Open the topic tools menu.
- Click **Mark as Resolved**.

### Marking a topic as unresolved

- Open the same topic tools menu.
- Click **Mark as Unresolved**.

### Who can change resolved status

The code allows this action for:

- the topic owner
- an administrator
- a moderator

### Filtering category pages by status

Inside a category page, open the sort/filter dropdown. You can choose:

- `Resolved`: show only resolved topics
- `Open`: show only unresolved topics

This is useful for classes, help forums, or Q&A-style categories where users want to see unanswered or already-solved discussions separately.

## Custom Feature 2: Homework Filter API

This repository also adds a backend API for filtering topics by homework tag.

### Endpoint

```text
GET /api/homework/filter
```

### Required parameter

- `homework`: the homework tag to match, for example `hw1`

### Optional parameters

- `keyword`: filter by title/tag keyword
- `page`: page number, default `1`
- `perPage`: page size, default `20`, max `100`
- `sort`: `recent`, `old`, `create`, `posts`, `votes`, `views`
- `term`: `alltime`, `day`, `week`, `month`, `year`
- `filter`: `new`, `watched`, `unreplied`
- `cid`: category id filter, single or comma-separated

### Example requests

```text
/api/homework/filter?homework=hw1
/api/homework/filter?homework=hw1&keyword=dynamic
/api/homework/filter?homework=hw2&cid=1,2&page=1&perPage=10
```

### Example response behavior

- Returns only topics tagged with the requested homework label
- Supports pagination through a `pagination` object
- Returns HTTP `400` if the `homework` parameter is missing or invalid

### Important note

At the current state of this codebase, the homework filter is implemented as a **backend API** and documented in OpenAPI. It is not exposed as a full built-in forum page in the same way the category resolved/open filter is.

## Suggested Usage for a Course Forum

- Tag homework discussion threads with labels like `hw1`, `hw2`, and `hw3`
- Use the homework API to build filtered views or external integrations
- Mark solved question threads as resolved once an answer is confirmed
- Use the `Open` category filter to quickly find unanswered questions

## Troubleshooting

### The homework API returns `400`

Make sure the request includes a valid homework tag:

```text
/api/homework/filter?homework=hw1
```

### No results are returned

Check:

- the topic really has the expected tag
- the keyword is not too restrictive
- the selected category ids are correct

### The resolved/unresolved menu option is missing

Only the topic owner, admin, or moderator can toggle the resolved state.

## Summary

If you just want to use the forum:

1. Start the app
2. Register or log in
3. Create topics and replies normally
4. Use **Mark as Resolved / Unresolved** on topics
5. Use the category dropdown to filter by **Resolved** or **Open**
6. Use `/api/homework/filter` when you need homework-specific topic retrieval
