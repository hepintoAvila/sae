import { useState } from 'react';
import { Table, Button, Modal, Form, Row, Col, Badge } from 'react-bootstrap';

export type Usuario = {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'coordinador' | 'auxiliar' | 'usuario';
  dependencia_id: number;
  sede: string;
  activo: boolean;
};

type Dependencia = { id: number; codigo: string; sede: string };

export default function UserCrud({ dependencias = [] }: { dependencias: Dependencia[] }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    { id: 1, nombre: 'Admin Principal', email: 'admin@upc.edu.co', rol: 'admin', dependencia_id: 1, sede: 'Valledupar', activo: true },
    { id: 2, nombre: 'Coord. Biblioteca', email: 'coord.bib@upc.edu.co', rol: 'coordinador', dependencia_id: 1, sede: 'Valledupar', activo: true },
  ]);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [form, setForm] = useState<Partial<Usuario>>({});

  const open = (u: Usuario | null = null) => {
    setEditing(u);
    setForm(u || { nombre:'', email:'', rol:'usuario', dependencia_id: dependencias[0]?.id || 1, sede: dependencias[0]?.sede || '', activo: true });
    setShow(true);
  };

  const save = () => {
    if (editing) {
      setUsuarios(usuarios.map(x => x.id === editing.id? {...form, id: editing.id } as Usuario : x));
    } else {
      const id = Math.max(0,...usuarios.map(u => u.id)) + 1;
      const dep = dependencias.find(d => d.id === form.dependencia_id);
      setUsuarios([...usuarios, {...form, id, sede: dep?.sede || '' } as Usuario]);
    }
    setShow(false);
  };

  const del = (id: number) => { if (confirm('¿Eliminar usuario?')) setUsuarios(usuarios.filter(u => u.id!== id)); };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="mb-0">Gestión de Usuarios</h5>
          <small className="text-muted">Coordinadores y auxiliares por sede</small>
        </div>
        <Button size="sm" onClick={() => open()}><i className="mdi mdi-plus me-1"/>Nuevo Usuario</Button>
      </div>

      <div style={{maxHeight:'400px', overflow:'auto'}}>
        <Table hover size="sm" className="align-middle">
          <thead className="table-light sticky-top">
            <tr><th>Usuario</th><th>Email</th><th>Rol</th><th>Sede</th><th>Estado</th><th style={{ width: 90 }}/></tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <span className="avatar-xs me-2"><span className="avatar-title bg-soft-primary text-primary rounded-circle">{u.nombre[0]}</span></span>
                    <strong>{u.nombre}</strong>
                  </div>
                </td>
                <td><small>{u.email}</small></td>
                <td><Badge bg={u.rol==='admin'?'danger':u.rol==='coordinador'?'primary':u.rol==='auxiliar'?'info':'secondary'}>{u.rol}</Badge></td>
                <td><Badge bg="light" text="dark">{u.sede}</Badge></td>
                <td><Badge bg={u.activo?'success':'secondary'}>{u.activo?'Activo':'Inactivo'}</Badge></td>
                <td className="text-end">
                  <Button variant="link" size="sm" className="p-0 me-2" onClick={()=>open(u)}><i className="mdi mdi-pencil"/></Button>
                  <Button variant="link" size="sm" className="p-0 text-danger" onClick={()=>del(u.id)}><i className="mdi mdi-delete"/></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal show={show} onHide={()=>setShow(false)} centered>
        <Modal.Header closeButton><Modal.Title>{editing?'Editar':'Nuevo'} Usuario</Modal.Title></Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={12}><Form.Group className="mb-3"><Form.Label>Nombre</Form.Label><Form.Control value={form.nombre||''} onChange={e=>setForm({...form, nombre:e.target.value})}/></Form.Group></Col>
            <Col md={12}><Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" value={form.email||''} onChange={e=>setForm({...form, email:e.target.value})}/></Form.Group></Col>
            <Col md={6}><Form.Group className="mb-3"><Form.Label>Rol</Form.Label><Form.Select value={form.rol||'usuario'} onChange={e=>setForm({...form, rol:e.target.value as any})}><option value="usuario">Usuario</option><option value="auxiliar">Auxiliar</option><option value="coordinador">Coordinador</option><option value="admin">Administrador</option></Form.Select></Form.Group></Col>
            <Col md={6}><Form.Group className="mb-3"><Form.Label>Sede</Form.Label><Form.Select value={form.dependencia_id||''} onChange={e=>{const id=Number(e.target.value); const d=dependencias.find(x=>x.id===id); setForm({...form, dependencia_id:id, sede:d?.sede||''});}}>{dependencias.map(d=><option key={d.id} value={d.id}>{d.codigo} - {d.sede}</option>)}</Form.Select></Form.Group></Col>
            <Col md={12}><Form.Check type="switch" label="Activo" checked={form.activo??true} onChange={e=>setForm({...form, activo:e.target.checked})}/></Col>
          </Row>
        </Modal.Body>
        <Modal.Footer><Button variant="light" onClick={()=>setShow(false)}>Cancelar</Button><Button variant="primary" onClick={save}>Guardar</Button></Modal.Footer>
      </Modal>
    </>
  );
}