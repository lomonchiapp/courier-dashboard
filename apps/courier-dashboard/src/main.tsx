import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import App from "./App";
import "@/styles/globals.css";

// Apply saved theme
const savedTheme = JSON.parse(localStorage.getItem("courier-theme") || "{}");
document.documentElement.className = savedTheme?.state?.mode || "dark";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
