# Stage 1 — Notification System Design

## Overview

The Priority Inbox surfaces the **top N most important unread notifications** from a live stream of campus notifications. The goal is to help students focus on what matters most without getting overwhelmed by high notification volume.

---

## Priority Scoring Logic

Each notification is assigned a numeric score using two factors:

| Factor        | Logic                                               | Weight         |
|---------------|-----------------------------------------------------|----------------|
| **Type**      | `Placement = 3`, `Result = 2`, `Event = 1`          | `× 1,000,000`  |
| **Recency**   | Unix epoch timestamp (ms) of the notification time  | `+ epoch ms`   |

```
score = TYPE_WEIGHT[type] * 1_000_000 + Date(timestamp).getTime()
```

The `1,000,000` multiplier ensures that **type always dominates recency** — a Placement from 2 days ago will always outrank a fresh Event.

---

## Data Structure: Min-Heap (Top-N Maintenance)

A **Min-Heap of size N** is the ideal structure for efficiently maintaining a "top N" as new notifications stream in continuously.

### Why a Min-Heap?

| Approach           | Insert    | Get Top-N  | Space  |
|--------------------|-----------|------------|--------|
| Sort all           | O(k log k)| O(N)       | O(k)   |
| Max-Heap           | O(log k)  | O(N log N) | O(k)   |
| **Min-Heap (N)**   | **O(log N)** | **O(N log N)** | **O(N)** |

With a Min-Heap of fixed size N:
- The **root always holds the weakest notification** in the current top-N
- When a new notification arrives, compare its score to the root:
  - If `newScore > root.score` → replace root, re-heapify → O(log N)
  - Else → discard the new notification → O(1)
- This means **we never store more than N notifications in memory** regardless of how many total notifications come in

---

## How New Notifications Are Handled Efficiently

```
New Notification Arrives
        │
        ▼
  Heap full (size = N)?
   ├── NO  → push into heap, heapify-up     O(log N)
   └── YES → compare score with heap root
              ├── newScore > root → replace root, heapify-down  O(log N)
              └── newScore ≤ root → discard                     O(1)
```

This makes the system **O(log N) per new notification** and **O(N)** memory — optimal for a streaming notification feed.

---

## API Integration

**Endpoint:** `GET http://4.224.186.213/evaluation-service/notifications`

- Protected route — requires `Authorization: Bearer <token>` header
- Response schema: `{ notifications: [{ ID, Type, Message, Timestamp }] }`
- All fetching goes through the **Logging Middleware** for observability

---

## Logging Middleware Integration

Every operation is instrumented via the Logging Middleware:
- API fetch start/success/failure
- Heap insert decisions (promoted vs discarded)
- Final top-N output summary

This ensures full traceability for debugging and performance monitoring.

---

## Scalability Considerations

| Concern | Solution |
|---|---|
| API rate limiting | Add exponential backoff on 429/503 responses |
| Real-time stream | Replace polling with WebSocket / SSE; heap update logic stays identical |
| Read/unread state | Track a `Set<notificationID>` of seen IDs; filter before scoring |
| Multiple users | Each user session gets its own heap instance; no shared mutable state |
| N is configurable | `getPriorityInbox(token, topN)` accepts any N; default is 10 |

---

## Running the Script

```bash
# Install dependencies (none required — vanilla Node.js)
node --version  # requires Node 18+

# Run with your auth token
AUTH_TOKEN=your_token_here node priority_inbox.js

# Or export and run
export AUTH_TOKEN=your_token_here
node priority_inbox.js
```

---

## Sample Output

```
╔══════════════════════════════════════════════════════════════╗
║              🔔 TOP 10 PRIORITY NOTIFICATIONS               ║
╚══════════════════════════════════════════════════════════════╝

  #01 │ [Placement  ] │ CSX Corporation hiring
       │ ID: b283218f-ea5a-4b7c-93a9-1f2f240d64b0
       │ Time: 22/4/2026, 11:21:18 pm
       │ Priority Score: 3001745478000
       └─────────────────────────────────────────────────────
  #02 │ [Placement  ] │ Advanced Micro Devices Inc. hiring
       │ ID: 8a7412bd-6065-4d09-8501-037f11cc848b
       │ Time: 22/4/2026, 11:19:42 pm
       │ Priority Score: 3001745477000
       └─────────────────────────────────────────────────────
  ...
```