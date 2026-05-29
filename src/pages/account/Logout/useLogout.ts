// src/hooks/useLogout.ts
import useAuth from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react'; // Importamos useEffect
export default function useLogout(){
	const { logout } = useAuth();
	const navigate = useNavigate();
	// Ejecuta el logout y la navegación cuando el componente que usa este hook se monte
	useEffect(() => {
		const performLogoutAndRedirect = async () => {
			try {
				await logout(); // Esto ya limpia localStorage
				navigate('/account/login', { replace: true }); // Redirige al login
			} catch (error) {
				console.error('Error durante logout:', error);
				// Puedes añadir alguna notificación al usuario si el logout falla
			}
		};
		performLogoutAndRedirect();
	}, [logout, navigate]); // Dependencias: logout y navigate (son estables, pero buena práctica incluirlas)
	// Este hook ya no necesita devolver una función performLogout, ya que se ejecuta automáticamente
	// Podría devolver un estado de "isLoggingOut" si quisieras mostrar un spinner, por ejemplo.
	return null; // O un objeto vacío, o un estado de carga si lo necesitas
};