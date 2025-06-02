import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

export default function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          EduStory AI Tutor
        </Typography>
        <Typography variant="body2">
          Turning concepts into stories
        </Typography>
      </Toolbar>
    </AppBar>
  );
}