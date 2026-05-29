import LayoutPosition from './LayoutPosition';
import LayoutTheme from './LayoutTheme';
import LayoutType from './LayoutType';
import LayoutWidth from './LayoutWidth';
import SideBarType from './SideBarType';
import SideBarTheme from './SideBarTheme';
import SideBarUserInfo from './SideBarUserInfo';
import TopBarTheme from './TopBarTheme';
import useThemeCustomizer from './useThemeCustomizer';
import { ThemeSettings } from '@/common/context';
import { Tabs, Tab, Row } from 'react-bootstrap';
import { useAulasContext } from '@/common/context/useAulasContext';
import AdminCrud from './AdminCrud';
import UserCrud from './UserCrud'; // ← nuevo
import ReportsDashboard from './ReportsDashboard';
import ReportesOperativos from './ReportesOperativos';
import ReportesTacticos from './ReportesTacticos';
import ReportesEstrategicos from './ReportesEstrategicos';
import ReportesEstrategicos2 from './ReportesEstrategicos2';
import ReporteMensual from './ReporteMensual';
import ConciliacionInventario from './ConciliacionInventario';
import DashboardEjecutivo from './DashboardEjecutivo';


const ThemeCustomizer = ({ reset }: { reset: () => void }) => {
  const { layoutType, layoutTheme, layoutWidth, topBarTheme, sideBarTheme, sideBarType, layoutPosition, showSideBarUserInfo, handleChangeLayoutType, handleChangeLayoutTheme, handleChangeLayoutWidth, handleChangeTopBarTheme, handleChangeSideBarTheme, handleChangeSideBarType, handleChangeLayoutPosition, handleToggleSideBarUserInfo } = useThemeCustomizer();
  const { aulas, prestamos, inventario, dependencias } = useAulasContext();
console.log( prestamos);
  return (
    <div className="card mb-0">
      <Tabs defaultActiveKey="avanzado" id="theme-customizer-tabs" className="nav-tabs nav-bordered px-3 pt-2">



        <Tab eventKey="avanzado" title={<><i className="mdi mdi-tune me-1"/>Avanzado</>}>
          <div className="p-3">
            <AdminCrud aulas={aulas as any} prestamos={prestamos} inventario={inventario as any} dependencias={dependencias as any} />
          </div>
        </Tab>

        <Tab eventKey="usuarios" title={<><i className="mdi mdi-account-multiple-plus me-1"/>Usuarios</>}>
          <div className="p-3">
            <UserCrud dependencias={dependencias as any} />
          </div>
        </Tab>
		<Tab eventKey="reportes" title={<><i className="mdi mdi-chart-bar me-1"/>Reportes</>}>
		<div className="p-3">
			<ReportsDashboard />
		</div>
		</Tab>
    <Tab eventKey="reportes-operativos" title={<><i className="mdi mdi-chart-bar me-1"/>Reportes Operativos</>}>
		<div className="p-3">
			<ReportesOperativos />
		</div>
		</Tab>
      <Tab eventKey="tacticos" title="Tácticos">
        <ReportesTacticos />
      </Tab>
      <Tab eventKey="estrategicos" title="Estratégicos">
        <ReportesEstrategicos />
      </Tab>
      <Tab eventKey="estrategicos2" title="Estratégicos Para Valledupar">
        <ReportesEstrategicos2 />
      </Tab>
      <Tab eventKey="estrategicos2" title="Estratégicos Para Valledupar">
        <ReportesEstrategicos2 />
      </Tab>
      <Tab eventKey="mensual" title="Mensual">
        <ReporteMensual />
      </Tab>
      <Tab eventKey="ConciliacionInventario" title="Inventario">
        <ConciliacionInventario />
      </Tab>
      <Tab eventKey="DashboardEjecutivo" title="Dashboard Ejecutivo">
        <DashboardEjecutivo />
      </Tab>
		<Tab eventKey="tema" title={<><i className="mdi mdi-palette-outline me-1"/>Tema</>}>
          <div className="p-3">
            <LayoutType handleChangeLayoutType={handleChangeLayoutType} layoutType={layoutType} layoutConstants={ThemeSettings.layout.type}/>
            <LayoutTheme handleChangeLayoutTheme={handleChangeLayoutTheme} layoutTheme={layoutTheme} layoutConstants={ThemeSettings.theme}/>
            <LayoutWidth handleChangeLayoutWidth={handleChangeLayoutWidth} layoutWidth={layoutWidth} layoutConstants={ThemeSettings.layout.mode}/>
            <TopBarTheme handleChangeTopBarTheme={handleChangeTopBarTheme} topBarTheme={topBarTheme} layoutConstants={ThemeSettings.topbar.theme}/>
            <SideBarTheme handleChangeSideBarTheme={handleChangeSideBarTheme} sideBarTheme={sideBarTheme} layoutConstants={ThemeSettings.sidebar.theme}/>
            <SideBarType handleChangeSideBarType={handleChangeSideBarType} sideBarType={sideBarType} layoutConstants={ThemeSettings.sidebar.size}/>
            <LayoutPosition handleChangeLayoutPosition={handleChangeLayoutPosition} layoutPosition={layoutPosition} layoutConstants={ThemeSettings.layout.menuPosition}/>
            <SideBarUserInfo handleToggleSideBarUserInfo={handleToggleSideBarUserInfo} showSideBarUserInfo={showSideBarUserInfo}/>
			<div className="offcanvas-footer border-top p-3 text-center">
					<Row>
						<div className="col-6">
							<button
								type="button"
								className="btn btn-light w-100"
								id="reset-layout"
								onClick={reset}
							>
								Reset
							</button>
						</div>
						<div className="col-6">
							 
						</div>
					</Row>
				</div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default ThemeCustomizer;