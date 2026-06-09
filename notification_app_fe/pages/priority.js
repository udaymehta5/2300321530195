import { useState, useEffect, useCallback } from "react";
import {
  Box, Container, Typography, Button, Skeleton, Alert,
  Divider, Paper, Stack, Slider, Chip, Tooltip
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import RefreshIcon from "@mui/icons-material/Refresh";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import Navbar from "../components/Navbar";
import NotificationCard from "../components/NotificationCard";
import { fetchTopN } from "../lib/notifications";
import { getReadIds, markAsRead, markAllAsRead } from "../lib/readState";

export default function PriorityInbox() {
  const [topN,    setTopN]    = useState(10);
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [readIds, setReadIds] = useState(new Set());

  useEffect(() => { setReadIds(getReadIds()); }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchTopN(topN);
      setItems(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [topN]);

  useEffect(() => { load(); }, [load]);

  const handleMarkRead = (id) => {
    markAsRead(id);
    setReadIds(getReadIds());
  };

  const handleMarkAll = () => {
    markAllAsRead(items.map(n => n.ID));
    setReadIds(getReadIds());
  };

  const unread = items.filter(n => !readIds.has(n.ID));

  // Count by type
  const typeCounts = items.reduce((acc, n) => {
    acc[n.Type] = (acc[n.Type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Box minHeight="100vh" bgcolor="background.default">
      <Navbar unreadCount={unread.length} />

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)",
            borderRadius: 3, p: 3, mb: 3, color: "white",
          }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <EmojiEventsIcon />
            <Typography variant="h5" fontWeight={700}>Priority Inbox</Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.85, mb: 2 }}>
            Top {topN} notifications ranked by type priority (Placement &gt; Result &gt; Event) and recency.
          </Typography>

          {/* Type breakdown chips */}
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {Object.entries(typeCounts).map(([type, count]) => (
              <Chip
                key={type}
                label={`${type}: ${count}`}
                size="small"
                sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600 }}
              />
            ))}
            {unread.length > 0 && (
              <Chip
                icon={<StarIcon sx={{ color: "white !important", fontSize: "0.85rem" }} />}
                label={`${unread.length} unread`}
                size="small"
                sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600 }}
              />
            )}
          </Stack>
        </Box>

        {/* Top-N slider */}
        <Paper elevation={1} sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            Show top N notifications: <strong>{topN}</strong>
          </Typography>
          <Slider
            value={topN}
            min={5}
            max={20}
            step={5}
            marks={[
              { value: 5,  label: "5"  },
              { value: 10, label: "10" },
              { value: 15, label: "15" },
              { value: 20, label: "20" },
            ]}
            onChange={(_, v) => setTopN(v)}
            color="primary"
            sx={{ mt: 1 }}
          />
        </Paper>

        {/* Actions */}
        <Box display="flex" justifyContent="flex-end" mb={2} gap={1}>
          <Tooltip title="Mark all as read">
            <Button
              size="small"
              variant="outlined"
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAll}
              disabled={unread.length === 0}
            >
              Mark all read
            </Button>
          </Tooltip>
          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={load}
          >
            Refresh
          </Button>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error} — Make sure AUTH_TOKEN is set in .env.local
          </Alert>
        )}

        {/* Priority list */}
        <Paper elevation={0} sx={{ bgcolor: "transparent" }}>
          {loading ? (
            Array.from({ length: topN }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={80} sx={{ mb: 1.5, borderRadius: 2 }} />
            ))
          ) : items.length === 0 ? (
            <Alert severity="info">No notifications found.</Alert>
          ) : (
            items.map((n, idx) => (
              <NotificationCard
                key={n.ID}
                notification={n}
                isRead={readIds.has(n.ID)}
                onMarkRead={handleMarkRead}
                rank={idx + 1}
              />
            ))
          )}
        </Paper>
      </Container>
    </Box>
  );
}