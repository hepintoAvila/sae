import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Modal, Button, ListGroup, Badge } from 'react-bootstrap';

export default function EscanerQR({ inventario, onCierre }: any) {
  const [show, setShow] = useState(false);
  const [escaneados, setEscaneados] = useState<string[]>([]);

  useEffect(() => {
    if (!show) return;

    const scanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true
    }, false);

    scanner.render(
      (decodedText) => {
        // decodedText = "EQ-12" o el id del equipo
        const id = decodedText.replace('EQ-', '');
        if (!escaneados.includes(id)) {
          setEscaneados(prev => [...prev, id]);
          // sonido beep
          new Audio('/beep.mp3').play().catch(()=>{});
        }
      },
      (error) => {}
    );

    return () => { scanner.clear().catch(()=>{}); };
  }, [show]);

  const faltantes = inventario.filter((e:any) =>!escaneados.includes(String(e.id)));
  const sobrantes = escaneados.filter(id =>!inventario.find((e:any) => String(e.id) === id));

  return (
    <>
      <Button variant="success" onClick={() => setShow(true)}>
        📱 Escanear Inventario Físico
      </Button>

      <Modal show={show} onHide={() => setShow(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Conciliación QR - {escaneados.length} escaneados</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div id="qr-reader" style={{width:'100%'}}></div>

          <div className="mt-3">
            <h6>Escaneados <Badge bg="success">{escaneados.length}</Badge></h6>
            <ListGroup style={{maxHeight:'150px', overflow:'auto'}}>
              {escaneados.map(id => {
                const eq = inventario.find((e:any) => String(e.id) === id);
                return <ListGroup.Item key={id}>✓ EQ-{id} - {eq?.opcion?.title || 'No registrado'}</ListGroup.Item>
              })}
            </ListGroup>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>Cerrar</Button>
          <Button variant="primary" onClick={() => onCierre({escaneados, faltantes, sobrantes})}>
            Generar Reporte
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}