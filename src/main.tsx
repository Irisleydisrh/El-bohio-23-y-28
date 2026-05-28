import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Try-catch wrapper for entire app to prevent crash
const initApp = () => {
  try {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      console.error('Root element not found');
      return;
    }
    const root = createRoot(rootElement);
    root.render(<App />);
  } catch (error) {
    console.error('Fatal error initializing app:', error);
    // Show fallback UI
    document.getElementById("root")!.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#1a1a1a;color:#fff;flex-direction:column;gap:1rem;font-family:system-ui;">
        <h1>El Bohío 23 y 28</h1>
        <p>Error al cargar. Intenta recargar la página.</p>
        <button onclick="window.location.reload()" style="padding:0.75rem 1.5rem;background:#f59e0b;color:#000;border:none;border-radius:0.5rem;cursor:pointer;">Recargar</button>
      </div>
    `;
  }
};

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  // Prevent default for CSP/eval errors
  if (event.message && (event.message.includes('eval') || event.message.includes('Content Security Policy'))) {
    console.warn('CSP blocked:', event.message);
    event.preventDefault();
    return false;
  }
  console.error('Global error:', event.error);
  event.preventDefault();
});

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && (event.reason.message?.includes('eval') || event.reason.message?.includes('Content Security Policy'))) {
    console.warn('CSP promise rejection:', event.reason);
    event.preventDefault();
    return;
  }
  console.error('Unhandled rejection:', event.reason);
  event.preventDefault();
});

initApp();
