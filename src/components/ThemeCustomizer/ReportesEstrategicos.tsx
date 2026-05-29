import { useMemo } from 'react';
import { Card, Row, Col, Table, Badge, ProgressBar } from 'react-bootstrap';
import { useAulasContext } from '@/common/context/useAulasContext';
import { extractOpcionesFromAulas } from '@/common/helpers';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ReportesEstrategicos() {
  const { prestamos = [], aulas: aulasProp = [], inventario: inventarioProp = [], dependencias: dependenciasProp = [] } = useAulasContext();

  const opciones = useMemo(() => extractOpcionesFromAulas(aulasProp as any), [aulasProp]);
  const equipos = useMemo(() => (inventarioProp || []).map((e:any) => ({ id: Number(e.id), opcion_id: Number(e.opcion_id) })), [inventarioProp]);
  const deps = useMemo(() => (dependenciasProp || []).map((d:any) => ({ id: Number(d.id), nombre: d.nombre || d.title })), [dependenciasProp]);

  const mapEquipo = useMemo(() => new Map(equipos.map(e => [String(e.id), e.opcion_id])), [equipos]);
  const getOpcionId = (p:any) => p.equipo_id? mapEquipo.get(String(p.equipo_id)) : p.childId;

  // 1. DEMANDA POR FRANJA HORARIA (heatmap)
  const heatmap = useMemo(() => {
    const horas = Array.from({length: 15}, (_,i) => i + 7); // 7-21
    const dias = ['Lun','Mar','Mié','Jue','Vie'];
    const matriz: Record<string, number[]> = {};

    dias.forEach(d => matriz[d] = Array(15).fill(0));

    prestamos.forEach(p => {
      const inicio = new Date(p.start);
      const dia = inicio.getDay(); // 1-5
      if (dia >= 1 && dia <= 5) {
        const hora = inicio.getHours();
        if (hora >= 7 && hora <= 21) {
          const idx = hora - 7;
          matriz[dias[dia-1]][idx]++;
        }
      }
    });
    return { horas, dias, matriz };
  }, [prestamos]);

  // 2. ROTACIÓN DE INVENTARIO
  const rotacion = useMemo(() => {
    const conteo = new Map<number, number>();
    prestamos.forEach(p => {
      const opId = getOpcionId(p);
      if (opId) conteo.set(opId, (conteo.get(opId) || 0) + 1);
    });

    return opciones.map(op => {
      const veces = conteo.get(op.id) || 0;
      const stock = equipos.filter(e => e.opcion_id === op.id).length || 1;
      const rotacionMes = Math.round((veces / stock));
      return {
        nombre: op.title,
        veces,
        stock,
        rotacion: rotacionMes,
        alerta: rotacionMes > 40
      };
    }).sort((a,b) => b.rotacion - a.rotacion).slice(0, 10);
  }, [opciones, prestamos, equipos]);

  // 3. CUMPLIMIENTO DE DEVOLUCIONES POR SEDE
  const cumplimiento = useMemo(() => {
    return deps.map(d => {
      const prestDep = prestamos.filter(p => Number(p.dependencia_id) === d.id);
      const devueltos = prestDep.filter(p => p.statut === 'Devuelto').length;
      const aTiempo = prestDep.filter(p => {
        const endReal = (p as any).end_real;
        return p.statut === 'Devuelto' && (!endReal || new Date(endReal) <= new Date(p.end));
      }).length;
      const pct = devueltos > 0? Math.round((aTiempo / devueltos) * 100) : 0;
      return {...d, total: devueltos, aTiempo, pct };
    });
  }, [deps, prestamos]);

  // 4. INCIDENCIAS (usa observaciones)
  const incidencias = useMemo(() => {
    const conObs = prestamos.filter(p => p.observaciones && p.observaciones.trim().length > 5);
    const porEquipo = new Map<string, number>();

    conObs.forEach(p => {
      const opId = getOpcionId(p);
      const nombre = opciones.find(o => o.id === opId)?.title || 'Otro';
      porEquipo.set(nombre, (porEquipo.get(nombre) || 0) + 1);
    });

    return Array.from(porEquipo.entries())
    .map(([nombre, count]) => ({ nombre, count }))
    .sort((a,b) => b.count - a.count)
    .slice(0, 5);
  }, [prestamos, opciones]);

  // 5. PROYECCIÓN ANUAL
  const proyeccion = useMemo(() => {
    const porMes = new Map<string, number>();
    prestamos.forEach(p => {
      const mes = new Date(p.start).toISOString().slice(0,7); // 2025-05
      porMes.set(mes, (porMes.get(mes) || 0) + 1);
    });

    const meses = Array.from(porMes.entries()).sort();
    const ultimos6 = meses.slice(-6).map(m => m[1]);
    const promedio = ultimos6.reduce((a,b) => a+b, 0) / Math.max(1, ultimos6.length);
    const crecimiento = 1.15; // 15% estimado
    const proy2027 = Math.round(promedio * 12 * crecimiento);

    return { promedio: Math.round(promedio), proy2027, meses: meses.slice(-12) };
  }, [prestamos]);

  const getColor = (val: number) => {
    const max = Math.max(...Object.values(heatmap.matriz).flat());
    const pct = max > 0? val / max : 0;
    if (pct > 0.7) return '#dc3545';
    if (pct > 0.4) return '#fd7e14';
    if (pct > 0.2) return '#ffc107';
    return '#e9ecef';
  };

const exportPDF = async () => {
  const element = document.getElementById('reportes-estrategicos');
  if (!element) return;

  const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
  const imgData = canvas.toDataURL('image/png');
  
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // ENCABEZADO INSTITUCIONAL
  try {
    const logoImg = await fetch('/logo-upc.png').then(r => r.blob()).then(blob => 
      new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      })
    );
    pdf.addImage(logoImg, 'PNG', 14, 8, 20, 20);
  } catch {}

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('UNIVERSIDAD POPULAR DEL CESAR', 38, 15);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Sistema de Préstamos - Reportes Estratégicos', 38, 21);
  
  pdf.setFontSize(9);
  pdf.setTextColor(100);
  pdf.text(`Sede: Valledupar | Generado: ${new Date().toLocaleString('es-CO')}`, 14, 32);
  
  pdf.setDrawColor(220);
  pdf.line(14, 35, 196, 35);

  // CONTENIDO
  const imgWidth = 182;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  pdf.addImage(imgData, 'PNG', 14, 40, imgWidth, imgHeight);

  // PIE
  const pageHeight = pdf.internal.pageSize.height;
  pdf.setFontSize(8);
  pdf.setTextColor(150);
  pdf.text('Coordinación de Recursos Educativos - UPC', 14, pageHeight - 10);
  pdf.text('Página 1/1', 180, pageHeight - 10);

  pdf.save(`UPC-Reportes-Estrategicos-${new Date().toISOString().slice(0,10)}.pdf`);
};
  return (
  <div id="reportes-estrategicos">
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h5 className="mb-3">Reportes Estratégicos - Dirección</h5>
      <button className="btn btn-danger btn-sm" onClick={exportPDF}>
        📄 Exportar PDF
      </button>
    </div>
      

      <Row>
        <Col lg={8}>
          <Card className="mb-3">
            <Card.Header className="fw-bold">1. Demanda por Franja Horaria (Heatmap)</Card.Header>
            <Card.Body>
              <div style={{overflowX:'auto'}}>
                <table className="table table-bordered table-sm text-center">
                  <thead>
                    <tr><th></th>{heatmap.horas.map(h => <th key={h} style={{width:'40px',fontSize:'11px'}}>{h}h</th>)}</tr>
                  </thead>
                  <tbody>
                    {heatmap.dias.map(dia => (
                      <tr key={dia}>
                        <td className="fw-bold">{dia}</td>
                        {heatmap.matriz[dia].map((val, i) => (
                          <td key={i} style={{backgroundColor: getColor(val), fontSize:'11px'}} title={`${val} préstamos`}>
                            {val > 0? val : ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <small className="text-muted">Picos: 10-12h y 14-16h</small>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="mb-3">
            <Card.Header className="fw-bold">5. Proyección 2027</Card.Header>
            <Card.Body className="text-center">
              <h2 className="text-primary">{proyeccion.proy2027}</h2>
              <p className="mb-1">préstamos estimados/año</p>
              <small className="text-muted">Promedio actual: {proyeccion.promedio}/mes (+15%)</small>
              <hr/>
              <div className="text-start small">
                {proyeccion.meses.map(([mes, val]) => (
                  <div key={mes} className="d-flex justify-content-between">
                    <span>{mes}</span><span>{val}</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={6}>
          <Card className="mb-3">
            <Card.Header className="fw-bold">2. Rotación de Inventario</Card.Header>
            <Card.Body className="p-0">
              <Table size="sm" className="mb-0">
                <thead><tr><th>Equipo</th><th>Veces</th><th>Rot/mes</th></tr></thead>
                <tbody>
                  {rotacion.map(r => (
                    <tr key={r.nombre} className={r.alerta? 'table-warning':''}>
                      <td>{r.nombre}</td>
                      <td>{r.veces}</td>
                      <td>
                        {r.rotacion}
                        {r.alerta && <Badge bg="danger" className="ms-2">Reemplazar</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="mb-3">
            <Card.Header className="fw-bold">3. Cumplimiento por Sede</Card.Header>
            <Card.Body>
              {cumplimiento.map(c => (
                <div key={c.id} className="mb-2">
                  <div className="d-flex justify-content-between">
                    <span>{c.nombre}</span>
                    <span className="fw-bold">{c.pct}%</span>
                  </div>
                  <ProgressBar now={c.pct} variant={c.pct < 70? 'danger' : c.pct < 90? 'warning' : 'success'} />
                  <small className="text-muted">{c.aTiempo}/{c.total} a tiempo</small>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header className="fw-bold">4. Equipos con más Incidencias</Card.Header>
        <Card.Body>
          <Row>
            {incidencias.map(i => (
              <Col md={2} key={i.nombre} className="text-center">
                <h4 className="text-danger">{i.count}</h4>
                <small>{i.nombre}</small>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
}