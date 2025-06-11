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

function App() {
  const [results, setResults] = useState([]);
  const [selectedSnippet, setSelectedSnippet] = useState(null);
  const [aiExplanation, setAiExplanation] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

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
  const handleExplain = async (id, _, mode) => {
    const snippet = results.find((r) => r._id === id);
    setSelectedSnippet(snippet);
    setAiExplanation("");
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
          onClose={handleClose}
        />
      )}

      <Footer />
    </Box>
  );
}

export default App;
