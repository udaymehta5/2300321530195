/**
 * Stage 1: Priority Inbox - Campus Notifications Microservice
 * 
 * Priority Logic:
 *   - Type weight:   Placement = 3, Result = 2, Event = 1
 *   - Recency weight: newer timestamp = higher score
 *   - Final score:   typeWeight * 1000 + recencyScore
 * 
 * Efficiently maintains top-10 using a Min-Heap so that
 * as new notifications stream in, we keep only the best 10.
 */

const API_URL = "http://4.224.186.213/evaluation-service/notifications";

// ─── Logger Middleware (lightweight stub — replace with your actual middleware) ───
const logger = {
  info:  (msg, meta = {}) => console.log(`[INFO]  ${new Date().toISOString()} | ${msg}`, meta),
  warn:  (msg, meta = {}) => console.warn(`[WARN]  ${new Date().toISOString()} | ${msg}`, meta),
  error: (msg, meta = {}) => console.error(`[ERROR] ${new Date().toISOString()} | ${msg}`, meta),
};

// ─── Priority Weights ─────────────────────────────────────────────────────────
const TYPE_WEIGHT = {
  Placement: 3,
  Result:    2,
  Event:     1,
};

/**
 * Calculates a numeric priority score for a notification.
 * Higher score = more important.
 */
function getPriorityScore(notification) {
  const typeScore    = (TYPE_WEIGHT[notification.Type] ?? 0) * 1_000_000;
  const recencyScore = new Date(notification.Timestamp).getTime(); // epoch ms
  return typeScore + recencyScore;
}

// ─── Min-Heap (keeps top-N most important notifications) ──────────────────────
class MinHeap {
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.heap    = [];
  }

  _parent(i) { return Math.floor((i - 1) / 2); }
  _left(i)   { return 2 * i + 1; }
  _right(i)  { return 2 * i + 2; }

  _swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  _heapifyUp(i) {
    while (i > 0 && this.heap[this._parent(i)].score > this.heap[i].score) {
      this._swap(i, this._parent(i));
      i = this._parent(i);
    }
  }

  _heapifyDown(i) {
    let smallest = i;
    const l = this._left(i), r = this._right(i);
    if (l < this.heap.length && this.heap[l].score < this.heap[smallest].score) smallest = l;
    if (r < this.heap.length && this.heap[r].score < this.heap[smallest].score) smallest = r;
    if (smallest !== i) {
      this._swap(i, smallest);
      this._heapifyDown(smallest);
    }
  }

  /**
   * Push a notification into the heap.
   * If size exceeds maxSize, evict the lowest-priority item.
   */
  push(notification) {
    const item = { ...notification, score: getPriorityScore(notification) };

    if (this.heap.length < this.maxSize) {
      this.heap.push(item);
      this._heapifyUp(this.heap.length - 1);
    } else if (item.score > this.heap[0].score) {
      // New item beats the weakest in current top-N → replace it
      this.heap[0] = item;
      this._heapifyDown(0);
    }
    // else: new item is weaker than all top-N, ignore it
  }

  /** Returns top-N sorted from highest to lowest priority */
  getTopN() {
    return [...this.heap].sort((a, b) => b.score - a.score);
  }

  size() { return this.heap.length; }
}

// ─── Fetch Notifications ──────────────────────────────────────────────────────
async function fetchNotifications(authToken) {
  logger.info("Fetching notifications from API", { url: API_URL });

  const response = await fetch(API_URL, {
    headers: {
      "Authorization": `Bearer ${authToken}`,
      "Content-Type":  "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API returned ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  logger.info("Notifications fetched successfully", { count: data.notifications?.length ?? 0 });
  return data.notifications ?? [];
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function getPriorityInbox(authToken, topN = 10) {
  logger.info("Priority Inbox started", { topN });

  let notifications;
  try {
    notifications = await fetchNotifications(authToken);
  } catch (err) {
    logger.error("Failed to fetch notifications", { error: err.message });
    throw err;
  }

  if (!notifications.length) {
    logger.warn("No notifications returned from API");
    return [];
  }

  // Feed all notifications into the Min-Heap
  const heap = new MinHeap(topN);
  for (const n of notifications) {
    heap.push(n);
  }

  const topNotifications = heap.getTopN();
  logger.info("Priority Inbox computed", { returned: topNotifications.length });
  return topNotifications;
}

// ─── Display ──────────────────────────────────────────────────────────────────
function displayResults(notifications) {
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║              🔔 TOP 10 PRIORITY NOTIFICATIONS               ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  if (!notifications.length) {
    console.log("  No notifications found.");
    return;
  }

  notifications.forEach((n, idx) => {
    const typeLabel = n.Type.padEnd(10);
    const time      = new Date(n.Timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    console.log(`  #${String(idx + 1).padStart(2, "0")} │ [${typeLabel}] │ ${n.Message}`);
    console.log(`       │ ID: ${n.ID}`);
    console.log(`       │ Time: ${time}`);
    console.log(`       │ Priority Score: ${n.score}`);
    console.log("       └─────────────────────────────────────────────────────");
  });

  console.log("\nType distribution in top 10:");
  const counts = notifications.reduce((acc, n) => {
    acc[n.Type] = (acc[n.Type] ?? 0) + 1;
    return acc;
  }, {});
  Object.entries(counts).forEach(([type, count]) => {
    console.log(`  ${type.padEnd(12)}: ${"█".repeat(count)} (${count})`);
  });
}

// ─── Entry Point ──────────────────────────────────────────────────────────────
(async () => {
  // Pass your auth token here or via env variable
  const AUTH_TOKEN = process.env.AUTH_TOKEN ?? "YOUR_AUTH_TOKEN_HERE";

  if (AUTH_TOKEN === "YOUR_AUTH_TOKEN_HERE") {
    logger.warn("No AUTH_TOKEN set. Set it via: AUTH_TOKEN=<token> node priority_inbox.js");
  }

  try {
    const topNotifications = await getPriorityInbox(AUTH_TOKEN, 10);
    displayResults(topNotifications);
  } catch (err) {
    logger.error("Priority Inbox failed", { error: err.message });
    process.exit(1);
  }
})();