import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { AuthProvider } from "./contexts/SimpleAuthContext";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element not found');
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <AuthProvider>
          <App />
        </AuthProvider>
      </StrictMode>
    );
  } catch (error) {
    console.error('Failed to render app:', error);
  }
}
