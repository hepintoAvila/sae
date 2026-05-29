import { useMemo } from 'react';
import { Card, Row, Col, Table } from 'react-bootstrap';
import { useAulasContext } from '@/common/context/useAulasContext';

export default function ReporteMensual() {
  const { prestamos = [],  dependencias: deps = [] } = useAulasContext();

  const mesActual = new Date();
  mesActual.setDate(1);
  const inicioMes = new Date(mesActual);
  const finMes = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);

  const delMes = useMemo(() =>
    prestamos.filter(p => {
      const f = new Date(p.start);
      return f >= inicioMes && f <= finMes;
    }), [prestamos]);

  const kpis = useMemo(() => {
    const total = delMes.length;
    const activos = delMes.filter(p => p.statut === 'Activo').length;
    const devueltos = delMes.filter(p => p.statut === 'Devuelto').length;
    const vencidos = delMes.filter(p => p.statut === 'Activo' && new Date(p.end) < new Date()).length;
    const cumplimiento = devueltos > 0? Math.round((devueltos / (devueltos + vencidos)) * 100) : 100;

    const horasUso = delMes.reduce((acc, p) => {
      const h = (new Date(p.end).getTime() - new Date(p.start).getTime()) / 3600000;
      return acc + Math.max(0, h);
    }, 0);

    return { total, activos, devueltos, vencidos, cumplimiento, horasUso: Math.round(horasUso) };
  }, [delMes]);

  const porSede = useMemo(() => {
    return deps.map(d => {
      const ps = delMes.filter(p => Number(p.dependencia_id) === d.id);
      return { nombre: d.nombre, total: ps.length, porcentaje: delMes.length? Math.round((ps.length / delMes.length) * 100) : 0 };
    });
  }, [deps, delMes]);

  return (
    <div id="reporte-mensual" style={{background:'white', padding:'20px', maxWidth:'800px'}}>
      <div className="text-center mb-4">
        <h4>UNIVERSIDAD POPULAR DEL CESAR</h4>
        <h5>Informe Mensual de Préstamos</h5>
        <p className="text-muted">{inicioMes.toLocaleDateString('es-CO', {month:'long', year:'numeric'}).toUpperCase()}</p>
      </div>

      <Row className="mb-4 text-center">
        <Col><h2 className="text-primary">{kpis.total}</h2><small>Préstamos totales</small></Col>
        <Col><h2 className="text-success">{kpis.cumplimiento}%</h2><small>Cumplimiento</small></Col>
        <Col><h2 className="text-info">{kpis.horasUso}</h2><small>Horas de uso</small></Col>
        <Col><h2 className="text-danger">{kpis.vencidos}</h2><small>Vencidos</small></Col>
      </Row>

      <Card className="mb-3">
        <Card.Header>Distribución por Sede</Card.Header>
        <Card.Body className="p-0">
          <Table size="sm" className="mb-0">
            <tbody>
              {porSede.map(s => (
                <tr key={s.nombre}>
                  <td>{s.nombre}</td>
                  <td width="100">{s.total}</td>
                  <td width="60">{s.porcentaje}%</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>Top 5 Servicios del Mes</Card.Header>
        <Card.Body>
          <ol className="mb-0">
            {[...new Map(delMes.map(p => [p.childId, p])).values()].slice(0,5).map((p:any) => (
              <li key={p.id}>{p.title || 'Servicio'} - {delMes.filter(x => x.childId === p.childId).length} préstamos</li>
            ))}
          </ol>
        </Card.Body>
      </Card>

      <div className="mt-4 text-end" style={{fontSize:'11px', color:'#666'}}>
        Generado automáticamente el {new Date().toLocaleString('es-CO')}
      </div>
    </div>
  );
}