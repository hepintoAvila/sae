import { Button, Card } from 'react-bootstrap';

// assets
import LogoDark from '@/assets/images/logo-dark.png';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const TopBarPublic = ({ children }: { children?: React.ReactNode }) => {
    const userData = localStorage.getItem('userData');
    const isLogged = !!userData;
    
    // ✅ Estado para mostrar/ocultar login
    const [showLogin, setShowLogin] = useState(false);

    const handleToggleLogin = () => setShowLogin(!showLogin);
    
    const handleLogout = () => {
        localStorage.removeItem('userData');
        localStorage.removeItem('dependencia_activa');
        setShowLogin(false);
        window.location.reload();
    };
    return (
        <><div className={'navbar-custom'}>
            {/* ✅ PANEL IZQUIERDO - SOLO SE MUESTRA AL HACER CLIC */}

            <div className="topbar container-fluid">
                <div className="d-flex align-items-center gap-lg-2 gap-1" style={{
                    /* padding: 0rem 0rem 0rem 0rem; */
                    marginTop: '0rem',
                    marginBottom: '-1.2rem',
                }}>
                    <div className="auth-brand text-center text-lg-start">
                        <Link to="/" className="logo-dark">
                            <span><img src={LogoDark} alt="" height={74} /></span>
                        </Link>
                    </div>
                </div>

                <ul className="topbar-menu d-flex align-items-center gap-3">
                    <li className="d-none d-md-inline-block">
                        {isLogged ? (
                            <Button variant="outline-light" size="sm" onClick={handleLogout}>
                                <i className="mdi mdi-logout me-1"></i>Salir
                            </Button>
                        ) : (
                            <Button
                                variant={showLogin ? "light" : "primary"}
                                size="sm"
                                onClick={handleToggleLogin}
                            >
                                <i className={`mdi ${showLogin ? 'mdi-close' : 'mdi-login'} me-1`}></i>
                                {showLogin ? 'Cerrar' : 'Iniciar Sesión'}
                            </Button>
                        )}
                    </li>
                </ul>
            </div>
            {showLogin && !isLogged && (
                    <div className="auth-fluid-form-box">
                        <div className="leftside-menu">
                            <Card.Body className="d-flex flex-column h-100 gap-3">
                                <div className="my-auto">{children}</div>
                            </Card.Body>
                        </div>
                    </div>
                )}
        </div>
        </>
    );
};

export default TopBarPublic;
