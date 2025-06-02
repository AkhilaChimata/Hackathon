import React from "react";
import ReactDOM from "react-dom/client"; // Use the /client version
import App from "./App";
import { ThemeProvider, createTheme } from "@mui/material";
import "./index.css"; // your optional global CSS reset

// Create a theme (customize colors here if you like)
const theme = createTheme({
  // palette: { primary: { main: "#1976d2" }, secondary: { main: "#f50057" } },
});

// Create root and render app
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>
);
