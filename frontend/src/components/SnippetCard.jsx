import React, { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import MenuBookIcon from "@mui/icons-material/MenuBook";

export default function SnippetCard({ snippet, onExplain }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleExplain = (mode) => {
    setIsLoading(true);
    onExplain(snippet._id, snippet.text, mode).finally(() => {
      setIsLoading(false);
    });
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6">{snippet.title}</Typography>
        <Typography variant="body2">{snippet.text}</Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          startIcon={<PlayArrowIcon />}
          onClick={() => handleExplain("story")}
          disabled={isLoading}
        >
          {isLoading ? "Thinking…" : "Explain as Story"}
        </Button>
        <Button
          size="small"
          startIcon={<MenuBookIcon />}
          onClick={() => handleExplain("example")}
          disabled={isLoading}
        >
          {isLoading ? "Thinking…" : "Show Example"}
        </Button>
      </CardActions>
    </Card>
  );
}