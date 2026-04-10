import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import MythosAI from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MythosAI />
  </StrictMode>
);
