import { useState, useMemo } from 'react';
import { Card, Button, Table, Badge, Form, Row, Col } from 'react-bootstrap';
import { useAulasContext } from '@/common/context/useAulasContext';
import * as XLSX from 'xlsx';

export default function InventarioConciliacion() {
  const { inventario = [] } = useAulasContext();
  const [fisico, setFisico] = useState<Set<string>>(new Set());

  const descargarPlantilla = () => {
    const data = inventario.map((e:any) => ({
      codigo: e.codigo || `EQ-${e.id}`,
      equipo_id: e.id,
      nombre: e.nombre,
      estado_sistema: e.estado,
      encontrado: '',
      observaciones: ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventario');
    XLSX.writeFile(wb, `plantilla-inventario-${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const subirConteo = (e:any) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, {type:'array'});
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      const encontrados = new Set(rows.filter((r:any) => String(r.encontrado).toLowerCase() === 'x' || r.encontrado === 1).map((r:any) => String(r.equipo_id)));
      setFisico(encontrados);
    };
    reader.readAsArrayBuffer(file);
  };

  const conciliacion = useMemo(() => {
    const sistema = new Set(inventario.map((e:any) => String(e.id)));
    const faltantes = [...sistema].filter(id =>!fisico.has(id));
    const sobrantes = [...fisico].filter(id =>!sistema.has(id));
    const ok = [...sistema].filter(id => fisico.has(id));

    return { faltantes, sobrantes, ok, total: sistema.size };
  }, [inventario, fisico]);

  return (
    <div>
      <h5>Conciliación Inventario Semestral</h5>

      <Card className="mb-3">
        <Card.Body className="d-flex gap-2">
          <Button variant="success" onClick={descargarPlantilla}>1. Descargar plantilla</Button>
          <Form.Control type="file" accept=".xlsx" onChange={subirConteo} style={{maxWidth:'300px'}} />
          <span className="text-muted">2. Subir conteo físico</span>
        </Card.Body>
      </Card>

      {fisico.size > 0 && (
        <Row>
          <Col md={3}><Card className="text-center border-success"><Card.Body><h2>{conciliacion.ok.length}</h2><small>Coinciden</small></Card.Body></Card></Col>
          <Col md={3}><Card className="text-center border-danger"><Card.Body><h2>{conciliacion.faltantes.length}</h2><small>Faltantes</small></Card.Body></Card></Col>
          <Col md={3}><Card className="text-center border-warning"><Card.Body><h2>{conciliacion.sobrantes.length}</h2><small>Sobrantes</small></Card.Body></Card></Col>
          <Col md={3}><Card className="text-center"><Card.Body><h2>{Math.round((conciliacion.ok.length/conciliacion.total)*100)}%</h2><small>Exactitud</small></Card.Body></Card></Col>
        </Row>
      )}

      {conciliacion.faltantes.length > 0 && (
        <Card className="mt-3 border-danger">
          <Card.Header className="bg-danger text-white">Equipos FALTANTES en físico ({conciliacion.faltantes.length})</Card.Header>
          <Card.Body className="p-0">
            <Table size="sm" className="mb-0">
              <tbody>
                {conciliacion.faltantes.slice(0,20).map(id => {
                  const eq = inventario.find((e:any) => String(e.id) === id);
                  return <tr key={id}><td>{eq?.serial}</td><td>{eq?.modelo}</td><td><Badge bg="danger">Buscar</Badge></td></tr>;
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}