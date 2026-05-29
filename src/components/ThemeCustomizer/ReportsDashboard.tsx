import { useMemo, useState } from 'react';
import { Row, Col, Card, Badge, Table, Form, Button } from 'react-bootstrap';
import { useAulasContext } from '@/common/context/useAulasContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import OccupancyHeatmap from './OccupancyHeatmap';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function ReportsDashboard() {
  const { prestamos = [], inventario = [], dependencias = [], aulas = [] } = useAulasContext();
  console.log('Prestamos:', prestamos);
  console.log('Inventario:', inventario);
  console.log('Dependencias:', dependencias);
  console.log('Aulas:', aulas);
  const [filtroDep, setFiltroDep] = useState('all');
  const [desde, setDesde] = useState(''); // YYYY-MM-DD
  const [hasta, setHasta] = useState('');

  const now = new Date();
  const parseDate = (v:any) => { if(!v) return new Date(0); if(v instanceof Date) return v; const d=new Date(String(v).trim().replace(' ','T')); return isNaN(d.getTime())?new Date(0):d; };
  const formatKey = (v:any) => parseDate(v).toISOString().split('T')[0];

  // Filtro combinado
  const prestamosFiltrados = useMemo(() => {
    return prestamos.filter(p => {
      const okDep = filtroDep==='all' || String(p.dependencia_id)===filtroDep;
      const fecha = formatKey(p.start);
      const okDesde =!desde || fecha >= desde;
      const okHasta =!hasta || fecha <= hasta;
      return okDep && okDesde && okHasta;
    });
  }, [prestamos, filtroDep, desde, hasta]);

  const activos = useMemo(() => prestamosFiltrados.filter(p=>{const s=parseDate(p.start),e=parseDate(p.end); return p.statut==='Activo' && s<=now && now<=e;}).length, [prestamosFiltrados, now]);
  const vencidos = useMemo(() => prestamosFiltrados.filter(p=>parseDate(p.end)<now && p.statut==='Activo').length, [prestamosFiltrados, now]);
  const disponibles = useMemo(() => inventario.filter(e=>e.estado==='Disponible' && (filtroDep==='all'||String(e.dependencia_id)===filtroDep)).length, [inventario,filtroDep]);

  const ultimos7 = useMemo(() => {
    const dias=[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return d.toISOString().split('T')[0];});
    return { labels:dias.map(d=>new Date(d+'T12:00').toLocaleDateString('es-CO',{weekday:'short',day:'2-digit'})), data:dias.map(d=>prestamosFiltrados.filter(p=>formatKey(p.start)===d).length) };
  },[prestamosFiltrados]);

  const top = useMemo(()=>{const m=new Map();prestamosFiltrados.forEach(p=>m.set(p.title||'Sin título',(m.get(p.title)||0)+1));return [...m.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5);},[prestamosFiltrados]);

  const exportCSV = () => {
    const rows=[['ID','Servicio','Email','Inicio','Fin','Estado','Sede'],...prestamosFiltrados.map(p=>[p.id,p.title,p.email,p.start,p.end,p.statut,dependencias.find(d=>String(d.id)===String(p.dependencia_id))?.sede])];
    const csv=rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob=new Blob([csv],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`prestamos_${desde||'inicio'}_${hasta||'fin'}.csv`; a.click();
  };

  const limpiarFiltros = ()=>{ setFiltroDep('all'); setDesde(''); setHasta(''); };

  return (
    <><div>
          {/* Filtros */}
          <Card className="shadow-sm mb-3 bg-light"><Card.Body className="py-2">
              <Row className="g-2 align-items-end">
                  <Col md={3}><Form.Label className="small mb-1">Sede</Form.Label><Form.Select size="sm" value={filtroDep} onChange={e => setFiltroDep(e.target.value)}><option value="all">Todas</option>{dependencias.map((d: any) => <option key={d.id} value={String(d.id)}>{d.codigo} - {d.sede}</option>)}</Form.Select></Col>
                  <Col md={3}><Form.Label className="small mb-1">Desde</Form.Label><Form.Control type="date" size="sm" value={desde} onChange={e => setDesde(e.target.value)} /></Col>
                  <Col md={3}><Form.Label className="small mb-1">Hasta</Form.Label><Form.Control type="date" size="sm" value={hasta} onChange={e => setHasta(e.target.value)} /></Col>
                  <Col md={3} className="text-end"><Button size="sm" variant="light" className="me-2" onClick={limpiarFiltros}>Limpiar</Button><Button size="sm" variant="primary" onClick={exportCSV}><i className="mdi mdi-download" /> CSV</Button></Col>
              </Row>
          </Card.Body></Card>

          {/* KPIs */}
          <Row className="g-3 mb-3">
              {[{ t: 'En curso', v: activos, c: 'primary' }, { t: 'Vencidos', v: vencidos, c: 'danger' }, { t: 'Total filtrado', v: prestamosFiltrados.length, c: 'info' }, { t: 'Disponibles', v: disponibles, c: 'success' }].map(k => (
                  <Col md={3} key={k.t}><Card className="border-0 shadow-sm"><Card.Body className="py-3"><small className="text-muted">{k.t}</small><h3 className={`mb-0 text-${k.c}`}>{k.v}</h3></Card.Body></Card></Col>
              ))}
          </Row>

          <Row className="g-3">
              <Col lg={8}><Card className="shadow-sm"><Card.Header className="bg-white py-2"><h6 className="mb-0">Últimos 7 días (filtrado)</h6></Card.Header><Card.Body><Bar data={{ labels: ultimos7.labels, datasets: [{ data: ultimos7.data, backgroundColor: '#0d6efd' }] }} options={{ plugins: { legend: { display: false } } }} height={100} /></Card.Body></Card></Col>
              <Col lg={4}><Card className="shadow-sm h-100"><Card.Header className="bg-white py-2"><h6 className="mb-0">Top 5</h6></Card.Header><Card.Body className="p-0"><Table size="sm" className="mb-0"><tbody>{top.map(([n, c], i) => <tr key={n}><td><Badge bg="light" text="dark">{i + 1}</Badge></td><td>{n}</td><td className="text-end">{c}</td></tr>)}</tbody></Table></Card.Body></Card></Col>
          </Row>

          {/* Tabla */}
          <Card className="shadow-sm mt-3"><Card.Header className="bg-white py-2"><small>Mostrando {prestamosFiltrados.length} registros {desde && `desde ${desde}`} {hasta && `hasta ${hasta}`}</small></Card.Header>
              <Card.Body className="p-0" style={{ maxHeight: 320, overflow: 'auto' }}>
                  <Table hover size="sm" className="mb-0 align-middle">
                      <thead className="table-light sticky-top"><tr><th>Servicio</th><th>Usuario</th><th>Inicio</th><th>Fin</th><th>Estado</th></tr></thead>
                      <tbody>{prestamosFiltrados.map(p => { const venc = parseDate(p.end) < now; return <tr key={p.id}><td>{p.title}</td><td><small>{p.email}</small></td><td>{parseDate(p.start).toLocaleString('es-CO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td><td>{parseDate(p.end).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</td><td><Badge bg={venc ? 'danger' : 'success'}>{venc ? 'Vencido' : p.statut}</Badge></td></tr>; })}</tbody>
                  </Table>
              </Card.Body>
          </Card>
      </div>
      
      <OccupancyHeatmap filtroDep={filtroDep} desde={desde} hasta={hasta} /></>
  );
}