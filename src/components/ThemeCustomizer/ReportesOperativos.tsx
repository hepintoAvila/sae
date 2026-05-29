import { useState, useMemo } from 'react';
import { Card, Table, Badge, Form, Row, Col, Tabs, Tab, InputGroup } from 'react-bootstrap';
import { useAulasContext } from '@/common/context/useAulasContext';
import { extractAulasFromProp, extractOpcionesFromAulas } from '@/common/helpers';
import { Aula, Dependencia } from '@/types/aulas';

type Opcion = { id: number; idAula: number; dependencia_id: number; title: string; stock: number };
type Equipo = { id: number; dependencia_id: number; opcion_id: number; serial: string; estado: string };

export default function ReportesOperativos() {
  const { prestamos = [], aulas: aulasProp = [], inventario: inventarioProp = [], dependencias: dependenciasProp = [] } = useAulasContext();

  const [cedula, setCedula] = useState('');
  const [sedeFiltro, setSedeFiltro] = useState('Todas');
  const now = useMemo(() => new Date(), []);

  // Datos normalizados
  const dependencias = useMemo<Dependencia[]>(() =>
    (dependenciasProp || []).map((d:any) => ({...d, id: Number(d.id) })),
  [dependenciasProp]);

  const aulas = useMemo<Aula[]>(() => extractAulasFromProp(aulasProp as any), [aulasProp]);
  console.log('Aulas extraídas:', aulas); // Debug: Verifica que las aulas se extraen correctamente
  const opciones = useMemo<Opcion[]>(() => extractOpcionesFromAulas(aulasProp as any), [aulasProp]);

  const equipos = useMemo<Equipo[]>(() =>
    (inventarioProp || []).map((e:any) => ({
      id: Number(e.id),
      dependencia_id: Number(e.dependencia_id),
      opcion_id: Number(e.opcion_id),
      serial: e.serial,
      estado: e.estado || 'Disponible'
    })),
  [inventarioProp]);

  const mapOpcion = useMemo(() => new Map(opciones.map(o => [String(o.id), o])), [opciones]);
  const mapEquipo = useMemo(() => new Map(equipos.map(e => [String(e.id), e])), [equipos]);
  const mapDep = useMemo(() => new Map(dependencias.map(d => [String(d.id), d.nombre])), [dependencias]);

  const nombreSede = (id: any) => mapDep.get(String(id)) || `Sede ${id}`;

  // Helper: obtiene el nombre del equipo/sala desde el préstamo
  const tipoFromPrestamo = (p: any) => {
    const equipoId = p.equipo_id;
    if (equipoId && Number(equipoId) > 0) {
      const eq = mapEquipo.get(String(equipoId));
      if (eq) return mapOpcion.get(String(eq.opcion_id))?.title || 'Equipo';
    }
    // fallback para salas (usa childId)
    if (p.childId) {
      return mapOpcion.get(String(p.childId))?.title || p.title || 'Sala';
    }
    return p.title || 'Préstamo';
  };

  const opcionIdFromPrestamo = (p: any): string | null => {
    const equipoId = p.equipo_id;
    if (equipoId && Number(equipoId) > 0) {
      const eq = mapEquipo.get(String(equipoId));
      return eq? String(eq.opcion_id) : null;
    }
    return p.childId? String(p.childId) : null;
  };

  // 1. ACTIVOS AHORA
  const activosAhora = useMemo(() =>
    prestamos.filter(p => {
      if (p.statut!== 'Activo' ||!p.start ||!p.end) return false;
      const s = new Date(String(p.start).replace(' ', 'T'));
      const e = new Date(String(p.end).replace(' ', 'T'));
      const sedeOk = sedeFiltro === 'Todas' || String(p.dependencia_id) === sedeFiltro;
      return s <= now && e >= now && sedeOk;
    }).sort((a,b) => new Date(a.end).getTime() - new Date(b.end).getTime()),
  [prestamos, sedeFiltro, now]);

  // 2. DISPONIBILIDAD REAL
  const disponibilidad = useMemo(() => {
    return dependencias.map(dep => {
      const equiposSede = equipos.filter(e => e.dependencia_id === dep.id && e.estado!== 'Baja');
      const prestados = prestamos.filter(p =>
        Number(p.dependencia_id) === dep.id &&
        p.statut === 'Activo' &&
        new Date(String(p.end).replace(' ', 'T')) > now
      );

      const prestadosPorOpcion = new Map<string, number>();
      prestados.forEach(p => {
        const opcionId = opcionIdFromPrestamo(p);
        if (opcionId) {
          prestadosPorOpcion.set(opcionId, (prestadosPorOpcion.get(opcionId) || 0) + 1);
        }
      });

      const detalle = opciones
      .filter(o => o.dependencia_id === dep.id)
      .map(op => {
          const totalEq = equiposSede.filter(e => e.opcion_id === op.id).length || op.stock;
          const prestado = prestadosPorOpcion.get(String(op.id)) || 0;
          return {
            nombre: op.title,
            stock: totalEq,
            prestado,
            disponible: totalEq - prestado
          };
        });

      const totalStock = detalle.reduce((s, d) => s + d.stock, 0);
      const totalPrestado = detalle.reduce((s, d) => s + d.prestado, 0);

      return {
        id: dep.id,
        nombre: nombreSede(dep.id),
        totalStock,
        disponible: totalStock - totalPrestado,
        prestados: totalPrestado,
        detalle
      };
    });
  }, [dependencias, equipos, opciones, prestamos, now]);

  // 3. HISTORIAL
  const historial = useMemo(() => {
    if (!cedula) return [];
    return prestamos
    .filter(p => String((p as any).cedula || p.email || '').includes(cedula))
    .sort((a,b) => new Date(b.start).getTime() - new Date(a.start).getTime());
  }, [cedula, prestamos]);

  return (
    <div className="container-fluid py-3">
      <h4 className="mb-3">Reportes Operativos</h4>

      <Tabs defaultActiveKey="activos">
        <Tab eventKey="activos" title={`Activos (${activosAhora.length})`}>
          <Card><Card.Body>
            <Row className="mb-2">
              <Col md={3}>
                <Form.Select value={sedeFiltro} onChange={e => setSedeFiltro(e.target.value)}>
                  <option value="Todas">Todas las sedes</option>
                  {dependencias.map(d => <option key={d.id} value={String(d.id)}>{nombreSede(d.id)}</option>)}
                </Form.Select>
              </Col>
            </Row>
            <Table hover responsive size="sm">
              <thead><tr><th>Quién</th><th>Equipo</th><th>Desde</th><th>Vence</th><th>Sede</th><th>Estado</th></tr></thead>
              <tbody>
                {activosAhora.map(p => {
                  const vence = new Date(String(p.end).replace(' ', 'T'));
                  const vencido = vence < now;
                  const minutos = Math.round((vence.getTime() - now.getTime())/60000);
                  return (
                    <tr key={p.id} className={vencido? 'table-danger' : minutos < 30? 'table-warning' : ''}>
                      <td>{(p as any).nombre || p.email}</td>
                      <td>{tipoFromPrestamo(p)}</td>
                      <td>{new Date(String(p.start).replace(' ', 'T')).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}</td>
                      <td>{vence.toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}</td>
                      <td>{nombreSede(p.dependencia_id)}</td>
                      <td>{vencido? <Badge bg="danger">VENCIDO</Badge> : minutos < 30? <Badge bg="warning">Por vencer</Badge> : <Badge bg="success">OK</Badge>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body></Card>
        </Tab>

        <Tab eventKey="stock" title="Disponibilidad">
          <Row>
            {disponibilidad.map(d => (
              <Col md={4} key={d.id} className="mb-3">
                <Card>
                  <Card.Header className="fw-bold">{d.nombre}</Card.Header>
                  <Card.Body>
                    <h3 className={d.disponible < 5? 'text-danger' : 'text-success'}>
                      {d.disponible} <small className="fs-6 text-muted">/ {d.totalStock}</small>
                    </h3>
                    <small>Prestados: {d.prestados}</small>
                    <hr/>
                    {d.detalle.map(item => (
                      <div key={item.nombre} className="d-flex justify-content-between small mb-1">
                        <span>{item.nombre}</span>
                        <span className={item.disponible===0? 'text-danger fw-bold' : ''}>
                          {item.disponible}/{item.stock}
                        </span>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Tab>

        <Tab eventKey="historial" title="Historial">
          <Card><Card.Body>
            <InputGroup style={{maxWidth:'400px'}} className="mb-3">
              <Form.Control placeholder="Buscar por cédula o email" value={cedula} onChange={e=>setCedula(e.target.value)} />
            </InputGroup>
            <Table size="sm" hover>
              <thead><tr><th>Fecha</th><th>Equipo</th><th>Sede</th><th>Estado</th></tr></thead>
              <tbody>
                {historial.map(h => (
                  <tr key={h.id}>
                    <td>{new Date(h.start).toLocaleDateString('es-CO')}</td>
                    <td>{tipoFromPrestamo(h)}</td>
                    <td>{nombreSede(h.dependencia_id)}</td>
                    <td>{h.statut === 'Devuelto'? <Badge bg="secondary">OK</Badge> : <Badge bg="primary">{h.statut}</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body></Card>
        </Tab>
      </Tabs>
    </div>
  );
}