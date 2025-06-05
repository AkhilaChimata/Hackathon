import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Box from "@mui/material/Box";

export default function Header() {
  return (
    <AppBar position="static" sx={{ backgroundColor: "#1e1e1e"}}>
      <Toolbar>
        {/* Left: Title */}
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          EduStory - The AI Tutor
        </Typography>

        {/* Right: Icons */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton color="inherit" aria-label="settings">
            <SettingsIcon />
          </IconButton>
          <IconButton color="inherit" aria-label="profile">
            <AccountCircleIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
