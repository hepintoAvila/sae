import { Modal, Row, Col, Button, Form, Spinner, Badge } from 'react-bootstrap';
import { EventInput } from '@fullcalendar/core';
import { CustomDatePicker } from '@/components';
import { useEffect, useState, useMemo, useCallback } from 'react';
import Swal from 'sweetalert2';
import useAulas from '@/hooks/useAulas';
import { Prestamo, Aula, SendEvent, EquipoInventario } from '@/types/aulas';
import React from 'react';
import { useAlert } from './hooks/useAlert';
import { extractOpcionesFromAulas } from '@/common/helpers';


type Dependencia = { id: number; nombre: string; sede: string; ciudad: string; codigo: string };

type AddEditEventProps = {
  isOpen: boolean;
  setEnviar: React.Dispatch<React.SetStateAction<boolean>>;
  onClose: () => void;
  isEditable: boolean;
  eventData: EventInput | SendEvent;
  onRemoveEvent?: (value: SendEvent) => void;
  onUpdateEvent?: (value: SendEvent) => void;
  onAddEvent?: (value: SendEvent) => void;
  aulas: (Aula & { dependencia_id?: number })[];
  aulasOriginales: (Aula & { dependencia_id?: number })[];
  prestamos?: Prestamo[];
  inventario?: (EquipoInventario & { dependencia_id?: number })[];
  dependencias?: Dependencia[]; // ← NUEVO
};

const pad = (n: number) => String(n).padStart(2, '0');
const parseDate = (d: any): Date | null => { if (!d) return null; if (d instanceof Date) return d; const [date, time] = String(d).replace('T',' ').split(' '); const [y,m,day] = date.split('-').map(Number); const [h,mi,s='0'] = (time||'00:00:00').split(':').map(Number); return new Date(y, m-1, day, h, mi, Number(s)); };
const toMysql = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

