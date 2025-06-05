import React, { useState } from "react";
import Container from "@mui/material/Container";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import SnippetList from "./components/SnippetList";
import ExplanationPanel from "./components/ExplanationPanel";
import Footer from "./components/Footer";

import { searchConcepts, explainText } from "./api";

function App() {
  // ─── State Hooks ─────────────────────────────────────────────────────────
  const [results, setResults] = useState([]);
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const [aiExplanation, setAiExplanation] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleSearch = async (query) => {
    setIsSearching(true);
    setSearchError(null);
    setResults([]);
    setSelectedSnippet(null);
    setAiExplanation("");

    try {
      const res = await searchConcepts(query);
      setResults(res.data.results || []);
    } catch (err) {
      console.error("Search error:", err);
      setSearchError("Error fetching results. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleExplain = async (id, text, mode) => {
    const snippet = results.find((r) => r._id === id);
    setSelectedSnippet(snippet);
    setAiExplanation("");

    try {
      const res = await explainText(text, mode);
      setAiExplanation(res.data.ai_text || "No explanation returned.");
    } catch (err) {
      console.error("Explain error:", err);
      setAiExplanation("Error generating explanation. Please try again.");
    }
  };

  const handleCloseExplanation = () => {
    setSelectedSnippet(null);
    setAiExplanation("");
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className="App"
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header />

      {/* Landing Section */}
      {results.length === 0 && !searchError && (
        <Box
          sx={{
            backgroundColor: "#1e1e1e",
            color: "#fff",
            py: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Welcome to EduStory
          </Typography>
          <Typography variant="h5" gutterBottom>
            Learn through Storytelling.
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            EduStory is an AI-powered tutor that helps you learn by turning questions into clear explanations and examples.
          </Typography>
        </Box>
      )}

      <div style={{ flex: 1 }}>
        <Container maxWidth="md" sx={{ mt: 4 }}>
          {searchError && (
            <Alert
              severity="error"
              onClose={() => setSearchError(null)}
              sx={{ mb: 2 }}
            >
              {searchError}
            </Alert>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: results.length === 0 && !searchError ? "38vh" : "auto",
            }}
          >
            <Box sx={{ width: "100%", maxWidth: 600 }}>
              <SearchBar onSearch={handleSearch} loading={isSearching} />
            </Box>
          </Box>

          <SnippetList
            results={results}
            onExplain={handleExplain}
            isSearching={isSearching}
          />
        </Container>
      </div>

      {selectedSnippet && (
        <ExplanationPanel
          snippet={selectedSnippet}
          aiText={aiExplanation}
          onClose={handleCloseExplanation}
        />
      )}

      <Footer />
    </div>
  );
}

export default App;
