import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import "leaflet/dist/leaflet.css";

// React App Rendering
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Vite projects mein path hamesha '/' se start karein public folder ke liye
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('🚀 PWA: Service Worker Registered with scope:', registration.scope);
      })
      .catch((err) => {
        console.error('❌ PWA: Service Worker Registration Failed:', err);
      });
  });
}