import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 4,
        p: 2,
        backgroundColor: "#f5f5f5",
        textAlign: "center",
      }}
    >
      <Typography variant="body2" color="textSecondary">
        Made with ❤ and Coffee •{" "}
        <Link href="https://github.com/AkhilaChimata/Hackathon.git" target="_blank" rel="noopener">
          GitHub
        </Link>
      </Typography>
    </Box>
  );
}