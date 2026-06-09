const API_BASE = "http://4.224.186.213/evaluation-service/notifications";
const AUTH_TOKEN = process.env.NEXT_PUBLIC_AUTH_TOKEN ?? "";

const TYPE_WEIGHT = { Placement: 3, Result: 2, Event: 1 };

export function getPriorityScore(n) {
  const typeScore    = (TYPE_WEIGHT[n.Type] ?? 0) * 1_000_000;
  const recencyScore = new Date(n.Timestamp).getTime() / 1_000_000;
  return typeScore + recencyScore;
}

// Min-Heap for top-N
class MinHeap {
  constructor(max) { this.max = max; this.heap = []; }
  _p(i)  { return Math.floor((i - 1) / 2); }
  _l(i)  { return 2 * i + 1; }
  _r(i)  { return 2 * i + 2; }
  _sw(i,j){ [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]]; }
  _up(i) {
    while (i > 0 && this.heap[this._p(i)].score > this.heap[i].score) {
      this._sw(i, this._p(i)); i = this._p(i);
    }
  }
  _dn(i) {
    let s = i, l = this._l(i), r = this._r(i);
    if (l < this.heap.length && this.heap[l].score < this.heap[s].score) s = l;
    if (r < this.heap.length && this.heap[r].score < this.heap[s].score) s = r;
    if (s !== i) { this._sw(i, s); this._dn(s); }
  }
  push(item) {
    const node = { ...item, score: getPriorityScore(item) };
    if (this.heap.length < this.max) { this.heap.push(node); this._up(this.heap.length - 1); }
    else if (node.score > this.heap[0].score) { this.heap[0] = node; this._dn(0); }
  }
  topN() { return [...this.heap].sort((a, b) => b.score - a.score); }
}

export async function fetchNotifications({ page = 1, limit = 10, notification_type = "" } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (notification_type) params.set("notification_type", notification_type);

  const res = await fetch(`${API_BASE}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  return data.notifications ?? [];
}

export async function fetchTopN(n = 10) {
  // Fetch a large batch to find best top-N
  const all  = await fetchNotifications({ page: 1, limit: 100 });
  const heap = new MinHeap(n);
  for (const item of all) heap.push(item);
  return heap.topN();
}