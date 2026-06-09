import {
  AppBar, Toolbar, Typography, Button, Box, useMediaQuery, IconButton, Drawer,
  List, ListItem, ListItemText, Badge
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Navbar({ unreadCount = 0 }) {
  const theme   = useTheme();
  const mobile  = useMediaQuery(theme.breakpoints.down("sm"));
  const router  = useRouter();
  const [open, setOpen] = useState(false);

  const links = [
    { label: "All Notifications", href: "/",       icon: <NotificationsIcon fontSize="small" /> },
    { label: "Priority Inbox",    href: "/priority", icon: <StarIcon fontSize="small" /> },
  ];

  const navLinks = links.map(l => (
    <Button
      key={l.href}
      component={Link}
      href={l.href}
      startIcon={l.icon}
      sx={{
        color: "white",
        fontWeight: router.pathname === l.href ? 700 : 400,
        borderBottom: router.pathname === l.href ? "2px solid white" : "2px solid transparent",
        borderRadius: 0,
        px: 2, py: 1,
        textTransform: "none",
        fontSize: "0.95rem",
        "&:hover": { borderBottom: "2px solid rgba(255,255,255,0.7)" },
      }}
    >
      {l.label}
    </Button>
  ));

  return (
    <>
      <AppBar position="sticky" elevation={2} sx={{ bgcolor: "primary.main" }}>
        <Toolbar>
          <NotificationsIcon sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1, letterSpacing: 0.5 }}>
            Campus Notify
          </Typography>

          {mobile ? (
            <>
              <Badge badgeContent={unreadCount} color="error">
                <IconButton color="inherit" onClick={() => setOpen(true)}>
                  <MenuIcon />
                </IconButton>
              </Badge>
            </>
          ) : (
            <Box display="flex" alignItems="center" gap={1}>
              {navLinks}
              {unreadCount > 0 && (
                <Badge badgeContent={unreadCount} color="error" sx={{ ml: 1 }}>
                  <NotificationsIcon />
                </Badge>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <List sx={{ width: 220, pt: 2 }}>
          {links.map(l => (
            <ListItem
              key={l.href}
              component={Link}
              href={l.href}
              onClick={() => setOpen(false)}
              sx={{
                bgcolor: router.pathname === l.href ? "primary.light" : "transparent",
                color: router.pathname === l.href ? "white" : "inherit",
                "&:hover": { bgcolor: "primary.light", color: "white" },
              }}
            >
              <Box mr={1}>{l.icon}</Box>
              <ListItemText primary={l.label} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
}