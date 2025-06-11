// SnippetCard.jsx  
import React, { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ExplanationPanel from "./ExplanationPanel";

export default function SnippetCard({ snippet }) {
  const [mode, setMode] = useState(null);
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExplain = async (chosenMode) => {
    setMode(chosenMode);
    setLoading(true);
    setAiText("");
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/explain`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: snippet._id, mode: chosenMode }),
        }
      );
      const { explanation } = await res.json();
      setAiText(explanation);
    } catch (err) {
      console.error(err);
      alert("Explanation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6">{snippet.title}</Typography>
          <Typography variant="body2">
            {snippet.text.slice(0, 120)}…
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            size="small"
            startIcon={<PlayArrowIcon />}
            onClick={() => handleExplain("story")}
            disabled={loading}
          >
            {loading && mode === "story"
              ? "Thinking…"
              : "Explain as Story"}
          </Button>
          <Button
            size="small"
            startIcon={<MenuBookIcon />}
            onClick={() => handleExplain("example")}
            disabled={loading}
          >
            {loading && mode === "example"
              ? "Thinking…"
              : "Show Example"}
          </Button>
        </CardActions>
      </Card>

      <ExplanationPanel
        snippet={snippet}
        aiText={aiText}
        onClose={() => setAiText("")}
      />
    </>
  );
}
