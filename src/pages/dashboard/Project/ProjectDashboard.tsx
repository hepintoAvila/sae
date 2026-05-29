import { Row, Col } from 'react-bootstrap';
import { PageBreadcrumb } from '@/components';
import Calendar from '@/components/Calendar';
import { useAulasContext } from '@/common/context/useAulasContext'; // Asegúrate de la ruta correcta a tu hook de contexto
const ProjectDashboard = () => {
    // 1. Obtener los datos del contexto
    const { loadingInitialData, errorInitialData } = useAulasContext();
    //console.log('ProjectDashboard - aulas:', aulas);
    //console.log('ProjectDashboard - prestamos:', prestamos);
    // 2. Opcional: Mostrar un estado de carga o error mientras los datos se están obteniendo
    if (loadingInitialData) {
        return (
            <>
                <PageBreadcrumb title="Préstamos" subName="Dashboard" />
                <Row>
                    <Col xl={12}>
                        <p>Cargando datos de aulas y préstamos...</p>
                    </Col>
                </Row>
            </>
        );
    }
    if (errorInitialData) {
        return (
            <>
                <PageBreadcrumb title="Préstamos" subName="Dashboard" />
                <Row>
                    <Col xl={12}>
                        <p className="text-danger">Error al cargar datos: {errorInitialData}</p>
                    </Col>
                </Row>
            </>
        );
    }
    // 3. Renderizar el componente Calendar pasando los datos obtenidos
	return (
		<>
			<PageBreadcrumb title="Solicitudes" subName="Dashboard" />
			<Row>
				<Col xl={12}>
					<Calendar/> {/* <-- ¡Aquí pasamos los datos! */}
				</Col>
			</Row>
		</>
	);
};
export { ProjectDashboard };