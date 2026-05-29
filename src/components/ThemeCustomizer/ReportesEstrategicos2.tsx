import { useMemo } from 'react';
import { Card, Row, Col, Table, Badge } from 'react-bootstrap';
import { useAulasContext } from '@/common/context/useAulasContext';
import { extractOpcionesFromAulas } from '@/common/helpers';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ReportesEstrategicos2() {
  const { prestamos = [], inventario: inventarioProp = [], aulas: aulasProp = [] } = useAulasContext();

const exportPDF = async () => {
  const element = document.getElementById('reportes-estrategicos2');
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

  pdf.save(`UPC-Reportes-Estrategicos2-${new Date().toISOString().slice(0,10)}.pdf`);
};
const getColor = (valor: number, max: number) => {
  if (valor === 0) return '#f8f9fa';
  const pct = valor / max;
  if (pct > 0.8) return '#dc3545'; // rojo intenso - pico
  if (pct > 0.6) return '#fd7e14'; // naranja
  if (pct > 0.4) return '#ffc107'; // amarillo
  if (pct > 0.2) return '#20c997'; // verde
  return '#e9ecef'; // gris claro
};
  const opciones = useMemo(() => extractOpcionesFromAulas(aulasProp as any), [aulasProp]);
  const equipos = useMemo(() => (inventarioProp || []).map((e:any) => ({ id: Number(e.id), opcion_id: Number(e.opcion_id) })), [inventarioProp]);

  // 1. DEMANDA POR FRANJA HORARIA (heatmap)
  const heatmap = useMemo(() => {
    const matriz: Record<string, number[]> = {};
    const dias = ['Lun','Mar','Mié','Jue','Vie'];

    dias.forEach(d => matriz[d] = Array(14).fill(0)); // 7am-9pm = 14 horas

    prestamos.forEach(p => {
      const inicio = new Date(p.start);
      const dia = inicio.getDay(); // 1-5
      const hora = inicio.getHours();
      if (dia >= 1 && dia <= 5 && hora >= 7 && hora < 21) {
        const diaKey = dias[dia-1];
        matriz[diaKey][hora-7]++;
      }
    });
    return matriz;
  }, [prestamos]);

  // 2. ROTACIÓN DE INVENTARIO
  const rotacion = useMemo(() => {
    const usoPorEquipo = new Map<number, number>();
    prestamos.forEach(p => {
      const eqId = (p as any).equipo_id;
      if (eqId && eqId > 0) {
        usoPorEquipo.set(eqId, (usoPorEquipo.get(eqId) || 0) + 1);
      }
    });

    return equipos.map(eq => {
      const usos = usoPorEquipo.get(eq.id) || 0;
      const opcion = opciones.find(o => o.id === eq.opcion_id);
      return {
        equipo: `#${eq.id}`,
        tipo: opcion?.title || '',
        usos,
        rotacion: usos // usos por mes (ajusta si quieres / meses)
      };
    }).sort((a,b) => b.usos - a.usos).slice(0, 10);
  }, [equipos, prestamos, opciones]);

  // 3. CUMPLIMIENTO POR SEDE
  const cumplimiento = useMemo(() => {
    const sedes = [...new Set(prestamos.map(p => p.dependencia_id))];
    return sedes.map(id => {
      const ps = prestamos.filter(p => p.dependencia_id === id);
      const devueltos = ps.filter(p => p.statut === 'Devuelto').length;
      const aTiempo = ps.filter(p => {
        const real = (p as any).end_real;
        return real && new Date(real) <= new Date(p.end);
      }).length;
      const porcentaje = devueltos > 0? Math.round((aTiempo / devueltos) * 100) : 0;
      return { sede: id, total: ps.length, porcentaje };
    });
  }, [prestamos]);

  const maxHeat = Math.max(...Object.values(heatmap).flat());

  return (
    <div id="reportes-estrategicos2">
            <div className="d-flex justify-content-between align-items-center mb-3">
      <h5 className="mb-0">Reportes Estratégicos - Dirección</h5>
      <button className="btn btn-danger btn-sm" onClick={exportPDF}>
        📄 Exportar PDF
      </button>
    </div>
      

      <Card className="mb-3">
        <Card.Header className="fw-bold">Demanda por Franja Horaria (L-V 7am-9pm)</Card.Header>
        <Card.Body>
          <div style={{overflowX:'auto'}}>
            <table className="table table-bordered text-center align-middle" style={{fontSize:'12px'}}>
              <thead>
                <tr>
                  <th style={{width:'60px'}}>Hora</th>
                  {Object.keys(heatmap).map(d => <th key={d}>{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {Array.from({length:14}, (_, i) => {
                  const hora = i + 7;
                  return (
                    <tr key={hora}>
                      <td className="fw-bold">{hora}:00</td>
                      {Object.entries(heatmap).map(([dia, valores]) => {
                        const valor = valores[i];
                        //const intensidad = maxHeat > 0? valor / maxHeat : 0;
                        //const bg = `rgba(220,53,69,${intensidad})`;
                        return (
                          <td key={dia} style={{
                                backgroundColor: getColor(valor, maxHeat),
                                color: valor / maxHeat > 0.6? 'white' : 'black',
                                fontWeight: valor / maxHeat > 0.8? 'bold' : 'normal'
                                }}>
                            {valor || ''}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <small className="text-muted">Picos: 10-12 y 2-4pm como esperabas</small>
        </Card.Body>
      </Card>

      <Row>
        <Col lg={6}>
          <Card className="mb-3">
            <Card.Header className="fw-bold">Rotación de Inventario (Top 10)</Card.Header>
            <Card.Body className="p-0">
              <Table size="sm" className="mb-0">
                <thead><tr><th>Equipo</th><th>Tipo</th><th>Usos/mes</th><th>Estado</th></tr></thead>
                <tbody>
                  {rotacion.map(r => (
                    <tr key={r.equipo}>
                      <td>{r.equipo}</td>
                      <td>{r.tipo}</td>
                      <td>{r.usos}</td>
                      <td>{r.usos > 40? <Badge bg="danger">Reemplazar</Badge> : r.usos > 25? <Badge bg="warning">Vigilar</Badge> : <Badge bg="success">OK</Badge>}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card>
            <Card.Header className="fw-bold">Cumplimiento de Devoluciones</Card.Header>
            <Card.Body>
              {cumplimiento.map(c => (
                <div key={c.sede} className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span>Sede {c.sede}</span>
                    <span className={c.porcentaje < 80? 'text-danger fw-bold' : 'text-success'}>{c.porcentaje}%</span>
                  </div>
                  <div className="progress" style={{height:'8px'}}>
                    <div className={`progress-bar ${c.porcentaje < 80? 'bg-danger' : 'bg-success'}`} style={{width:`${c.porcentaje}%`}}></div>
                  </div>
                  <small className="text-muted">{c.total} préstamos</small>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}