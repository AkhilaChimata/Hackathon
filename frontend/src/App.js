import React, { useState } from "react";
import Container from "@mui/material/Container";
import Alert from "@mui/material/Alert";

import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import SnippetList from "./components/SnippetList";
import ExplanationPanel from "./components/ExplanationPanel";
import Footer from "./components/Footer";

import { searchConcepts, explainText } from "./api";

function App() {
  // ─── State Hooks ─────────────────────────────────────────────────────────
  const [results, setResults] = useState([]);            // array of snippet objects
  const [selectedSnippet, setSelectedSnippet] = useState(null); // snippet to explain
  const [aiExplanation, setAiExplanation] = useState("");      // AI-generated text
  const [isSearching, setIsSearching] = useState(false);       // search loading
  const [searchError, setSearchError] = useState(null);        // search error message

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleSearch = async (query) => {
    setIsSearching(true);
    setSearchError(null);
    setResults([]);            // Clear previous results
    setSelectedSnippet(null);  // Close any open explanation
    setAiExplanation("");

    try {
      const res = await searchConcepts(query);
      // Expect res.data.results to be an array of { _id, title, text }
      setResults(res.data.results || []);
    } catch (err) {
      console.error("Search error:", err);
      setSearchError("Error fetching results. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleExplain = async (id, text, mode) => {
    // Find the snippet object in results by its ID
    const snippet = results.find((r) => r._id === id);
    setSelectedSnippet(snippet);
    setAiExplanation(""); // Clear previous explanation text

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
    <div className="App">
      <Header />

      <Container maxWidth="md" sx={{ mt: 4 }}>
        {/* 1. Show search error if any */}
        {searchError && (
          <Alert
            severity="error"
            onClose={() => setSearchError(null)}
            sx={{ mb: 2 }}
          >
            {searchError}
          </Alert>
        )}

        {/* 2. Search bar */}
        <SearchBar onSearch={handleSearch} loading={isSearching} />

        {/* 3. List of snippet results */}
        <SnippetList
          results={results}
          onExplain={handleExplain}
          isSearching={isSearching}
        />
      </Container>

      {/* 4. Explanation Panel (modal) */}
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