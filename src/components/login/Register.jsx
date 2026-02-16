import { useState } from "react";
import "./register.css";
import { supabase } from "../../lib/supabaseClient";
import sha256 from "crypto-js/sha256";

function Register({ onClose, onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    if (!username || !password) {
      setError("Completa todos los campos.");
      setLoading(false);
      return;
    }
    try {
      // Verificar si el usuario ya existe
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("user_name", username)
        .single();
      if (existing) {
        setError("El usuario ya existe.");
        setLoading(false);
        return;
      }
      // Hashear la contraseña
      const password_hash = sha256(password).toString();
      // Insertar el usuario
      const { data: insertedUsers, error: insertError } = await supabase
        .from("users")
        .insert([{ user_name: username, password_hash }])
        .select("id, user_name");
      if (insertError) {
        setError("Error al crear la cuenta.");
        setLoading(false);
        return;
      }

      const createdUser = insertedUsers?.[0];
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
