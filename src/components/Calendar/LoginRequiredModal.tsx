// LoginRequiredModal.tsx
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Para el botón de "Ir a Login"
import { useTranslation } from 'react-i18next'; // Para traducciones
interface LoginRequiredModalProps {
  show: boolean;
  onHide: () => void;
  redirectTo?: string; // Opcional, por si quieres que el botón redirija a una URL específica
}
const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({ show, onHide, redirectTo = '/account/login' }) => {
  const { t } = useTranslation();
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('Acceso Restringido')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{t('Debes iniciar sesión para realizar esta acción.')}</p>
        <p>{t('Por favor, inicia sesión, en el boton superior derecho,  para continuar.')}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {t('Cerrar')}
        </Button>
        <Link to={redirectTo}>
          <Button variant="primary" onClick={onHide}>
            {t('Ir a Iniciar Sesión')}
          </Button>
        </Link>
      </Modal.Footer>
    </Modal>
  );
};
export default LoginRequiredModal;