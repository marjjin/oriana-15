import { Suspense, lazy, useEffect, useState } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/header/headers";
import Footer from "./components/Footer/footer";
import { supabase } from "./lib/supabaseClient";

const Login = lazy(() => import("./components/login/login"));
const Feed = lazy(() => import("./components/Feed/feed"));
const Profile = lazy(() => import("./components/Profile"));

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

  useEffect(() => {
    const syncSessionUser = async () => {
      if (!sessionUser?.id) {
        return;
      }

      const { data: dbUser } = await supabase
        .from("users")
        .select("*")
        .eq("id", sessionUser.id)
        .maybeSingle();

      if (!dbUser?.id) {
        return;
      }

      const nextUser = { ...dbUser };
      delete nextUser.password_hash;

      setSessionUser((prevUser) => {
        if (!prevUser?.id || String(prevUser.id) !== String(nextUser.id)) {
          return prevUser;
        }

        const mergedUser = { ...prevUser, ...nextUser };
        localStorage.setItem(SESSION_KEY, JSON.stringify(mergedUser));
        return mergedUser;
      });
    };

    syncSessionUser();
  }, [sessionUser?.id]);

  const handleLogin = (user) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    setSessionUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSessionUser(null);
  };

  const handleProfileUpdate = (updates) => {
    setSessionUser((prevUser) => {
      if (!prevUser) {
        return prevUser;
      }

      const nextUser = { ...prevUser, ...updates };
      localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
      return nextUser;
    });
  };

  return (
    <HashRouter>
      <Header />
      <Suspense fallback={<div />}>
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
          <Route
            path="/perfil"
            element={
              sessionUser ? (
                <Profile
                  currentUser={sessionUser}
                  onLogout={handleLogout}
                  onProfileUpdate={handleProfileUpdate}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/perfil/:userId"
            element={
              sessionUser ? (
                <Profile
                  currentUser={sessionUser}
                  onLogout={handleLogout}
                  onProfileUpdate={handleProfileUpdate}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </Suspense>
      <Footer />
    </HashRouter>
  );
}

export default App;
