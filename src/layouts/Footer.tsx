import { Link } from 'react-router-dom';

export default function Footer() {
	const currentYear = new Date().getFullYear();
	return (
		<footer className="footer footer-font">
			<div className="container-fluid">
				<div className="d-flex justify-content-between align-items-center">
					{/* IZQUIERDA */}
					<Link to="https://biblioteca.unicesar.edu.co/" target="_blank" className="text-decoration-none">
						<small className="text-white">
							{currentYear} © Biblioteca Universidad Popular del Cesar.
						</small>
					</Link>
					
					{/* DERECHA */}
					<Link to="https://biblioteca.unicesar.edu.co/" target="_blank" className="text-decoration-none">
						<small className="text-white">
							Desarrollado por Ing. Holmes Elias Pinto Avila.
						</small>
					</Link>
				</div>
			</div>
		</footer>
	);
}