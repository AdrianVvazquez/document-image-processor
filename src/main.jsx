import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  // A side effect of StrictMode is that it will intentionally double-invoke certain functions (like component constructors, render methods, and effects) to help identify side effects. This is only done in development mode and does not affect production builds.
  // import { StrictMode } from "react";
  // <StrictMode>
  // </StrictMode>,
    <App />,
);
