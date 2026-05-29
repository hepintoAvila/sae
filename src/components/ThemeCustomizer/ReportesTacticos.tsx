import { useMemo } from 'react';
import { Card, Table, Row, Col, ProgressBar, Badge } from 'react-bootstrap';
import { useAulasContext } from '@/common/context/useAulasContext';
import { extractOpcionesFromAulas } from '@/common/helpers';

export default function ReportesTacticos() {
  const { prestamos = [], aulas: aulasProp = [], inventario: inventarioProp = [], dependencias: dependenciasProp = [] } = useAulasContext();

  const opciones = useMemo(() => extractOpcionesFromAulas(aulasProp as any), [aulasProp]);
  const equipos = useMemo(() => (inventarioProp || []).map((e:any) => ({ id: Number(e.id), opcion_id: Number(e.opcion_id), estado: e.estado })), [inventarioProp]);
  const deps = useMemo(() => (dependenciasProp || []).map((d:any) => ({ id: Number(d.id), nombre: d.nombre || d.title })), [dependenciasProp]);

  const mapOpcion = useMemo(() => new Map(opciones.map(o => [String(o.id), o.title])), [opciones]);
  const mapEquipo = useMemo(() => new Map(equipos.map(e => [String(e.id), e.opcion_id])), [equipos]);

  // Helper para obtener opcion_id desde préstamo
  const getOpcionId = (p:any) => {
    if (p.equipo_id && Number(p.equipo_id) > 0) {
      return mapEquipo.get(String(p.equipo_id));
    }
    return p.childId? Number(p.childId) : null;
  };

  // 1. TOP 10 SERVICIOS MÁS PRESTADOS (últimos 30 días)
  const top10 = useMemo(() => {
    const hace30dias = new Date();
    hace30dias.setDate(hace30dias.getDate() - 30);

    const conteo = new Map<string, number>();
    prestamos
    .filter(p => new Date(p.start) >= hace30dias)
    .forEach(p => {
        const opId = getOpcionId(p);
        if (opId) {
          const key = String(opId);
          conteo.set(key, (conteo.get(key) || 0) + 1);
        }
      });

    return Array.from(conteo.entries())
    .map(([id, count]) => ({
        nombre: mapOpcion.get(id) || 'Desconocido',
        count,
        id
      }))
    .sort((a,b) => b.count - a.count)
    .slice(0, 10);
  }, [prestamos, mapOpcion, mapEquipo]);

  // 2. TASA DE OCUPACIÓN POR AULA
  const ocupacion = useMemo(() => {
    const horasDisponiblesDia = 14; // 7am-9pm
    const diasMes = 22; // laborables aprox

    return opciones.map(op => {
      const prestamosOp = prestamos.filter(p => String(getOpcionId(p)) === String(op.id));

      const horasPrestadas = prestamosOp.reduce((total, p) => {
        const inicio = new Date(p.start);
        const fin = new Date(p.end);
        const horas = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
        return total + Math.max(0, horas);
      }, 0);

      const horasDisponibles = horasDisponiblesDia * diasMes;
      const tasa = horasDisponibles > 0? (horasPrestadas / horasDisponibles) * 100 : 0;

      return {
        nombre: op.title,
        sede: deps.find(d => d.id === op.dependencia_id)?.nombre || '',
        horasPrestadas: Math.round(horasPrestadas),
        tasa: Math.min(100, Math.round(tasa))
      };
    }).sort((a,b) => b.tasa - a.tasa);
  }, [opciones, prestamos, deps, mapEquipo]);

  // 3. PRÉSTAMOS POR SEDE
  const porSede = useMemo(() => {
    return deps.map(d => {
      const total = prestamos.filter(p => Number(p.dependencia_id) === d.id).length;
      const activos = prestamos.filter(p => Number(p.dependencia_id) === d.id && p.statut === 'Activo').length;
      return {...d, total, activos };
    });
  }, [deps, prestamos]);

  // 4. MOROSIDAD
// 4. MOROSIDAD
const morosos = useMemo(() => {
  const usuarios = new Map<string, { nombre: string; retrasos: number; total: number }>();

  prestamos.forEach(p => {
    const email = (p as any).email || (p as any).usuario || 'sin-email';
    const key = String(email).toLowerCase();

    if (!usuarios.has(key)) {
      usuarios.set(key, { nombre: email, retrasos: 0, total: 0 });
    }
    const u = usuarios.get(key)!;
    u.total++;

    // tu backend no trae end_real, usa 'final_real' o calcula con statut
    const endReal = (p as any).end_real || (p as any).final_real || (p as any).devuelto_el;
    const finPrevisto = new Date(p.end);

    if (endReal && new Date(endReal) > finPrevisto) {
      u.retrasos++;
    }
    // si no tienes end_real, marca como retraso si está vencido y sigue Activo
    else if (p.statut === 'Activo' && finPrevisto < new Date()) {
      u.retrasos++;
    }
  });

  return Array.from(usuarios.values())
 .filter(u => u.retrasos >= 3)
 .sort((a,b) => b.retrasos - a.retrasos)
 .slice(0, 10);
}, [prestamos]);

return (
    <div>
      <h5 className="mb-3">Reportes Tácticos - Coordinación</h5>

      <Row>
        <Col lg={6} className="mb-3">
          <Card>
            <Card.Header className="fw-bold">Top 10 Servicios (30 días)</Card.Header>
            <Card.Body className="p-0">
              <Table size="sm" className="mb-0">
                <thead><tr><th>#</th><th>Servicio</th><th>Préstamos</th></tr></thead>
                <tbody>
                  {top10.map((t, i) => (
                    <tr key={t.id}>
                      <td>{i+1}</td>
                      <td>{t.nombre}</td>
                      <td><Badge bg="primary">{t.count}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-3">
          <Card>
            <Card.Header className="fw-bold">Préstamos por Sede</Card.Header>
            <Card.Body>
              {porSede.map(s => (
                <div key={s.id} className="mb-2">
                  <div className="d-flex justify-content-between small">
                    <span>{s.nombre}</span>
                    <span>{s.activos} activos / {s.total} total</span>
                  </div>
                  <ProgressBar now={(s.activos / Math.max(1, s.total)) * 100} variant="info" style={{height:'6px'}} />
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-3">
        <Card.Header className="fw-bold">Tasa de Ocupación por Aula/Servicio</Card.Header>
        <Card.Body>
          <Row>
            {ocupacion.slice(0, 12).map(o => (
              <Col md={4} key={o.nombre} className="mb-3">
                <div className="small mb-1">{o.nombre} <span className="text-muted">({o.sede})</span></div>
                <ProgressBar
                  now={o.tasa}
                  label={`${o.tasa}%`}
                  variant={o.tasa > 80? 'danger' : o.tasa > 50? 'warning' : 'success'}
                  style={{height:'20px'}}
                />
                <small className="text-muted">{o.horasPrestadas}h este mes</small>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

      <Row>
        <Col lg={6}>
          <Card>
            <Card.Header className="fw-bold text-danger">Usuarios Morosos (+3 retrasos)</Card.Header>
            <Card.Body className="p-0">
              <Table size="sm" className="mb-0">
                <thead><tr><th>Usuario</th><th>Retrasos</th><th>Total</th></tr></thead>
                <tbody>
                  {morosos.map(m => (
                    <tr key={m.nombre}>
                      <td className="text-truncate" style={{maxWidth:'200px'}}>{m.nombre}</td>
                      <td><Badge bg="danger">{m.retrasos}</Badge></td>
                      <td>{m.total}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card>
            <Card.Header className="fw-bold">Equipos en Mantenimiento</Card.Header>
            <Card.Body>
              {equipos.filter(e => e.estado === 'Mantenimiento').length === 0? (
                <p className="text-muted text-center">No hay equipos en mantenimiento</p>
              ) : (
                equipos.filter(e => e.estado === 'Mantenimiento').map(e => (
                  <div key={e.id} className="d-flex justify-content-between">
                    <span>Equipo #{e.id}</span>
                    <Badge bg="warning">Mantenimiento</Badge>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}