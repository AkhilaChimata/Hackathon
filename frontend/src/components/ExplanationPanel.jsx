import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export default function ExplanationPanel({ snippet, aiText, onClose }) {
  return (
    <Dialog open={!!snippet} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>AI Explanation: {snippet?.title}</DialogTitle>
      <DialogContent dividers sx={{ maxHeight: "60vh", overflowY: "auto" }}>
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
          {aiText || "Generating explanation..."}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}