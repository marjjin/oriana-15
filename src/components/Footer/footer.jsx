import './footer.css'

function Footer() {
	const currentYear = new Date().getFullYear()
	const instagramUrl = 'https://www.instagram.com/tinchocarmona/'
	const whatsappMessage = encodeURIComponent('Hola, quiero info de diseño y desarrollo web.')
	const whatsappUrl = `https://wa.me/5493364589521?text=${whatsappMessage}`

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
