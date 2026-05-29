import { Link } from 'react-router-dom';
import { profileMenus } from './data';
import ProfileDropdown from './ProfileDropdown';
import MaximizeScreen from './MaximizeScreen';
import { Badge, OverlayTrigger, Tooltip, Dropdown } from 'react-bootstrap';
import { useMemo } from 'react';

// assets
import userImage from '@/assets/images/users/avatar-1.jpg';
import LogoDark from '@/assets/images/logo-dark-in.png';
import { ThemeSettings, useAulasContext, useThemeContext } from '@/common';
import useThemeCustomizer from '@/components/ThemeCustomizer/useThemeCustomizer';
import { useViewport } from '@/hooks';
import { UserData } from '../type';

type TopbarProps = {
	toggleMenu?: () => void;
	navOpen?: boolean;
	userData?: UserData;
};

const Topbar = ({ toggleMenu, navOpen, userData }: TopbarProps) => {
	const { settings, updateSettings, updateSidebar } = useThemeContext();
	const { sideBarType } = useThemeCustomizer();
	const { width } = useViewport();
	const { prestamos = [] } = useAulasContext();

	// Email del usuario
	const userEmail = useMemo(() => {
		try {
			const raw = localStorage.getItem('userData');
			if (raw) {
				const data = JSON.parse(raw);
				return (data?.email || data?.Email || data?.mail || '').toLowerCase();
			}
			return (localStorage.getItem('Email') || localStorage.getItem('email') || '').toLowerCase();
		} catch {
			return '';
		}
	}, []);

	const now = new Date();

	const misPrestamos = useMemo(() =>
		prestamos.filter(p => p?.email && p.email.toLowerCase() === userEmail),
	[prestamos, userEmail]);

	const vencidosList = useMemo(() =>
		misPrestamos.filter(p => {
			if (p.statut!== 'Activo' ||!p.end) return false;
			const end = new Date(String(p.end).replace(' ', 'T'));
			return end < now;
		}),
	[misPrestamos, now]);

	const activosHoy = useMemo(() =>
		misPrestamos.filter(p => {
			if (p.statut!== 'Activo' ||!p.start ||!p.end) return false;
			const s = new Date(String(p.start).replace(' ', 'T'));
			const e = new Date(String(p.end).replace(' ', 'T'));
			return s <= now && now <= e;
		}).length,
	[misPrestamos, now]);

	const vencidos = vencidosList.length;

	/**
	 * Toggle the leftmenu when having mobile screen
	 */
	const handleLeftMenuCallBack = () => {
		if (width < 1140) {
			if (sideBarType === 'full') {
				showLeftSideBarBackdrop();
				document.getElementsByTagName('html')[0].classList.add('sidebar-enable');
			} else if (sideBarType === 'condensed' || sideBarType === 'fullscreen') {
				updateSidebar({ size: ThemeSettings.sidebar.size.default });
			} else {
				updateSidebar({ size: ThemeSettings.sidebar.size.condensed });
			}
		} else if (sideBarType === 'condensed') {
			updateSidebar({ size: ThemeSettings.sidebar.size.default });
		} else if (sideBarType === 'full' || sideBarType === 'fullscreen') {
			showLeftSideBarBackdrop();
			document.getElementsByTagName('html')[0].classList.add('sidebar-enable');
		} else {
			updateSidebar({ size: ThemeSettings.sidebar.size.condensed });
		}
	};

	function showLeftSideBarBackdrop() {
		const backdrop = document.createElement('div');
		backdrop.id = 'custom-backdrop';
		backdrop.className = 'offcanvas-backdrop fade show';
		document.body.appendChild(backdrop);
		backdrop.addEventListener('click', function () {
			document.getElementsByTagName('html')[0].classList.remove('sidebar-enable');
			hideLeftSideBarBackdrop();
		});
	}

	function hideLeftSideBarBackdrop() {
		const backdrop = document.getElementById('custom-backdrop');
		if (backdrop) {
			document.body.removeChild(backdrop);
			document.body.style.removeProperty('overflow');
		}
	}

	const toggleDarkMode = () => {
		if (settings.theme === 'dark') {
			updateSettings({ theme: ThemeSettings.theme.light });
		} else {
			updateSettings({ theme: ThemeSettings.theme.dark });
		}
	};

	const handleRightSideBar = () => {
		updateSettings({ rightSidebar: ThemeSettings.rightSidebar.show });
	};

	return (
		<div className={'navbar-custom'}>
			<div className="topbar container-fluid">
				<div className="d-flex align-items-center gap-lg-2 gap-1" style={{ marginTop: '-1rem', marginBottom: '-1.2rem' }}>
					<div className="logo-topbar mt-3">
						<div className="auth-brand text-center text-lg-start">
							<Link to="/" className="logo-dark">
								<span><img src={LogoDark} alt="" height={74} /></span>
							</Link>
						</div>
					</div>

					<button className="button-toggle-menu" onClick={handleLeftMenuCallBack}>
						<i className="mdi mdi-menu" />
					</button>

					<button className={`navbar-toggle ${navOpen? 'open' : ''}`} onClick={toggleMenu}>
						<div className="lines">
							<span />
						</div>
					</button>
				</div>

				<ul className="topbar-menu d-flex align-items-center gap-3">
					{/* ACTIVOS HOY */}
					<li className="d-none d-sm-inline-block">
						<OverlayTrigger placement="bottom" overlay={<Tooltip id="activos-tooltip">Activos ahora</Tooltip>}>
							<Link to="/dashboard/reportes"   className="nav-link position-relative">
								<i className="ri-time-line font-22 text-success"></i>
								{activosHoy > 0 && (
									<Badge bg="success" pill className="position-absolute top-1 start-100 translate-middle" style={{ fontSize: '0.65rem', minWidth: '18px', height: '18px', lineHeight: '14px' }}>
										{activosHoy}
									</Badge>
								)}
							</Link>
						</OverlayTrigger>
					</li>

					{/* VENCIDOS CON DROPDOWN */}
					<li className="d-none d-sm-inline-block">
						<Dropdown align="end">
							<Dropdown.Toggle as="div" className="nav-link position-relative p-0" style={{ cursor: 'pointer' }} id="vencidos-dropdown">
								<OverlayTrigger placement="bottom" overlay={<Tooltip id="vencidos-tooltip">Mis vencidos</Tooltip>}>
									<span>
										<i className="ri-alarm-warning-line font-22 text-danger"></i>
										{vencidos > 0 && (
											<Badge bg="danger" pill className="position-absolute top-1 start-100 translate-middle" style={{ fontSize: '0.65rem', minWidth: '18px', height: '18px', lineHeight: '14px' }}>
												{vencidos > 99? '99+' : vencidos}
											</Badge>
										)}
									</span>
								</OverlayTrigger>
							</Dropdown.Toggle>

							<Dropdown.Menu style={{ minWidth: '320px', maxHeight: '350px', overflowY: 'auto' }}>
								<Dropdown.Header className="fw-bold">Préstamos vencidos</Dropdown.Header>
								{vencidosList.length === 0? (
									<Dropdown.ItemText className="text-muted small px-3 py-2">¡Estás al día!</Dropdown.ItemText>
								) : (
									vencidosList.map((p) => (
										<Dropdown.Item key={p.id} as={Link} to={`/prestamos/${p.id}`} className="py-2">
											<div className="d-flex justify-content-between align-items-start">
												<div className="me-2" style={{ maxWidth: '200px' }}>
													<div className="fw-semibold text-truncate">{p.title || 'Sin título'}</div>
													<small className="text-muted">{p.salle || p.aula}</small>
												</div>
												<small className="text-danger text-nowrap">
													{new Date(String(p.end).replace(' ', 'T')).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
												</small>
											</div>
										</Dropdown.Item>
									))
								)}
								<Dropdown.Divider />
								<Dropdown.Item as={Link} to="/dashboard/reportes" className="text-center small text-primary" >Ver reporte completo</Dropdown.Item>
							</Dropdown.Menu>
						</Dropdown>
					</li>

					<li className="d-none d-sm-inline-block">
						<button className="nav-link dropdown-toggle end-bar-toggle arrow-none btn btn-link shadow-none" onClick={handleRightSideBar} title="Open settings" aria-label="Open settings">
							<i className="ri-settings-3-line font-22"></i>
						</button>
					</li>

					<li className="d-none d-sm-inline-block">
						<OverlayTrigger placement="left" overlay={<Tooltip id="dark-mode-toggler">Theme Mode</Tooltip>}>
							<div className="nav-link" id="light-dark-mode" onClick={toggleDarkMode}>
								<i className="ri-moon-line font-22" />
							</div>
						</OverlayTrigger>
					</li>

					<li className="d-none d-md-inline-block">
						<MaximizeScreen />
					</li>

					<li className="d-none d-md-inline-block">
						<ProfileDropdown userImage={userImage} menuItems={profileMenus} username={userData?.Nom || 'Iniciar'} userTitle={userData?.Rol || 'Sesion'} />
					</li>
				</ul>
			</div>
		</div>
	);
};

export default Topbar;