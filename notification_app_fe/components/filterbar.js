import { Box, ToggleButton, ToggleButtonGroup, Typography, Chip } from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import EventIcon from "@mui/icons-material/Event";
import AllInboxIcon from "@mui/icons-material/AllInbox";

const TYPES = [
  { value: "",          label: "All",       icon: <AllInboxIcon fontSize="small" /> },
  { value: "Placement", label: "Placement", icon: <WorkIcon     fontSize="small" /> },
  { value: "Result",    label: "Result",    icon: <SchoolIcon   fontSize="small" /> },
  { value: "Event",     label: "Event",     icon: <EventIcon    fontSize="small" /> },
];

export default function FilterBar({ value, onChange, counts = {} }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: "block" }}>
        FILTER BY TYPE
      </Typography>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(_, v) => v !== null && onChange(v)}
        size="small"
        sx={{ flexWrap: "wrap", gap: 0.5 }}
      >
        {TYPES.map(t => (
          <ToggleButton
            key={t.value}
            value={t.value}
            sx={{
              textTransform: "none",
              borderRadius: "20px !important",
              border: "1px solid",
              borderColor: "grey.300",
              px: 2,
              "&.Mui-selected": {
                bgcolor: "primary.main",
                color: "white",
                borderColor: "primary.main",
                "&:hover": { bgcolor: "primary.dark" },
              },
            }}
          >
            <Box display="flex" alignItems="center" gap={0.5}>
              {t.icon}
              {t.label}
              {counts[t.value || "all"] != null && (
                <Chip
                  label={counts[t.value || "all"]}
                  size="small"
                  sx={{
                    height: 18, fontSize: "0.65rem",
                    ml: 0.5,
                    bgcolor: value === t.value ? "rgba(255,255,255,0.3)" : "grey.200",
                    color: value === t.value ? "white" : "text.primary",
                  }}
                />
              )}
            </Box>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}