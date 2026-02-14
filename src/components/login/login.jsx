import { useState } from 'react'
import './login.css'

function Login() {
	const [showRegister, setShowRegister] = useState(false)

	return (
		<section className="oriana-login">
			<form className="oriana-login__card">
				<h2 className="oriana-login__title">Iniciar sesión</h2>
				<p className="oriana-login__text">Entrá para seguir compartiendo tus momentos.</p>

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
				/>

				<button className="oriana-login__button" type="submit">
					Ingresar
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
				<div className="oriana-register-modal" onClick={() => setShowRegister(false)}>
					<div
						className="oriana-register-modal__content"
						role="dialog"
						aria-modal="true"
						onClick={(event) => event.stopPropagation()}
					>
						<button
							className="oriana-register-modal__close"
							type="button"
							onClick={() => setShowRegister(false)}
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
						/>

						<button className="oriana-login__button" type="button">
							Crear cuenta
						</button>
					</div>
				</div>
			)}
		</section>
	)
}

export default Login
