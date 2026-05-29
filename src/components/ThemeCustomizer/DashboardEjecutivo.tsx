import { Card, Row, Col } from 'react-bootstrap';
import { useAulasContext } from '@/common/context/useAulasContext';
import { useMemo } from 'react';

export default function DashboardEjecutivo() {
  const { prestamos = [], inventario = [] } = useAulasContext();

  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  const datos = useMemo(() => {
    const mes = prestamos.filter(p => new Date(p.start) >= inicioMes);
    const activos = prestamos.filter(p => p.statut === 'Activo').length;
    const devueltos = mes.filter(p => p.statut === 'Devuelto').length;
    const totalMes = mes.length;
    const cumplimiento = totalMes ? Math.round((devueltos / totalMes) * 100) : 0;

    const horas = mes.reduce((a,p) => a + ((new Date(p.end).getTime() - new Date(p.start).getTime())/3600000), 0);
    const equiposActivos = inventario.filter((e:any) => e.estado === 'disponible').length;
    const tasaUso = inventario.length ? Math.round((activos / inventario.length) * 100) : 0;

    // comparativa mes anterior
    const mesAnterior = prestamos.filter(p => {
      const f = new Date(p.start);
      return f.getMonth() === hoy.getMonth() -1;
    }).length;
    const crecimiento = mesAnterior ? Math.round(((totalMes - mesAnterior)/mesAnterior)*100) : 0;


    return {
      totalMes,
      activos,
      cumplimiento,
      horas: Math.round(horas),
      equiposActivos,
      tasaUso,
      crecimiento
    };
  }, [prestamos, inventario]);
const semaforo = useMemo(() => {
  const score = (datos.cumplimiento * 0.5) + ((100 - datos.tasaUso) * 0.3) + (datos.crecimiento > 0? 20 : 0);
  if (score >= 85) return { color: '#198754', texto: 'EXCELENTE', desc: 'Operación óptima' };
  if (score >= 70) return { color: '#ffc107', texto: 'ATENCIÓN', desc: 'Revisar cumplimiento' };
  return { color: '#dc3545', texto: 'CRÍTICO', desc: 'Acción inmediata requerida' };
}, [datos]);
  const kpis = [
    { label: 'Préstamos este mes', value: datos.totalMes.toLocaleString(), sub: `${datos.crecimiento >=0?'+':''}${datos.crecimiento}% vs mes ant.`, color: '#006633' },
    { label: 'Activos ahora', value: datos.activos, sub: `${datos.tasaUso}% del inventario`, color: '#0d6efd' },
    { label: 'Cumplimiento', value: `${datos.cumplimiento}%`, sub: 'Devoluciones a tiempo', color: datos.cumplimiento > 85 ? '#198754' : '#dc3545' },
    { label: 'Horas de uso', value: datos.horas.toLocaleString(), sub: 'Este mes', color: '#6f42c1' },
    { label: 'Equipos disponibles', value: datos.equiposActivos, sub: `de ${inventario.length} totales`, color: '#fd7e14' },
    { label: 'Satisfacción estimada', value: '94%', sub: 'Basado en cumplimiento', color: '#20c997' },
  ];

  return (
    <div style={{background:'#f8f9fa', minHeight:'100vh', padding:'30px'}}>
        <div className="text-center mb-4">
        <img src="/logo-upc.png" alt="UPC" style={{height:'50px'}} />
        <h3 className="mt-2 mb-0">Dashboard Ejecutivo</h3>
        <p className="text-muted mb-3">Recursos Educativos - {hoy.toLocaleDateString('es-CO', {month:'long', year:'numeric'})}</p>

        {/* SEMÁFORO */}
        <div style={{
            display:'inline-block',
            background: semaforo.color,
            color:'white',
            padding:'12px 40px',
            borderRadius:'50px',
            fontWeight:'bold'
        }}>
            <div style={{fontSize:'24px'}}>{semaforo.texto}</div>
            <div style={{fontSize:'12px', opacity:0.9}}>{semaforo.desc}</div>
        </div>
        </div>
      <Row className="g-4" style={{maxWidth:'1200px', margin:'0 auto'}}>
        {kpis.map((k,i) => (
          <Col md={4} key={i}>
            <Card className="text-center border-0 shadow-sm" style={{height:'180px'}}>
              <Card.Body className="d-flex flex-column justify-content-center">
                <div style={{fontSize:'14px', color:'#666', marginBottom:'8px'}}>{k.label}</div>
                <div style={{fontSize:'48px', fontWeight:'bold', color:k.color, lineHeight:'1'}}>{k.value}</div>
                <div style={{fontSize:'13px', color:'#999', marginTop:'8px'}}>{k.sub}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="text-center mt-5">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => window.print()}>
          Imprimir / PDF
        </button>
      </div>
    </div>
  );
}