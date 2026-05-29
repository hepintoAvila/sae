import React, { Suspense, useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { useToggle } from '@/hooks';
import { useThemeContext } from '@/common/context';
import { changeHTMLAttribute } from '@/utils';
import { UserData } from '../type';

const Topbar = React.lazy(() => import('../Topbar/'));
const Navbar = React.lazy(() => import('./Navbar'));
const Footer = React.lazy(() => import('../Footer'));
const RightSidebar = React.lazy(() => import('../RightSidebar'));

const loading = () => <div className="text-center"></div>;

const HorizontalLayout = () => {
  const { settings } = useThemeContext();
  const [horizontalDropdownOpen, toggleMenu] = useToggle();
  const [userData, setUserData] = useState<UserData | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // layouts
  useEffect(() => {
    changeHTMLAttribute('data-layout', 'topnav');
    return () => document.documentElement.removeAttribute('data-layout');
  }, []);

  useEffect(() => changeHTMLAttribute('data-bs-theme', settings.theme), [settings.theme]);
  useEffect(() => changeHTMLAttribute('data-layout-mode', settings.layout.mode), [settings.layout.mode]);
  useEffect(() => changeHTMLAttribute('data-menu-color', settings.sidebar.theme), [settings.sidebar.theme]);
  useEffect(() => changeHTMLAttribute('data-topbar-color', settings.topbar.theme), [settings.topbar.theme]);
  useEffect(() => changeHTMLAttribute('data-layout-position', settings.layout.menuPosition), [settings.layout.menuPosition]);

  // 1. Cargar usuario y redirigir si no hay
  useEffect(() => {
    try {
      const stored = localStorage.getItem('userData');
      const parsed = stored ? JSON.parse(stored) as UserData : null;
      setUserData(parsed);

      // si no hay usuario Y no estamos ya en login
      const isLoginPage = location.pathname.includes('/account/login');
      if (!parsed && !isLoginPage) {
        navigate('/account/login', { replace: true });
      }
    } catch (e) {
      console.error('Error userData:', e);
      navigate('/account/login', { replace: true });
    }
  }, [navigate, location.pathname]);

  // 2. No renderices el layout si no hay usuario (evita flash)
  if (userData === null && !location.pathname.includes('/account/login')) {
    return loading();
  }

  return (
    <div className="wrapper">
      <Suspense fallback={loading()}>
        <Topbar
          toggleMenu={toggleMenu}
          navOpen={horizontalDropdownOpen}
          userData={userData ?? undefined}
        />
      </Suspense>

      <Suspense fallback={loading()}>
        <Navbar isMenuOpened={horizontalDropdownOpen} />
      </Suspense>

      <div className="content-page">
        <div className="content">
          <Container fluid>
            <Suspense fallback={loading()}>
              <Outlet />
            </Suspense>
          </Container>
        </div>

        <Suspense fallback={loading()}><Footer /></Suspense>
        <Suspense fallback={loading()}><RightSidebar /></Suspense>
      </div>
    </div>
  );
};

export default HorizontalLayout;