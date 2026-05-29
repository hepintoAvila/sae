import SimpleBar from 'simplebar-react';
import { Offcanvas} from 'react-bootstrap';
import useThemeCustomizer from '@/components/ThemeCustomizer/useThemeCustomizer';
import { ThemeSettings, useThemeContext } from '@/common';
import { ThemeCustomizer } from '@/components';

const RightSideBar = () => {
	const { updateSettings, settings } = useThemeContext();

	const { reset } = useThemeCustomizer();

	const isOpenRightSideBar = settings.rightSidebar;

	/**
	 * Toggles the right sidebar
	 */
	const handleRightSideBar = () => {
		updateSettings({ rightSidebar: ThemeSettings.rightSidebar.hidden });
	};

	return (
		<>
			<Offcanvas
				show={isOpenRightSideBar}
				onHide={handleRightSideBar}
				placement="end"
				id="theme-settings-offcanvas"
				className="sidebar-size-cardradio"
			>
				<Offcanvas.Header
					className="d-flex align-items-center bg-primary p-3"
					closeVariant="white"
					closeButton
				>
					<h5 className="text-white m-0">Configuración y Reportes</h5>
				</Offcanvas.Header>

				<Offcanvas.Body className="p-0">
					<SimpleBar scrollbarMaxSize={320} className="h-100">
						<ThemeCustomizer reset={reset}/> 
					</SimpleBar> 
				</Offcanvas.Body>

				
			</Offcanvas>
		</>
	);
};

export default RightSideBar;
