import { PageBreadcrumb} from '@/components';
import AccountWrapper2 from '../AccountWrapper2';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import PageLoader from '@/components/PageLoader';
import Footer from '@/layouts/Footer';
import Logo from '@/assets/images/logo-dark-sm.png';
i18n
  .use(initReactI18next) // Pasa i18n a react-i18next
  .init({
    resources: {
      en: {
        translation: {
          "Don't have an account?": "Don't have an account?",
          "Sign Up": "Sign Up",
          "Sign In": "Sign In",
          "Sign In using": "Sign In using",
          "Enter your email address and password to access account.": "Enter your email address and password to access account.",
          "Email Address": "Email Address",
          "Enter your email": "Enter your email",
          "Password": "Password",
          "Enter your password": "Enter your password",
          "Forgot your password?": "Forgot your password?",
          "Remeber me": "Remember me",
          "Log In": "Log In",
          // ... todas tus traducciones en inglés
        }
      },
      es: {
        translation: {
          "Don't have an account?": "¿No tienes una cuenta?",
          "Sign Up": "Registrarse",
          "Sign In": "Iniciar Sesión",
          "Enter your email address and password to access account.": "Introduce tu correo electrónico y contraseña para acceder a tu cuenta.",
          "Email Address": "Correo Electrónico",
          "Enter your email": "Introduce tu correo electrónico",
          "Password": "Contraseña",
          "Enter your password": "Introduce tu contraseña",
          "Forgot your password?": "¿Olvidaste tu contraseña?",
          "Remeber me": "Recordarme",
          "Log In": "Iniciar Sesión",
          "Sign In using": "Iniciar Sesión usando",
          // ... todas tus traducciones en español
        }
      }
    },
    lng: "es", // <--- ¡Aquí se configura el idioma por defecto a español!
    fallbackLng: "en", // Idioma de respaldo si una traducción no se encuentra en "es"
    interpolation: {
      escapeValue: false // React ya protege contra XSS
    }
  });
import useLogin, { } from './useLogin';
import { useAulasContext } from '@/common/context/useAulasContext'; // Ajusta la ruta si es diferente
import LoginForm from './LoginForm';
import { Suspense } from 'react';
 
// ... (resto de tus imports)

const Login = () => {
	const { t } = useTranslation();
	const { loading, login, redirectUrl,isAuthenticated } = useLogin();
    // ¡Aquí es donde llamas al contexto!
    // Puedes desestructurar las propiedades que necesites
	const { loadingInitialData } = useAulasContext();
	 
	return (
		<>
			{isAuthenticated && <Navigate to={redirectUrl} replace />}
			<PageBreadcrumb title="Login" />
			<AccountWrapper2>
<Link to="/" className="d-flex align-items-center text-decoration-none mb-3">
	<span className="me-3">
		<img src={Logo} alt="" height="42" />
	</span>
	<p className="text-muted mb-0">
		{t('Sign In using')} <strong>UNICESAR</strong>
	</p>
</Link>
			<p className="text-muted mb-0">
		{t('Enter your email address and password to access account.')}
	</p>
       <LoginForm onSubmit={login} loading={loading} />
     
      <p 
        style={{ 
          visibility: loadingInitialData ? 'visible' : 'hidden',
          height: '20px', // reserva el espacio siempre
          width: '100%',
          textAlign: 'center',
          margin: 0 
        }}
      >
        Cargando datos públicos...
      </p>
      <Suspense fallback={<PageLoader />}>
			<Footer />
		</Suspense>
			</AccountWrapper2>

		</>
	);
};
export default Login;