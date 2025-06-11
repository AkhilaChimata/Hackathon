// SnippetList.jsx  
import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import SnippetCard from "./SnippetCard";

export default function SnippetList({ results, onExplain, isSearching }) {
  if (isSearching) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!results || results.length === 0) {
    return (
      <Box sx={{ textAlign: "center", mt: 2 }}>
        <Typography variant="body1" color="textSecondary">
          No snippets to display.
        </Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {results.map((snip) => (
        <SnippetCard
          key={snip._id}
          snippet={snip}
          onExplain={onExplain}
        />
      ))}
    </Box>
  );
}
