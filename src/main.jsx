import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import NexusAgent from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <NexusAgent />
  </StrictMode>
);
