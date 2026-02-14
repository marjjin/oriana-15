import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Header from "./components/header/headers";
import Login from "./components/login/login";
import Footer from "./components/Footer/footer";
import "./global.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function Feed() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      ¡Bienvenido al feed!
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/feed" element={<Feed />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  </StrictMode>,
);
