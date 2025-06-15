import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function Footer() {
  return (
    <Box
      sx={{
        borderTop: "1px solid #ede7f6",
        mt: 6,
        py: 2,
        textAlign: "center",
        color: "#b39ddb",
        fontSize: 14,
      }}
    >
      Made with{" "}
      <span style={{ color: "#7c43bd" }}>♥</span> and Coffee
    </Box>
  );
}