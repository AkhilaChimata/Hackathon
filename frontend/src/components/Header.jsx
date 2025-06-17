import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function Header() {
  return (
    <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", py: 3, px: 6, background: "linear-gradient(90deg, #b39ddb 0%, #ede7f6 100%)" }}>
      <Typography variant="h5" sx={{ color: "#5e35b1", fontWeight: 700, letterSpacing: 1 }}>
        EduStory <span style={{ fontWeight: 400, fontSize: "1.1rem" }}>– The AI Tutor</span>
      </Typography>
    </Box>
  );
}
