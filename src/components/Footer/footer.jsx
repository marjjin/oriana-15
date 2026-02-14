import './footer.css'

function Footer() {
	const currentYear = new Date().getFullYear()
	const instagramUrl = 'https://instagram.com/tu_usuario'
	const whatsappUrl = 'https://wa.me/5491100000000'

	return (
		<footer className="oriana-footer">
			<div className="oriana-footer__content">
				<p className="oriana-footer__line">Hecho por Carmona Martin Andres</p>
				<p className="oriana-footer__line oriana-footer__line--muted">
					Publicidad: diseño y desarrollo web · {currentYear}
				</p>
				<nav className="oriana-footer__social" aria-label="Redes de contacto">
					<a className="oriana-footer__link" href={instagramUrl} target="_blank" rel="noreferrer">
						Instagram
					</a>
					<span className="oriana-footer__dot">·</span>
					<a className="oriana-footer__link" href={whatsappUrl} target="_blank" rel="noreferrer">
						WhatsApp
					</a>
				</nav>
			</div>
		</footer>
	)
}

export default Footer
