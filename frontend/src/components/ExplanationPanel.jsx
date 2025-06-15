import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export default function ExplanationPanel({ snippet, aiText, open, loading, onClose }) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: 'linear-gradient(135deg, #ede7f6 0%, #fff 100%)',
          boxShadow: '0 8px 32px 0 rgba(124,67,189,0.15)',
          animation: open ? 'fadeInScale 0.5s cubic-bezier(.4,2,.6,1)' : 'none',
        }
      }}
    >
      <DialogTitle sx={{ color: '#7c43bd', fontWeight: 700, fontSize: 26, letterSpacing: 1 }}>
        AI Explanation: {snippet?.title}
      </DialogTitle>
      <DialogContent dividers sx={{ maxHeight: "60vh", overflowY: "auto", background: 'rgba(255,255,255,0.85)' }}>
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", fontSize: 17, color: '#333', fontFamily: 'Nunito, Arial, sans-serif' }}>
          {loading ? "Generating explanation..." : aiText}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: '#fff', background: '#b39ddb', '&:hover': { background: '#7c43bd' } }}>
          CLOSE
        </Button>
      </DialogActions>
      <style>{`
        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </Dialog>
  );
}