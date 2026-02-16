import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Header from "./components/header/headers";
import Login from "./components/login/login";
import Footer from "./components/Footer/footer";
import Feed from "./components/Feed/feed";
import "./global.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

const SESSION_KEY = "oriana_current_user";

function hasSession() {
  const savedUser = localStorage.getItem(SESSION_KEY);
  if (!savedUser) {
    return false;
  }

  try {
    return Boolean(JSON.parse(savedUser)?.id);
  } catch {
    return false;
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Header />
      <Routes>
        <Route
          path="/"
          element={hasSession() ? <Navigate to="/feed" replace /> : <Login />}
        />
        <Route
          path="/feed"
          element={hasSession() ? <Feed /> : <Navigate to="/" replace />}
        />
      </Routes>
      <Footer />
    </BrowserRouter>
  </StrictMode>,
);
