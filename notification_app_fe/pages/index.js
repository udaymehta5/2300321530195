import { useState, useEffect, useCallback } from "react";
import {
  Box, Container, Typography, Pagination, Button, Skeleton,
  Alert, Stack, Divider, Paper, Tooltip
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import Navbar from "../components/Navbar";
import NotificationCard from "../components/NotificationCard";
import FilterBar from "../components/FilterBar";
import { fetchNotifications } from "../lib/notifications";
import { getReadIds, markAsRead, markAllAsRead } from "../lib/readState";

const LIMIT = 10;

export default function AllNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [page,          setPage]          = useState(1);
  const [totalPages,    setTotalPages]    = useState(1);
  const [filter,        setFilter]        = useState("");
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [readIds,       setReadIds]       = useState(new Set());

  // Load read state from localStorage on mount
  useEffect(() => { setReadIds(getReadIds()); }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchNotifications({ page, limit: LIMIT, notification_type: filter });
      setNotifications(data);
      // We don't have total from API so estimate
      setTotalPages(data.length === LIMIT ? page + 1 : page);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { load(); }, [load]);

  const handleMarkRead = (id) => {
    markAsRead(id);
    setReadIds(getReadIds());
  };

  const handleMarkAll = () => {
    markAllAsRead(notifications.map(n => n.ID));
    setReadIds(getReadIds());
  };

  const unread = notifications.filter(n => !readIds.has(n.ID));

  return (
    <Box minHeight="100vh" bgcolor="background.default">
      <Navbar unreadCount={unread.length} />

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h5" fontWeight={700}>All Notifications</Typography>
            <Typography variant="body2" color="text.secondary">
              {unread.length} unread on this page
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Mark all on page as read">
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
          </Stack>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Filter */}
        <FilterBar
          value={filter}
          onChange={(v) => { setFilter(v); setPage(1); }}
        />

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error} — Make sure AUTH_TOKEN is set in your .env.local
          </Alert>
        )}

        {/* Notifications list */}
        <Paper elevation={0} sx={{ bgcolor: "transparent" }}>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={80} sx={{ mb: 1.5, borderRadius: 2 }} />
            ))
          ) : notifications.length === 0 ? (
            <Alert severity="info">No notifications found for this filter.</Alert>
          ) : (
            notifications.map(n => (
              <NotificationCard
                key={n.ID}
                notification={n}
                isRead={readIds.has(n.ID)}
                onMarkRead={handleMarkRead}
              />
            ))
          )}
        </Paper>

        {/* Pagination */}
        {!loading && notifications.length > 0 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
              color="primary"
              shape="rounded"
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}