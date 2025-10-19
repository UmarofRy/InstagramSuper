import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";
import "./index.css";

function Root() {
  return (
    <StrictMode>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <App />
            </BrowserRouter>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </StrictMode>
  );
}

createRoot(document.getElementById("root")).render(<Root />);
