// i18n.js (o i18n.ts)
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
i18n
  .use(initReactI18next) // Pasa i18n a react-i18next
  .init({
    resources: {
      en: {
        translation: {
          "Don't have an account?": "Don't have an account?",
          "Sign Up": "Sign Up",
          "Sign In": "Sign In",
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
export default i18n;