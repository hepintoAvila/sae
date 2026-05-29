// src/hooks/useAuth.ts
//import { config, encodeBasicUrl } from "@/common";
import AuthService from "@/common/api/AuthService"; // Asegúrate de que esta ruta es correcta
import { AuthContext } from "@/common/context/useAuthContext";
import { AuthData, MenuItem, Permiso, UserProps } from "@/types/User"; // Asegúrate de importar UserProps y que los tipos AuthData, Permiso, MenuItem estén correctos
import { useContext, useEffect, useState } from "react";
import Swal from 'sweetalert2';

export default function useAuth(){
  const deleteCookies = () => {
    const cookies = document.cookie.split("; ");
    cookies.forEach((cookie) => {
      const parts = cookie.split("=");
      const name = parts.shift();
      // Asegúrate de que el dominio sea correcto si tu app está en un subdominio
      // o quita el dominio si es en el dominio principal y subrutas
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
    });
  };
   
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('AuthContext no está disponible');
  }
   
  const {setCredentials, clearCredentials } = authContext;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AuthData | null>(null);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  // Si MENU_ITEMS_CONTEXT es para el estado interno del menú, debería ser MenuItem[]
  const [MENU_ITEMS_CONTEXT, setMenu] = useState<MenuItem[]>([]); // Corregido el tipo
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [menu, setMenup] = useState<MenuItem[]>([]); // Este es el estado real del menú, mantiene MenuItem[]
  
  // Verificar autenticación al inicializar
  useEffect(() => {
    checkAuthStatus();   
  }, []);
  const checkAuthStatus = () => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const savedMenu = localStorage.getItem('userMenu');
        if (savedMenu) {
          setMenup(JSON.parse(savedMenu));
        }
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        logout(); // Llama a logout para limpiar si los datos están corruptos
      }
    }
    setLoading(false);
  };
  
  // El tipo para credentialsAuth ahora es UserProps
  const loginUser = async (credentialsAuth: UserProps) => { 
    setIsAuthenticated(false);
    setLoading(true);
    setError(null);
       
    try {
      // 1. Instanciar el nuevo AuthService
      const authService = AuthService();
      // 2. Llamar a la nueva función 'authenticateUser'
      const result = await authService.authenticateUser(credentialsAuth);
       
      if (result.status === 'success' && result.data) {
        // Los datos ahora vienen directamente bajo result.data, con las propiedades correctas (Auth, Permisos, Menu)
        setUser(result.data.Auth);
        setPermisos(result.data.Permisos);
        setMenu(result.data.Menu); // Actualiza el MENU_ITEMS_CONTEXT
        setMenup(result.data.Menu); // Actualiza el estado 'menu' (o 'menup')
         
        setIsAuthenticated(true);
        setCredentials({
          login: credentialsAuth.login,
          password: credentialsAuth.password,
          AppKey: result.data.Auth.AppKey,
          id_dependencia: result.data.Auth.dependencia_id,
          Nom: result.data.Auth.Nom,
          Email: result.data.Auth.Email,
          Rol: result.data.Auth.Rol,
          status: result.data.Auth.status
        } as UserProps); // Asegúrate de que el tipo coincide con lo que espera tu contexto
          
        // Guardar en localStorage
        if (result.data.Auth.AppKey) {
          localStorage.setItem('authToken', result.data.Auth.AppKey);
        }
        localStorage.setItem('userData', JSON.stringify(result.data.Auth));
        localStorage.setItem('userPermisos', JSON.stringify(result.data.Permisos));
        localStorage.setItem('userMenu', JSON.stringify(result.data.Menu));
        
        // Transformación de permisos si es necesaria (ej. a un mapa)
        const permisosMap = result.data.Permisos.reduce((acc: { [key: string]: Permiso }, permiso) => {
          acc[`${permiso.menu}-${permiso.submenu}`] = permiso;
          return acc;
        }, {});
        setPermisos(Object.values(permisosMap)); // Almacenar el array de permisos, o el mapa si es como lo usas
        
        return result.data; // Devuelve la data de la respuesta
      } else if (result.status === 'error') {
            Swal.fire({
              title: 'Error',
              text: result.error || 'Error de autenticación', // Usa el mensaje de error del resultado
              icon: 'error',
              timer: 2000,
            }); 
            setIsAuthenticated(false);
            // Es importante lanzar el error para que el flujo del catch lo capture
            throw new Error(result.error || 'Autenticación fallida');
      } else {
        setIsAuthenticated(false);
        // Si result.status no es 'success' ni 'error' o falta info, también lanzar error
        throw new Error(result.error || result.metadata?.message || 'Autenticación fallida: respuesta inesperada');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      // Relanzar el error para que los componentes que llaman a loginUser puedan manejarlo
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const logout = async () => {
		await new Promise(resolve => setTimeout(resolve, 100)); // Mantener el delay si lo quieres
		setUser(null);
		setPermisos([]);
		setIsAuthenticated(false);
    clearCredentials();
    setMenu([]);
    setMenup([]); // También limpiar el estado 'menu'
    
		localStorage.removeItem('authToken');
		localStorage.removeItem('userData');
		localStorage.removeItem('userPermisos');
		localStorage.removeItem('userMenu');
		localStorage.removeItem('Aulas'); // Limpiar si estos son datos de usuario y no públicos que se cargan siempre
		localStorage.removeItem('Prestamos'); // Limpiar si estos son datos de usuario
    deleteCookies(); 
	};
  // ... (tus funciones hasPermission, canAccess, getFilteredMenu si las tienes descomentadas y actualizadas)
  // console.log('isAuthenticated', isAuthenticated);     
  return {
    loading,
    error,
    user,
    permisos,
    isAuthenticated,
    loginUser,
    logout,
    checkAuthStatus,
    MENU_ITEMS_CONTEXT,
    // hasPermission, // Descomenta si las implementas y las quieres exportar
    // canAccess,     // Descomenta si las implementas y las quieres exportar
    // getFilteredMenu, // Descomenta si las implementas y las quieres exportar
    menu // Exportar el menú actual
  };
};