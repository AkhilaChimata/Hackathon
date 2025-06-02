import React, { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState("");

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
      <TextField
        label="Ask your question"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        fullWidth
        disabled={loading}
      />
      <Button
        variant="contained"
        disabled={!query.trim() || loading}
        onClick={() => onSearch(query.trim())}
      >
        {loading ? "Searching…" : "Search"}
      </Button>
    </Box>
  );
}