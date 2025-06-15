// SnippetCard.jsx  
import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import MenuBookIcon from "@mui/icons-material/MenuBook";

export default function SnippetCard({ snippet, onExplain, loading, mode }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: 2, borderColor: '#b39ddb', transition: '0.2s', '&:hover': { boxShadow: 6, borderColor: '#7c43bd' } }}>
      <CardContent>
        <Typography variant="h6" sx={{ color: '#7c43bd', fontWeight: 600 }}>{snippet.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {snippet.text.slice(0, 120)}…
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          startIcon={<PlayArrowIcon />}
          onClick={() => onExplain(snippet, "story")}
          disabled={loading && mode === "story"}
          sx={{ color: '#fff', background: '#b39ddb', '&:hover': { background: '#7c43bd' } }}
        >
          {loading && mode === "story"
            ? "Thinking…"
            : "Explain as Story"}
        </Button>
        <Button
          size="small"
          startIcon={<MenuBookIcon />}
          onClick={() => onExplain(snippet, "example")}
          disabled={loading && mode === "example"}
          sx={{ color: '#fff', background: '#ede7f6', '&:hover': { background: '#b39ddb', color: '#fff' } }}
        >
          {loading && mode === "example"
            ? "Thinking…"
            : "Show Example"}
        </Button>
      </CardActions>
    </Card>
  );
}
