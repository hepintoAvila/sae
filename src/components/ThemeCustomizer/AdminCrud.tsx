import { extractAulasFromProp, extractOpcionesFromAulas } from '@/common/helpers/toSentenceCase';
import { useEffect, useState, useMemo } from 'react';
import { Table, Button, Modal, Form, Tabs, Tab, Badge, Row, Col, InputGroup } from 'react-bootstrap';

type Dependencia = { id: number; nombre: string; sede: string; ciudad: string; codigo: string; color_primary: string; statut?: string };
type Aula = { id: number; dependencia_id: number; title: string; className: string; textClass: string; statut?: string };
type Opcion = { id: number; idAula: number; dependencia_id: number; title: string; stock: number; className?: string; textClass?: string; statut?: string };
type Equipo = { id: number; dependencia_id: number; opcion_id: number; serial: string; marca?: string; modelo?: string; estado: string; observaciones?: string };



export default function AdminCrud({
  aulas: aulasProp,
  inventario: inventarioProp,
  dependencias: dependenciasProp
}: {
  aulas: any[];
  prestamos?: any[];
  inventario: Equipo[];
  dependencias: Dependencia[]
}) {
  const [activeTab, setActiveTab] = useState('opciones');
  const [dependencias, setDependencias] = useState<Dependencia[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [opciones, setOpciones] = useState<Opcion[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);

  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const [searchDep, setSearchDep] = useState<string>('all');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const deps = (dependenciasProp || []).map(d => ({...d, id: Number(d.id)}));
    setDependencias(deps);
    setEquipos((inventarioProp || []).map(e => ({...e, id: Number(e.id), dependencia_id: Number(e.dependencia_id), opcion_id: Number(e.opcion_id)})));
    setAulas(extractAulasFromProp(aulasProp as any));
    setOpciones(extractOpcionesFromAulas(aulasProp as any));
  }, [dependenciasProp, aulasProp, inventarioProp]);

  const opcionesFiltradas = useMemo(() => {
    return opciones.filter(op => {
      const matchDep = searchDep === 'all' || Number(op.dependencia_id) === Number(searchDep);
      const matchText =!searchText || op.title.toLowerCase().includes(searchText.toLowerCase());
      return matchDep && matchText;
    });
  }, [opciones, searchDep, searchText]);

  const openModal = (item: any = null) => {
    setEditing(item);
    setFormData(item || getEmptyForm());
    setShow(true);
  };

  const getEmptyForm = () => {
    switch(activeTab){
      case 'dependencias': return { nombre:'', sede:'', ciudad:'', codigo:'', color_primary:'#0d6efd', statut:'Activo' };
      case 'aulas': return { dependencia_id: dependencias[0]?.id || 1, title:'', className:'bg-primary', textClass:'text-white', statut:'Activo' };
      case 'opciones': return { idAula: aulas[0]?.id || 1, dependencia_id: Number(searchDep) || dependencias[0]?.id || 1, title:'', stock:1, className:'bg-primary', textClass:'text-white', statut:'Activo' };
      case 'equipos': return { dependencia_id: dependencias[0]?.id || 1, opcion_id: opciones[0]?.id || 1, serial:'', marca:'', modelo:'', estado:'Disponible', observaciones:'' };
      default: return {};
    }
  };

  const handleSave = async () => {
    const list = getList();
    if (editing) {
      setList(list.map((i:any) => i.id === editing.id? {...formData, id: editing.id} : i));
    } else {
      const newId = Math.max(0,...list.map((i:any)=>i.id)) + 1;
      setList([...list, {...formData, id: newId}]);
    }
    setShow(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar registro?')) return;
    setList(getList().filter((i:any) => i.id!== id));
  };

  const getList = () => {
    switch(activeTab){
      case 'dependencias': return dependencias;
      case 'aulas': return aulas;
      case 'opciones': return opciones;
      case 'equipos': return equipos;
      default: return [];
    }
  };

  const setList = (data:any) => {
    switch(activeTab){
      case 'dependencias': setDependencias(data); break;
      case 'aulas': setAulas(data); break;
      case 'opciones': setOpciones(data); break;
      case 'equipos': setEquipos(data); break;
    }
  };

  const renderTable = () => {
    switch(activeTab) {
      case 'dependencias':
        return (
          <Table striped hover size="sm">
            <thead className="table-light sticky-top"><tr><th>Sede</th><th>Nombre</th><th>Código</th><th>Ciudad</th><th>Color</th><th></th></tr></thead>
            <tbody>
              {dependencias.map(d => (
                <tr key={d.id}>
                  <td><strong>{d.sede}</strong></td>
                  <td>{d.nombre}</td>
                  <td><Badge bg="secondary">{d.codigo}</Badge></td>
                  <td>{d.ciudad}</td>
                  <td><span style={{background:d.color_primary,width:22,height:22,display:'inline-block',borderRadius:4,border:'1px solid #ddd'}}/></td>
                  <td className="text-end">
                    <Button variant="link" size="sm" onClick={()=>openModal(d)}><i className="mdi mdi-pencil"/></Button>
                    <Button variant="link" size="sm" className="text-danger" onClick={()=>handleDelete(d.id)}><i className="mdi mdi-delete"/></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        );
      case 'aulas':
        return (
          <Table striped hover size="sm">
            <thead className="table-light sticky-top"><tr><th>Categoría</th><th>Dependencia</th><th>Clase</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {aulas.map(a => {
                const dep = dependencias.find(d => Number(d.id) === Number(a.dependencia_id));
                return (
                  <tr key={a.id}>
                    <td><span className={`badge ${a.className} ${a.textClass}`}>{a.title}</span></td>
                    <td>{dep?.codigo || '-'}</td>
                    <td><code>{a.className}</code></td>
                    <td><Badge bg="success">{a.statut}</Badge></td>
                    <td className="text-end">
                      <Button variant="link" size="sm" onClick={()=>openModal(a)}><i className="mdi mdi-pencil"/></Button>
                      <Button variant="link" size="sm" className="text-danger" onClick={()=>handleDelete(a.id)}><i className="mdi mdi-delete"/></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        );
      case 'equipos':
        return (
          <Table striped hover size="sm">
            <thead className="table-light sticky-top"><tr><th>Serial</th><th>Equipo</th><th>Opción</th><th>Sede</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {equipos.map(eq => {
                const op = opciones.find(o => Number(o.id) === Number(eq.opcion_id));
                const dep = dependencias.find(d => Number(d.id) === Number(eq.dependencia_id));
                return (
                  <tr key={eq.id}>
                    <td><code>{eq.serial}</code></td>
                    <td>{eq.marca} {eq.modelo}</td>
                    <td>{op?.title || '-'}</td>
                    <td><Badge bg="light" text="dark">{dep?.codigo}</Badge></td>
                    <td><Badge bg={eq.estado==='Disponible'?'success':eq.estado==='Prestado'?'warning':'secondary'}>{eq.estado}</Badge></td>
                    <td className="text-end">
                      <Button variant="link" size="sm" onClick={()=>openModal(eq)}><i className="mdi mdi-pencil"/></Button>
                      <Button variant="link" size="sm" className="text-danger" onClick={()=>handleDelete(eq.id)}><i className="mdi mdi-delete"/></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        );
      case 'opciones':
        return (
          <Table striped hover size="sm">
            <thead className="table-light sticky-top"><tr><th>Servicio</th><th>Aula Padre</th><th>Sede</th><th>Stock</th><th></th></tr></thead>
            <tbody>
              {opcionesFiltradas.map(item => {
                const aulaPadre = aulas.find(a => Number(a.id) === Number(item.idAula));
                const dep = dependencias.find(d => Number(d.id) === Number(item.dependencia_id));
                return (
                  <tr key={item.id}>
                    <td><strong>{item.title}</strong></td>
                    <td>{aulaPadre?.title || '-'}</td>
                    <td><Badge bg="light" text="dark" style={{borderLeft:`4px solid ${dep?.color_primary}`}}>{dep?.codigo}</Badge></td>
                    <td><Badge bg="info">{item.stock}</Badge></td>
                    <td className="text-end">
                      <Button variant="link" size="sm" onClick={()=>openModal(item)}><i className="mdi mdi-pencil"/></Button>
                      <Button variant="link" size="sm" className="text-danger" onClick={()=>handleDelete(item.id)}><i className="mdi mdi-delete"/></Button>
                    </td>
                  </tr>
                );
              })}
              {opcionesFiltradas.length===0 && <tr><td colSpan={5} className="text-center text-muted py-4">Sin resultados</td></tr>}
            </tbody>
          </Table>
        );
    }
  };

  const renderForm = () => {
    switch(activeTab){
      case 'dependencias':
        return (<Row><Col md={6}><Form.Group className="mb-2"><Form.Label>Nombre</Form.Label><Form.Control value={formData.nombre||''} onChange={e=>setFormData({...formData,nombre:e.target.value})}/></Form.Group></Col><Col md={3}><Form.Group className="mb-2"><Form.Label>Sede</Form.Label><Form.Control value={formData.sede||''} onChange={e=>setFormData({...formData,sede:e.target.value})}/></Form.Group></Col><Col md={3}><Form.Group className="mb-2"><Form.Label>Código</Form.Label><Form.Control value={formData.codigo||''} onChange={e=>setFormData({...formData,codigo:e.target.value})}/></Form.Group></Col><Col md={6}><Form.Group className="mb-2"><Form.Label>Ciudad</Form.Label><Form.Control value={formData.ciudad||''} onChange={e=>setFormData({...formData,ciudad:e.target.value})}/></Form.Group></Col><Col md={6}><Form.Group className="mb-2"><Form.Label>Color</Form.Label><Form.Control type="color" value={formData.color_primary||'#0d6efd'} onChange={e=>setFormData({...formData,color_primary:e.target.value})}/></Form.Group></Col></Row>);
      case 'aulas':
        return (<Row><Col md={6}><Form.Group className="mb-2"><Form.Label>Título</Form.Label><Form.Control value={formData.title||''} onChange={e=>setFormData({...formData,title:e.target.value})}/></Form.Group></Col><Col md={6}><Form.Group className="mb-2"><Form.Label>Dependencia</Form.Label><Form.Select value={formData.dependencia_id||''} onChange={e=>setFormData({...formData,dependencia_id:+e.target.value})}>{dependencias.map(d=><option key={d.id} value={d.id}>{d.codigo} - {d.sede}</option>)}</Form.Select></Form.Group></Col><Col md={6}><Form.Group className="mb-2"><Form.Label>ClassName</Form.Label><Form.Control value={formData.className||''} onChange={e=>setFormData({...formData,className:e.target.value})}/></Form.Group></Col><Col md={6}><Form.Group className="mb-2"><Form.Label>TextClass</Form.Label><Form.Select value={formData.textClass||'text-white'} onChange={e=>setFormData({...formData,textClass:e.target.value})}><option>text-white</option><option>text-dark</option></Form.Select></Form.Group></Col></Row>);
      case 'opciones':
        return (<Row><Col md={8}><Form.Group className="mb-2"><Form.Label>Título</Form.Label><Form.Control value={formData.title||''} onChange={e=>setFormData({...formData,title:e.target.value})}/></Form.Group></Col><Col md={4}><Form.Group className="mb-2"><Form.Label>Stock</Form.Label><Form.Control type="number" value={formData.stock||1} onChange={e=>setFormData({...formData,stock:+e.target.value})}/></Form.Group></Col><Col md={6}><Form.Group className="mb-2"><Form.Label>Aula Padre</Form.Label><Form.Select value={formData.idAula||''} onChange={e=>setFormData({...formData,idAula:+e.target.value})}>{aulas.map(a=><option key={a.id} value={a.id}>{a.title}</option>)}</Form.Select></Form.Group></Col><Col md={6}><Form.Group className="mb-2"><Form.Label>Dependencia</Form.Label><Form.Select value={formData.dependencia_id||''} onChange={e=>setFormData({...formData,dependencia_id:+e.target.value})}>{dependencias.map(d=><option key={d.id} value={d.id}>{d.sede}</option>)}</Form.Select></Form.Group></Col></Row>);
      case 'equipos':
        return (<Row><Col md={4}><Form.Group className="mb-2"><Form.Label>Serial</Form.Label><Form.Control value={formData.serial||''} onChange={e=>setFormData({...formData,serial:e.target.value})}/></Form.Group></Col><Col md={4}><Form.Group className="mb-2"><Form.Label>Marca</Form.Label><Form.Control value={formData.marca||''} onChange={e=>setFormData({...formData,marca:e.target.value})}/></Form.Group></Col><Col md={4}><Form.Group className="mb-2"><Form.Label>Modelo</Form.Label><Form.Control value={formData.modelo||''} onChange={e=>setFormData({...formData,modelo:e.target.value})}/></Form.Group></Col><Col md={6}><Form.Group className="mb-2"><Form.Label>Opción</Form.Label><Form.Select value={formData.opcion_id||''} onChange={e=>setFormData({...formData,opcion_id:+e.target.value})}>{opciones.map(o=><option key={o.id} value={o.id}>{o.title}</option>)}</Form.Select></Form.Group></Col><Col md={6}><Form.Group className="mb-2"><Form.Label>Estado</Form.Label><Form.Select value={formData.estado||'Disponible'} onChange={e=>setFormData({...formData,estado:e.target.value})}><option>Disponible</option><option>Prestado</option><option>Mantenimiento</option></Form.Select></Form.Group></Col></Row>);
    }
  };

  return (
    <div>
      <Tabs activeKey={activeTab} onSelect={k=>setActiveTab(k!)} className="mb-3 nav-bordered">
        <Tab eventKey="dependencias" title={`Sedes (${dependencias.length})`} />
        <Tab eventKey="aulas" title={`Aulas (${aulas.length})`} />
        <Tab eventKey="opciones" title={`Opciones (${opcionesFiltradas.length}/${opciones.length})`} />
        <Tab eventKey="equipos" title={`Inventario (${equipos.length})`} />
      </Tabs>

      {activeTab === 'opciones' && (
        <Row className="mb-3 g-2">
          <Col md={4}>
            <Form.Select size="sm" value={searchDep} onChange={e=>setSearchDep(e.target.value)}>
              <option value="all">Todas las sedes</option>
              {dependencias.map(d => <option key={d.id} value={d.id}>{d.codigo} - {d.sede}</option>)}
            </Form.Select>
          </Col>
          <Col md={8}>
            <InputGroup size="sm">
              <InputGroup.Text><i className="mdi mdi-magnify"/></InputGroup.Text>
              <Form.Control placeholder="Buscar servicio..." value={searchText} onChange={e=>setSearchText(e.target.value)} />
              {searchText && <Button variant="outline-secondary" onClick={()=>setSearchText('')}>×</Button>}
            </InputGroup>
          </Col>
        </Row>
      )}

      <div className="d-flex justify-content-between mb-2">
        <h6 className="mb-0 text-capitalize">Gestión de {activeTab}</h6>
        <Button size="sm" onClick={()=>openModal()}><i className="mdi mdi-plus me-1"/>Nuevo</Button>
      </div>

      <div style={{maxHeight:'380px', overflow:'auto'}}>{renderTable()}</div>

      <Modal show={show} onHide={()=>setShow(false)} centered>
        <Modal.Header closeButton><Modal.Title>{editing?'Editar':'Nuevo'} {activeTab}</Modal.Title></Modal.Header>
        <Modal.Body>{renderForm()}</Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={()=>setShow(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave}>Guardar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}