const AddEditEvent = ({ isOpen, setEnviar, onClose, isEditable, eventData, onRemoveEvent, onUpdateEvent, onAddEvent, aulas, aulasOriginales, prestamos = [], inventario, dependencias = [] }: AddEditEventProps) => {
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
 const [selectedAula, setSelectedAula] = useState<any>('');
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [recurrencia, setRecurrencia] = useState<string>('none');
  const [observacionesValue, setObservacionesValue] = useState('');
  const [tabletSel, setTabletSel] = useState<EquipoInventario | null>(null);

  const { createPrestamo, updatePrestamo, deletePrestamo, loading: apiLoading } = useAulas();
  const userDatos = JSON.parse(localStorage.getItem('userData') || '{}');
  const dependenciaUsuario = String(userDatos.dependencia_id || '1');
  
  //const esAdmin = ['Admin','Bibliotecario','Administrador'].includes(userDatos.Rol);
  const emailUsuario = (userDatos?.Email || userDatos?.email || '').toLowerCase();
 const [selectedDependencia, setSelectedDependencia] = useState<string>(dependenciaUsuario);
  // FILTRAR POR DEPENDENCIA

  const alert = useAlert();
  
const aulasFiltradas = useMemo(() => {
  const clean = (t: string) => String(t||'')
   .replace(/^aula\s+/i,'')
   .replace(/^aulas\s+/i,'') // por "Aulas Equipos"
   .replace(/^a-?\s*/i,'')
   .replace(/\s+/g,' ')
   .trim();

  return (aulasOriginales || [])
   .filter(a => String(a.dependencia_id || 1) === String(selectedDependencia)) // ← FILTRA AQUÍ
   .map(a => ({
     ...a,
      titleDisplay: clean(a.title),
      children: (a.children || []).map(c => ({
       ...c,
        titleClean: clean(c.title),
      })),
    }));
}, [aulasOriginales, selectedDependencia]); // ← vuelve a poner selectedDependencia

 console.log('aulasFiltradas1:', aulasFiltradas);
 
const Allopciones = useMemo(() =>
  extractOpcionesFromAulas(aulasFiltradas as any) || [],
  [aulasFiltradas]
);

const childrenAula = useMemo(() => {
  if (!selectedAula) return [];
  return Allopciones.filter(op => String(op.idAula) === String(selectedAula));
}, [selectedAula, Allopciones]);

const aulaSel = aulasFiltradas.find(a => String(a.id) === String(selectedAula));
const opcionSeleccionada = useMemo(() =>
  Allopciones.find(o => String(o.id) === String(selectedChild)),
  [Allopciones, selectedChild]
);

// Aula Equipos = id 3 en tu BD (o por nombre)
const esEquipos = aulaSel?.titleDisplay?.toLowerCase() === 'equipos'
  || String(aulaSel?.id) === '3';

const esTablets = esEquipos && opcionSeleccionada?.title?.toLowerCase().includes('tablet');

  const childSel = aulaSel?.children?.find(c => String(c.id) === String(selectedChild));
  const className = childSel?.className || aulaSel?.className || 'bg-primary';
  const textClass = childSel?.textClass || aulaSel?.textClass || 'text-white';

  const [cantidad, setCantidad] = useState(1);

  const objselected = useMemo(() => {
    const id = (eventData as any)?.id;
    if (!id) return null;
    return prestamos.find((p) => String(p.id) === String(id)) || null;
  }, [prestamos, eventData]);

  console.log('objselected:', objselected);
  const isFirstLoad = React.useRef(true);

useEffect(() => {
  if (!isOpen) return;

  setSelectedDependencia(dependenciaUsuario);
  setTabletSel(null);

  const ev = eventData as any;
  setStart(parseDate(ev.start)?? new Date());
  setEnd(parseDate(ev.end)?? new Date(Date.now() + 3600000));

  if (isEditable && objselected) {
    const depId = String(objselected.dependencia_id || '1');
    setSelectedDependencia(depId);

    const aulaEncontrada = aulasFiltradas.find(a =>
      String(a.id) === String(objselected.title) ||
      a.title === objselected.title
    );
    setSelectedAula(String(aulaEncontrada?.id || ''));

    // Recupera childId y recurrencia
    setTimeout(() => {
      let childId = String(objselected.childId?? '0');
      if (childId === '0' && objselected.equipo_id) {
        const equipo = inventario?.find(inv => String(inv.id) === String(objselected.equipo_id));
        if (equipo) childId = String(equipo.opcion_id);
      }
      setSelectedChild(childId);
    }, 100);

    setRecurrencia(objselected.recurrencia || 'none'); // ← AQUÍ
    setObservacionesValue(objselected.observaciones || ''); // ← Y AQUÍ
  } else {
    if (aulasFiltradas.length > 0) {
      setSelectedAula(String(aulasFiltradas[0].id));
    }
    setSelectedChild('');
    setRecurrencia('none');
    setObservacionesValue('');
  }
}, [isOpen, eventData, isEditable, objselected, aulasFiltradas, dependenciaUsuario, inventario]);

// Cuando carguen las aulas, selecciona la primera automáticamente
useEffect(() => {
  if (!isOpen || isEditable) return;
  if (aulasFiltradas.length > 0 &&!selectedAula) {
    setSelectedAula(String(aulasFiltradas[0].id));
  }
}, [aulasFiltradas, isOpen, isEditable, selectedAula]);
  useEffect(() => {
    localStorage.setItem('dependencia_activa', selectedDependencia);
  }, [selectedDependencia]);

  useEffect(() => { if (isFirstLoad.current) { isFirstLoad.current = false; return; } setSelectedChild(''); }, [selectedAula]);
  
  const validateTimeRange = useCallback((s: Date | null, e: Date | null) => {
    if (!s ||!e) { alert.faltanFechas(); return false; }
    if (s >= e) { alert.horaInvalida(); return false; }
    return true;
  }, [alert]);
  
  const checkOverlap = useCallback((s: Date, e: Date, aulaId: string, childId: string) => {
    const currentId = (eventData as any)?.id;
    const conflict = prestamos.find((p) => {
      if (currentId && String(p.id) === String(currentId)) return false;
      if (String(p.dependencia_id || 1)!== selectedDependencia) return false; // ← solo misma sede
      if (String(p.title)!== aulaId) return false;
      if (String(p.childId?? '0')!== (childId || '0')) return false;
      return s < new Date(p.end) && e > new Date(p.start);
    });

    if (conflict) { alert.conflictoHorario(); return false; }
    return true;
  }, [eventData, prestamos, selectedDependencia]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateTimeRange(start, end)) return;
    if (!selectedAula) return;
    if (childrenAula.length > 0 &&!selectedChild) { Swal.fire({ icon: 'warning', text: 'Selecciona una opción' }); return; }

    const aulaNombre = aulasFiltradas?.find(a => String(a.id) === String(selectedAula))?.title || '';
    
    if (aulaNombre.toLowerCase()!== 'Equipos') {
      const nuevaHora = start!.getHours(); const nuevoMin = start!.getMinutes();
      const hayMismaHora = prestamos.some(p => {
        if (isEditable && String(p.id) === String((eventData as any)?.id)) return false;
        if (String(p.dependencia_id || 1)!== selectedDependencia) return false;
        const mismoAula = String(p.title) === String(selectedAula) || p.title === aulaNombre;
        const mismaOpcion = String(p.childId?? '0') === String(selectedChild || '0');
        if (!mismoAula ||!mismaOpcion) return false;
        const fechaPrestamo = parseDate(p.start || (p as any).inicial);
        return fechaPrestamo?.getHours() === nuevaHora && fechaPrestamo?.getMinutes() === nuevoMin;
      });
      if (hayMismaHora) { Swal.fire({ icon: 'error', title: 'Horario no disponible', html: `Ya existe un préstamo de <b>${aulaNombre}</b> a las <b>${pad(nuevaHora)}:${pad(nuevoMin)}</b>.` }); return; }
    }

    if (!checkOverlap(start!, end!, selectedAula, selectedChild)) return;

    if (esEquipos) {
      const yaTiene = prestamos?.some(p => {
        if (isEditable && String(p.id) === String((eventData as any)?.id)) return false;
        if (String(p.dependencia_id || 1)!== selectedDependencia) return false;
        const esMismoUsuario = (p.email || '').toLowerCase() === emailUsuario;
        const esMismoEquipo = String(p.childId) === String(selectedChild);
        const seCruza = start! < new Date(p.end) && end! > new Date(p.start);
        return esMismoUsuario && esMismoEquipo && seCruza;
      });
      if (yaTiene) { Swal.fire({ icon: 'error', title: 'Ya tienes un préstamo activo', text: 'Solo 1 tablet por sede' }); return; }
      setCantidad(1);
    }

    const formData = new FormData(e.currentTarget);
    const observaciones = formData.get('observaciones') as string;

    try {
 
if (isEditable) {
  const emailPrestamo = (objselected?.email || '').toLowerCase();
  if (emailPrestamo !== emailUsuario) { alert.noAutorizado(); return; }

  // Detecta si es parte de una serie
  const esSerie = objselected?.recurrencia && objselected?.recurrencia !== 'none' && objselected?.serie_id;
  let modo = 'uno';

  if (esSerie) {
    const res = await Swal.fire({
      icon: 'question',
      title: '¿Actualizar toda la serie?',
      html: `Este préstamo es parte de una serie <b>${objselected.recurrencia}</b>.<br>¿Quieres cambiar solo este o todos?`,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Solo este',
      denyButtonText: 'Toda la serie',
      cancelButtonText: 'Cancelar'
    });

    if (res.isDismissed) return;
    modo = res.isDenied ? 'serie' : 'uno';
  }

  const payloadBase = { 
    id: (eventData as any).id,
    title: selectedAula,
    childId: selectedChild || '0', 
    start: toMysql(start!), 
    end: toMysql(end!), 
    className, 
    textClass, 
    observaciones, 
    email: emailUsuario, 
    recurrencia, 
    dependencia_id: selectedDependencia, 
    serie_id: objselected?.serie_id, 
    modo, // ← ahora puede ser 'serie'
    cantidad: esEquipos? 1 : cantidad 
  };
  
  await updatePrestamo(payloadBase as any);
  
  onUpdateEvent?.({ ...payloadBase, start: start!, end: end! } as unknown as SendEvent);
  setEnviar(true);
  
  Swal.fire({ 
    icon: 'success', 
    title: modo === 'serie' ? 'Serie actualizada' : 'Actualizado', 
    timer: 1200, 
    showConfirmButton: false 
  });

      } else {
        const payload = { 
          title: selectedAula, 
          childId: selectedChild || '0', 
          start: toMysql(start!), 
          end: toMysql(end!), 
          className, 
          textClass, 
          observaciones, 
          usuario: emailUsuario, 
          recurrencia: String(recurrencia?? 'none'), 
          dependencia_id: selectedDependencia, 
          cantidad: esEquipos? 1 : cantidad, 
          tablet_id: tabletSel?.id };
        const result = await createPrestamo(payload as any);
        const newEvent = { id: result?.Prestamos?.[0]?.id?? String(Date.now()), title: selectedAula, childId: selectedChild || '0', start: start!, end: end!, observaciones, recurrencia: String(recurrencia?? 'none'), dependencia_id: selectedDependencia, cantidad: esEquipos? 1 : cantidad };
        onAddEvent?.(newEvent as unknown as SendEvent); setEnviar(true);
      }
      onClose();
    } catch (err: any) { Swal.fire({ icon: 'error', title: 'Error', text: err.message }); }
  };
  const handleDelete = async () => {
    const emailPrestamo = (objselected?.email || '').toLowerCase();
    if (emailPrestamo !== emailUsuario) return alert.noAutorizado();

    const esSerie = objselected?.recurrencia && objselected?.recurrencia !== 'none' && objselected?.serie_id;
    const esEquipo = aulaSel?.title?.toLowerCase().includes('equipo') || 
                    objselected?.title?.toLowerCase().includes('equipo');

    let opcion = 'uno';

    // 1️⃣ Pregunta principal
    if (esSerie) {
      const res = await alert.confirmarSerie();
      if (!res.isConfirmed && !res.isDenied) return;
      opcion = res.isDenied ? 'serie' : 'uno';
    } else {
      const res = await alert.confirmarEliminar(esEquipo as any, dependenciaActual?.sede || '');
      if (!res.isConfirmed) return;
    }

    try {
      if (opcion === 'serie') {
        const payload ={   serie_id: objselected?.serie_id, 
          id: (eventData as any).id,
          dependencia_id: selectedDependencia,
        }
        console.log('Eliminando serie ID:', objselected?.serie_id, 'con payload:', payload);
    
        await deletePrestamo({ 
          serie_id: objselected?.serie_id, 
          id: (eventData as any).id,
          dependencia_id: selectedDependencia,
          modo: 'serie'
        } as any);
        
        onRemoveEvent?.({ 
          ...eventData, 
          deleteSerie: true, 
          serie_id: objselected?.serie_id 
        } as any);
      } else {
        console.log('Eliminando préstamo ID:', (eventData as any).id);
        await deletePrestamo({ 
          id: (eventData as any).id,
          dependencia_id: selectedDependencia ,
          modo: 'uno'
        } as any);
        
        onRemoveEvent?.(eventData as SendEvent);
      }
      
      setEnviar(true);
      alert.success(esEquipo ? 'Devuelto' : 'Eliminado');
      onClose();
      
    } catch (err: any) { 
      alert.error('Error', err.message); 
    }
  };

  const diaSemana = useMemo(() => start? new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(start) : 'miércoles', [start]);
  const diaMes = start?.getDate()?? 13;
  const mesNombre = useMemo(() => start? new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(start) : 'mayo', [start]);

  const tabletsFiltradas = useMemo(() =>
    inventario?.filter(t => String(t.opcion_id) === String(selectedChild) && String(t.dependencia_id || 1) === selectedDependencia),
    [inventario, selectedChild, selectedDependencia]
  );

  const dependenciaActual = dependencias.find(d => String(d.id) === selectedDependencia)
    || { id: 2, nombre: 'Centro Recursos Bibliográficos', sede: 'Aguachica', ciudad: 'Aguachica' };


    //console.log('selectedAula:', selectedAula);
    //console.log('aulasFiltradas actual:', aulasFiltradas.find(a => String(a.id) === String(selectedAula))?.children?.map(c => ({ id: c.id, title: c.title, className: c.className })) || []);
    //console.log('childrenAula actual:', childrenAula?.map(c => ({ id: c.id, title: c.title, className: c.className })));
 
  return (
    <Modal show={isOpen} onHide={onClose} backdrop="static" centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{isEditable? 'Editar Préstamo' : 'Nuevo Préstamo'} {dependenciaActual && <Badge bg="info" className="ms-2">{dependenciaActual.sede}</Badge>}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {/* SELECTOR DE DEPENDENCIA */}
          <Form.Group className="mb-3">
        <Form.Label><i className="mdi mdi-office-building me-1"></i>Sede</Form.Label>
        <Form.Control
          type="text"
          readOnly
          value={`${dependencias.find(d => String(d.id) === dependenciaUsuario)?.nombre || ''} - ${dependencias.find(d => String(d.id) === dependenciaUsuario)?.sede || ''}`}
        />
        <Form.Text className="text-muted">Solo puedes reservar en tu sede asignada</Form.Text>
      </Form.Group>

          <Row>
            <Col md={6}>
  <Form.Group className="mb-2">
    <Form.Label>Servicio</Form.Label>
    <Form.Select 
      value={selectedAula} 
      onChange={(e) => setSelectedAula(e.target.value)} 
      required
    >
      <option value="">Seleccione</option>
      {aulasFiltradas?.map((a) => (
        <option key={a.id} value={String(a.id)}>
           {a.titleDisplay}
        </option>
      ))}
    </Form.Select>
  </Form.Group>
</Col>
<Col md={6}>
  <Form.Group className="mb-3">
    <Form.Label>Opción</Form.Label>
<Form.Select
  value={selectedChild}
  onChange={(e) => setSelectedChild(e.target.value)}
  disabled={!childrenAula.length}
>
  <option value="">{childrenAula.length? 'Seleccione' : 'Sin opciones'}</option>
  {childrenAula.map((c) => (
    <option key={c.id} value={String(c.id)}>
      {c.title}
    </option>
  ))}
</Form.Select>
  </Form.Group>
</Col>
          </Row>

          {esTablets && (
            <Form.Group className="mb-3">
              <Form.Label>Tablets disponibles en {dependenciaActual?.sede} ({tabletsFiltradas?.filter(t=>t.estado==='Disponible').length})</Form.Label>
              <div style={{maxHeight:220, overflow:'auto'}} className="border rounded">
                <table className="table table-sm table-hover mb-0">
                  <thead className="table-light sticky-top"><tr><th style={{width:40}}></th><th>Serial</th><th>Modelo</th><th>Estado</th></tr></thead>
                  <tbody>{tabletsFiltradas?.map(t => (<tr key={t.id} className={t.estado!=='Disponible'? 'text-muted' : ''}><td><Form.Check type="radio" name="tablet" disabled={t.estado!== 'Disponible'} checked={tabletSel?.id === t.id} onChange={() => { setTabletSel(t); setObservacionesValue(`Tablet asignada: ${t.serial} - ${t.modelo} (${t.marca}) - ${dependenciaActual?.sede}`); }} /></td><td><code>{t.serial}</code></td><td>{t.modelo}</td><td><span className={`badge bg-${t.estado==='Disponible'?'success':'warning'}`}>{t.estado}</span></td></tr>))}</tbody>
                </table>
              </div>
            </Form.Group>
          )}

          <Row>
            <Col sm={6}><Form.Label>Inicio</Form.Label><CustomDatePicker value={start} onChange={setStart} showTimeSelect timeFormat="HH:mm" dateFormat="yyyy-MM-dd HH:mm" minDate={new Date()} /></Col>
            <Col sm={6}><Form.Label>Fin</Form.Label><CustomDatePicker value={end} onChange={setEnd} showTimeSelect timeFormat="HH:mm" dateFormat="yyyy-MM-dd HH:mm" minDate={start?? new Date()} /></Col>
          </Row>

          <Form.Group className="mt-3 mb-3"><Form.Label>Observaciones</Form.Label><Form.Control as="textarea" rows={2} name="observaciones" required value={observacionesValue} onChange={e => setObservacionesValue(e.target.value)} /></Form.Group>
          <Form.Group className="mb-3 bg-light p-2 border rounded">
            <Form.Label>Repetición</Form.Label>
            <Form.Select name="recurrencia" value={recurrencia} onChange={(e) => setRecurrencia(e.target.value)}>
              <option value="none">No se repite</option>
              <option value="daily">Todos los días</option>
              <option value="weekly">Cada semana, el {diaSemana}</option>
              <option value="monthly_2nd_wed">Todos los meses, el segundo {diaSemana}</option>
              <option value="yearly">Anualmente, el {diaMes} de {mesNombre}</option>
              <option value="weekdays">Todos los días hábiles (lunes a viernes)</option>
            </Form.Select>
          </Form.Group>
          <div className="d-flex justify-content-between">
           <div>
                {isEditable && (
                  <Button 
                    variant={esEquipos ? "outline-success" : "outline-danger"} 
                    onClick={handleDelete} 
                    disabled={apiLoading}
                  >
                    <i className={`mdi ${esEquipos ? 'mdi-keyboard-return' : 'mdi-delete'} me-1`}></i>
                    {esEquipos ? 'Devolver' : 'Eliminar'}
                  </Button>
                )}
            </div>
            <div>
              <Button variant="secondary" onClick={onClose} className="me-2">Cancelar</Button>
              <Button type="submit" variant="success" disabled={apiLoading}>{apiLoading? <Spinner size="sm" /> : 'Guardar'}</Button>
            </div>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddEditEvent;