import {
  Card, CardContent, Typography, Chip, Box, Tooltip, IconButton
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import EventIcon from "@mui/icons-material/Event";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

const TYPE_CONFIG = {
  Placement: { color: "success",  icon: <WorkIcon  fontSize="small" />, bg: "#E8F5E9" },
  Result:    { color: "warning",  icon: <SchoolIcon fontSize="small" />, bg: "#FFF8E1" },
  Event:     { color: "info",     icon: <EventIcon  fontSize="small" />, bg: "#E3F2FD" },
};

export default function NotificationCard({ notification, isRead, onMarkRead, rank }) {
  const cfg  = TYPE_CONFIG[notification.Type] ?? { color: "default", icon: null, bg: "#F5F5F5" };
  const time = new Date(notification.Timestamp).toLocaleString("en-IN", {
    dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata"
  });

  return (
    <Card
      elevation={isRead ? 0 : 2}
      sx={{
        mb: 1.5,
        borderLeft: `4px solid`,
        borderLeftColor: isRead ? "grey.300" : `${cfg.color}.main`,
        bgcolor: isRead ? "grey.50" : cfg.bg,
        opacity: isRead ? 0.75 : 1,
        transition: "all 0.2s ease",
        "&:hover": { transform: "translateY(-1px)", boxShadow: 3 },
      }}
    >
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={1}>
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" flex={1}>
            {rank && (
              <Typography
                variant="caption"
                sx={{
                  bgcolor: "primary.main", color: "white",
                  borderRadius: "50%", width: 22, height: 22,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: "0.7rem", flexShrink: 0,
                }}
              >
                {rank}
              </Typography>
            )}

            {!isRead && (
              <FiberManualRecordIcon
                sx={{ fontSize: 10, color: `${cfg.color}.main`, flexShrink: 0 }}
              />
            )}

            <Typography
              variant="body1"
              fontWeight={isRead ? 400 : 600}
              sx={{ flex: 1, color: isRead ? "text.secondary" : "text.primary" }}
            >
              {notification.Message}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1} flexShrink={0}>
            <Chip
              size="small"
              icon={cfg.icon}
              label={notification.Type}
              color={cfg.color}
              variant={isRead ? "outlined" : "filled"}
            />
            {!isRead && (
              <Tooltip title="Mark as read">
                <IconButton size="small" onClick={() => onMarkRead(notification.ID)}>
                  <MarkEmailReadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
          {time} · ID: {notification.ID.slice(0, 8)}…
        </Typography>
      </CardContent>
    </Card>
  );
}