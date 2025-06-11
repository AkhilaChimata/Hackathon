// SearchBar.jsx  
import React, { useState } from "react";
import { Box, IconButton, InputBase, Paper } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import UploadFileIcon from "@mui/icons-material/UploadFile";

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(null, true);                   // signal “searching”
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/search?q=${encodeURIComponent(query.trim())}`
      );
      const { results } = await res.json();
      onSearch(results, false);
    } catch (err) {
      console.error(err);
      alert("Search failed");
      onSearch([], false);
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: "2px 8px",
        display: "flex",
        alignItems: "center",
        borderRadius: "40px",
        width: "100%",
        maxWidth: 700,
        boxShadow: 2,
        mb: 4,
      }}
      elevation={3}
    >
      <SearchIcon sx={{ color: "gray", mr: 1 }} />
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Ask your question"
        inputProps={{ "aria-label": "ask your question" }}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={loading}
      />
      <IconButton component="label" aria-label="upload doc">
        <UploadFileIcon />
        <input type="file" hidden onChange={() => {}} />
      </IconButton>
    </Paper>
  );
}
