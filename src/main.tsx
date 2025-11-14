/**
 * @fileoverview Application Entry Point
 * React application entry point that mounts the App component to the DOM.
 * Initializes React 18 with StrictMode for development checks.
 *
 * @module main
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

/**
 * Mount the React application to the DOM
 *
 * - Uses React 18 createRoot API
 * - Wraps App in StrictMode for development checks
 * - Mounts to element with id 'root'
 * - Loads global styles from index.css
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
