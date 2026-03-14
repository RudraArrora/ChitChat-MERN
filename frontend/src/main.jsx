import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "./components/ui/provider";
import { BrowserRouter } from "react-router-dom/cjs/react-router-dom.min";
import ChatProvider from "./Context/ChatProvider";

// ✅ import toaster UI
import { Toaster, toaster } from "@/components/ui/toaster";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ChatProvider>
      <Provider>
        {/* ✅ mount once globally */}
        <Toaster toaster={toaster} />
        {/* (if your Toaster doesn't need prop, then use: <Toaster />) */}

        <App />
      </Provider>
    </ChatProvider>
  </BrowserRouter>
);
