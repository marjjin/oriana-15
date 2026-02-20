import { useState } from "react";
import "./register.css";
import { supabase } from "../../lib/supabaseClient";
import sha256 from "crypto-js/sha256";

function buildSessionUser(userRow) {
  if (!userRow) {
    return null;
  }

  const safeUser = { ...userRow };
  delete safeUser.password_hash;

  return {
    ...safeUser,
    profile_photo_url: safeUser.profile_photo_url || "",
  };
}

function Register({ onClose, onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    const normalizedUsername = username.trim();

    if (!normalizedUsername || !password) {
      setError("Completa todos los campos.");
      setLoading(false);
      return;
    }
    try {
      const { data: existingUsers, error: existingError } = await supabase
        .from("users")
        .select("id")
        .ilike("user_name", normalizedUsername)
        .limit(1);

      if (existingError) {
        setError("No se pudo validar el nombre de usuario.");
        setLoading(false);
        return;
      }

      if ((existingUsers || []).length > 0) {
        setError("El usuario ya existe.");
        setLoading(false);
        return;
      }

      const password_hash = sha256(password).toString();

      const { data: insertedUsers, error: insertError } = await supabase
        .from("users")
        .insert([{ user_name: normalizedUsername, password_hash }])
        .select("*");

      if (insertError) {
        if (insertError.code === "23505") {
          setError("El usuario ya existe.");
          setLoading(false);
          return;
        }
        setError("Error al crear la cuenta.");
        setLoading(false);
        return;
      }

      const createdUser = buildSessionUser(insertedUsers?.[0]);
      setLoading(false);
      if (createdUser && onSuccess) {
        onSuccess(createdUser);
        return;
      }
      onClose();
    } catch {
      setError("Error al crear la cuenta.");
      setLoading(false);
    }
  };

  return (
    <div className="oriana-register-modal" onClick={onClose}>
      <div
        className="oriana-register-modal__content"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="oriana-register-modal__close"
          type="button"
          onClick={onClose}
          aria-label="Cerrar registro"
        >
          ×
        </button>

        <h3 className="oriana-register-modal__title">Crear cuenta</h3>

        <label className="oriana-login__label" htmlFor="register_user_name">
          Usuario
        </label>
        <input
          className="oriana-login__input"
          type="text"
          id="register_user_name"
          name="register_user_name"
          placeholder="Elegí un usuario"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label className="oriana-login__label" htmlFor="register_password">
          Contraseña
        </label>
        <input
          className="oriana-login__input"
          type="password"
          id="register_password"
          name="register_password"
          placeholder="Creá tu contraseña"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <div className="oriana-register-modal__error">{error}</div>}

        <button
          className="oriana-login__button"
          type="button"
          disabled={loading}
          onClick={handleRegister}
        >
          {loading ? "Creando..." : "Crear cuenta"}
        </button>
      </div>
    </div>
  );
}

export default Register;
