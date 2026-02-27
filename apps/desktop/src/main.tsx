import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import OverlayWindow from "./OverlayWindow"
import "./index.css"

const isOverlay = typeof window !== "undefined" && window.location.hash === "#overlay"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {isOverlay ? <OverlayWindow /> : <App />}
  </React.StrictMode>
)
