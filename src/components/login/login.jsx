import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import sha256 from "crypto-js/sha256";
import Register from "./Register.jsx";
import "./login.css";

const SESSION_KEY = "oriana_current_user";

function Login({ onLogin }) {
  const [showRegister, setShowRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!username || !password) {
      setError("Completa todos los campos.");
      setLoading(false);
      return;
    }
    try {
      const password_hash = sha256(password).toString();
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id, user_name")
        .eq("user_name", username)
        .eq("password_hash", password_hash)
        .single();
      if (userError || !user) {
        setError("Usuario o contraseña incorrectos.");
        setLoading(false);
        return;
      }

      if (onLogin) {
        onLogin(user);
      } else {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      }
      setLoading(false);
      navigate("/feed", { replace: true });
    } catch {
      setError("Error al iniciar sesión.");
      setLoading(false);
    }
  };

  return (
    <section className="oriana-login">
      <form className="oriana-login__card" onSubmit={handleLogin}>
        <h2 className="oriana-login__title">Iniciar sesión</h2>
        <p className="oriana-login__text">
          Entrá para seguir compartiendo tus momentos.
        </p>

        <label className="oriana-login__label" htmlFor="user_name">
          Usuario
        </label>
        <input
          className="oriana-login__input"
          type="text"
          id="user_name"
          name="user_name"
          placeholder="Tu usuario"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label className="oriana-login__label" htmlFor="password">
          Contraseña
        </label>
        <input
          className="oriana-login__input"
          type="password"
          id="password"
          name="password"
          placeholder="Tu contraseña"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <div className="oriana-register-modal__error">{error}</div>}

        <button
          className="oriana-login__button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        <button
          className="oriana-login__button oriana-login__button--outline"
          type="button"
          onClick={() => setShowRegister(true)}
          aria-expanded={showRegister}
        >
          Registrarse
        </button>
      </form>

      {showRegister && (
        <Register
          onClose={() => setShowRegister(false)}
          onSuccess={(newUser) => {
            if (onLogin) {
              onLogin(newUser);
            } else {
              localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
            }
            setShowRegister(false);
            navigate("/feed", { replace: true });
          }}
        />
      )}
    </section>
  );
}

export default Login;
