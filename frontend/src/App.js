// App.js :contentReference[oaicite:0]{index=0}
import React, { useState } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import SnippetList from "./components/SnippetList";
import ExplanationPanel from "./components/ExplanationPanel";
import Footer from "./components/Footer";
import Typography from "@mui/material/Typography";

function App() {
  const [results, setResults] = useState([]);
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const [aiExplanation, setAiExplanation] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  // Called by SearchBar
  const handleSearch = (newResults, loading) => {
    setIsSearching(loading);
    setSearchError(null);
    if (!loading) {
      setResults(newResults);
      setSelectedSnippet(null);
    }
  };

  // Called by SnippetCard via onExplain
  const handleExplain = async (snippet, mode) => {
    setSelectedSnippet(snippet);
    setLoadingExplanation(true);
    setAiExplanation(""); // Clear previous explanation
    try {
      const response = await fetch("http://localhost:8000/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: snippet._id, mode }),
      });
      const data = await response.json();
      setAiExplanation(data.explanation || "No explanation found.");
    } catch (e) {
      setAiExplanation("Failed to get explanation.");
    }
    setLoadingExplanation(false);
  };

  const handleClose = () => {
    setSelectedSnippet(null);
    setAiExplanation("");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />

      <Container sx={{ mt: 4, flex: 1 }}>
        {searchError && (
          <Alert severity="error" onClose={() => setSearchError(null)} sx={{ mb: 2 }}>
            {searchError}
          </Alert>
        )}

        <SearchBar onSearch={handleSearch} loading={isSearching} />
        <SnippetList
          results={results}
          onExplain={handleExplain}
          isSearching={isSearching}
        />
      </Container>

      {selectedSnippet && (
        <ExplanationPanel
          snippet={selectedSnippet}
          aiText={aiExplanation}
          open={!!selectedSnippet}
          loading={loadingExplanation}
          onClose={handleClose}
        />
      )}

      <Footer />

      <Box sx={{ textAlign: "center", mt: 4, mb: 2 }}>
        {/* You can add a mascot image here if you want */}
        <Typography variant="h5" sx={{ fontWeight: 500, color: '#7c43bd' }}>
          Welcome to EduStory!
        </Typography>
        
      </Box>
    </Box>
  );
}

export default App;
