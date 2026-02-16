import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/header/headers";
import Login from "./components/login/login";
import Footer from "./components/Footer/footer";
import Feed from "./components/Feed/feed";

const SESSION_KEY = "oriana_current_user";

function getSessionUser() {
  const savedUser = localStorage.getItem(SESSION_KEY);
  if (!savedUser) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(savedUser);
    return parsedUser?.id ? parsedUser : null;
  } catch {
    return null;
  }
}

function App() {
  const [sessionUser, setSessionUser] = useState(() => getSessionUser());

  const handleLogin = (user) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    setSessionUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSessionUser(null);
  };

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route
          path="/"
          element={sessionUser ? <Navigate to="/feed" replace /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/feed"
          element={
            sessionUser ? (
              <Feed currentUser={sessionUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
