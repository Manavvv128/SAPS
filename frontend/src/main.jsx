import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
// styles.css removed — all styles are injected by GlobalStyles inside App.jsx

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
