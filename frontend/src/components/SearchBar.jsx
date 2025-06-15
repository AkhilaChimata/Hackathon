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
        p: "2px 16px",
        display: "flex",
        alignItems: "center",
        borderRadius: "32px",
        width: "100%",
        maxWidth: 700,
        boxShadow: '0 4px 24px 0 rgba(124,67,189,0.10)',
        mb: 4,
        background: 'linear-gradient(90deg, #ede7f6 0%, #fff 100%)',
        border: '2px solid #b39ddb',
        transition: 'box-shadow 0.3s',
        '&:focus-within': {
          boxShadow: '0 6px 32px 0 rgba(124,67,189,0.18)',
          borderColor: '#7c43bd',
        },
      }}
      elevation={0}
    >
      <SearchIcon sx={{ color: "#7c43bd", mr: 1, fontSize: 32 }} />
      <InputBase
        sx={{ ml: 1, flex: 1, fontSize: 20, fontWeight: 500, color: '#7c43bd', fontFamily: 'Nunito, Arial, sans-serif' }}
        placeholder="Ask your question..."
        inputProps={{ "aria-label": "ask your question" }}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={loading}
      />
      <IconButton component="label" aria-label="upload doc" sx={{ color: '#7c43bd', ml: 1, '&:hover': { color: '#fff', background: '#b39ddb' } }}>
        <UploadFileIcon />
        <input type="file" hidden onChange={() => {}} />
      </IconButton>
      <IconButton type="submit" aria-label="search" sx={{ color: '#fff', background: '#b39ddb', ml: 1, '&:hover': { background: '#7c43bd' }, transition: 'background 0.2s' }} disabled={loading}>
        <SearchIcon />
      </IconButton>
    </Paper>
  );
}
