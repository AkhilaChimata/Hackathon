import React, { useState } from "react";
import { Box, IconButton, InputBase, Paper } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import UploadFileIcon from "@mui/icons-material/UploadFile";

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState("");

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Uploaded file:", file.name);
      // TODO: Handle file upload logic
    }
  };

  return (
    <Paper
      component="form"
      sx={{
        p: "2px 8px",
        display: "flex",
        alignItems: "center",
        borderRadius: "40px",
        width: "100%",
        maxWidth: 700,
        boxShadow: 2,
        mb: 4
      }}
      elevation={3}
      onSubmit={(e) => {
        e.preventDefault();
        if (query.trim()) onSearch(query.trim());
      }}
    >
      <SearchIcon sx={{ color: "gray", mr: 1 }} />

      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Ask your question"
        inputProps={{ "aria-label": "ask your question" }}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={loading}
      />

      <IconButton component="label" aria-label="upload doc">
        <UploadFileIcon />
        <input type="file" hidden onChange={handleUpload} />
      </IconButton>
    </Paper>
  );
}
