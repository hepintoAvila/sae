// CalendarApp.tsx
import { Row, Col, Card, Button, Badge, Form } from 'react-bootstrap';
import '@fullcalendar/react';
import FullCalendarWidget from './FullCalendarWidget';
import AddEditEvent from './AddEditEvent';
import { useCalendar } from './hooks';
import SidePanel from './SidePanel';
import LoginRequiredModal from './LoginRequiredModal';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import { useAulasContext } from '@/common/context/useAulasContext';
import { Prestamo } from '@/types/aulas';
import Swal from 'sweetalert2';
import { useSessionContext } from '@/common/context/SessionContext';
import { DateClickArg } from '@fullcalendar/interaction/index.js';

i18n.use(initReactI18next).init({
  resources: { en: { translation: { "Solicitar Aula": "Solicitar Aula" } }, es: { translation: { "Solicitar Aula": "Solicitar Aula" } } },
  lng: "es", fallbackLng: "en", interpolation: { escapeValue: true }
});

const CalendarApp = () => {
  const { resetTimers } = useSessionContext();
    // Llamamos a resetTimers cada vez que el usuario interactúa con el dashboard


  const { aulas, prestamos, inventario, dependencias, refetchInitialData } = useAulasContext();
  const { isOpen, onCloseModal, isEditable, eventData, events, onDateClick, onEventClick, onDrop, onEventDrop, onUpdateEvent, onRemoveEvent, onAddEvent, getCurrentLoginPath } = useCalendar();

  const userDatos = JSON.parse(localStorage.getItem('userData') || '{}');
  const emailUsuario = (userDatos?.Email || userDatos?.email || '').toLowerCase();
  const dependenciaUsuario = String(userDatos?.dependencia_id || '99');
  const currentLoginPath = getCurrentLoginPath();

  const [enviar, setEnviar] = useState(false);
  const [prestamosActuales, setPrestamosActuales] = useState<any[]>(prestamos || []);

  // FILTROS
  const [filtroServicio, setFiltroServicio] = useState<string>('todos');
  const [filtroOpcion, setFiltroOpcion] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');
  const [dependenciaId, setDependenciaId] = useState<string>(dependenciaUsuario);

  useEffect(() => { setPrestamosActuales(prestamos || []); }, [prestamos]);
  useEffect(() => { setDependenciaId(dependenciaUsuario); }, [dependenciaUsuario]);

  const aulasFiltradasPorDep = useMemo(() => {
    if (dependenciaId === '99' || dependenciaId === 'todos') return aulas;
    return aulas.filter(a => String(a.dependencia_id) === dependenciaId);
  }, [aulas, dependenciaId]);

  const opcionesDisponibles = useMemo(() => {
    if (filtroServicio === 'todos') return [];
    const aula = aulasFiltradasPorDep.find(a => String(a.id) === filtroServicio);
    return aula?.children || [];
  }, [filtroServicio, aulasFiltradasPorDep]);

  const eventosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();

    return prestamosActuales.filter((p: any) => {
      // 0. DEPENDENCIA
      if (dependenciaId!== '99' && dependenciaId!== 'todos' && String(p.dependencia_id)!== dependenciaId) {
        return false;
      }

      // 1. SERVICIO
      if (filtroServicio!== 'todos') {
        const aulaFiltro = aulasFiltradasPorDep.find(a => String(a.id) === filtroServicio);
        const coincide = String(p.title) === filtroServicio ||
                        p.title === aulaFiltro?.title ||
                        String(p.childId? aulasFiltradasPorDep.find(a=>a.children?.some(c=>String(c.id)===String(p.childId)))?.id : '') === filtroServicio;
        if (!coincide) return false;
      }

      // 2. OPCIÓN
      if (filtroOpcion!== 'todos' && String(p.childId)!== filtroOpcion) {
        return false;
      }

      // 3. ESTADO
      if (filtroEstado!== 'todos') {
        const estadoReal = p.statut || 'Activo';
        if (estadoReal!== filtroEstado) return false;
      }

      // 4. BÚSQUEDA MEJORADA
      if (q) {
        const email = (p.email || p.usuario || '').toLowerCase();
        const obs = (p.observaciones || '').toLowerCase();
        const titulo = (p.title || '').toLowerCase();
        const nombreAula = aulas.find(a => String(a.id) === String(p.title))?.title?.toLowerCase() || '';

        // Busca por inicio de email (más rápido) O contiene en otros campos
        const coincide = email.startsWith(q) ||
                        email.includes(q) ||
                        obs.includes(q) ||
                        titulo.includes(q) ||
                        nombreAula.includes(q);
        if (!coincide) return false;
      }

      return true;
    });
  }, [prestamosActuales, filtroServicio, filtroOpcion, filtroEstado, busqueda, dependenciaId, aulas, aulasFiltradasPorDep]);

  // guardar filtros
  useEffect(() => {
    const saved = localStorage.getItem('filtroPrestamos');
    if (saved) {
      const { servicio, opcion, estado, dep } = JSON.parse(saved);
      setFiltroServicio(servicio || 'todos');
      setFiltroOpcion(opcion || 'todos');
      setFiltroEstado(estado || 'todos');
      if (dep) setDependenciaId(dep);
    }
  }, []);

  useEffect(() => {
     resetTimers();
    localStorage.setItem('filtroPrestamos', JSON.stringify({
      servicio: filtroServicio,
      opcion: filtroOpcion,
      estado: filtroEstado,
      dep: dependenciaId
    }));
  }, [filtroServicio, filtroOpcion, filtroEstado, dependenciaId]);

  useEffect(() => {
    const isLoginRoute = window.location.hash === '#/account/login';
    if (!isLoginRoute) return;
    const interval = setInterval(() => refetchInitialData(), 5000);
    return () => clearInterval(interval);
  }, [refetchInitialData]);

  useEffect(() => {
    const isDashboardRoute = window.location.hash === '#/dashboard/prestamos';
    if (!isDashboardRoute ||!enviar) return;
    const actualizar = async () => {
      await refetchInitialData();
      setPrestamosActuales(prev => {
        const combinados = [...(prestamos || []),...(events || [])];
        return Array.from(new Map(combinados.map(p => [String(p.id), p])).values());
      });
      setEnviar(false);
    };
    actualizar();
  }, [enviar, refetchInitialData, events, prestamos]);

  const handleEventClick = (info: any) => {
    const emailEvento = (info.event.extendedProps?.email || '').toLowerCase();
    if (emailEvento && emailEvento!== emailUsuario &&!['Admin','Super','Administrador'].includes(userDatos.Rol)) {
      Swal.fire({ icon: 'warning', title: 'Restringido', text: 'Solo puedes abrir tus préstamos.' });
      return;
    }
    onEventClick(info);
  };

  const shouldShowAddEditModal = isOpen && currentLoginPath!== '/account/login';

  return (
    <>
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Row className="mb-3 g-2 align-items-end bg-light p-3 rounded">
                <Col md={2}>
                  <Form.Label className="small mb-1">Dependencia</Form.Label>
                  <Form.Select size="sm" value={dependenciaId} onChange={e => { setDependenciaId(e.target.value); setFiltroServicio('todos'); }}>
                    <option value="99">Todas ({dependencias?.length || 0})</option>
                    {dependencias?.map(d => (
                      <option key={d.id} value={String(d.id)}>{d.nombre} - {d.sede}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Label className="small mb-1">Servicio</Form.Label>
                  <Form.Select size="sm" value={filtroServicio} onChange={e => { setFiltroServicio(e.target.value); setFiltroOpcion('todos'); }}>
                    <option value="todos">Todos ({aulasFiltradasPorDep.length})</option>
                    {aulasFiltradasPorDep.map(a => <option key={a.id} value={String(a.id)}>{a.title}</option>)}
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Label className="small mb-1">Opción</Form.Label>
                  <Form.Select size="sm" value={filtroOpcion} onChange={e => setFiltroOpcion(e.target.value)} disabled={filtroServicio === 'todos'}>
                    <option value="todos">Todas</option>
                    {opcionesDisponibles.map(o => <option key={o.id} value={String(o.id)}>{o.title}</option>)}
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Label className="small mb-1">Estado</Form.Label>
                  <Form.Select size="sm" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
                    <option value="todos">Todos</option>
                    <option value="Activo">Activos</option>
                    <option value="Devuelto">Devueltos</option>
                    <option value="Finalizado">Finalizados</option>
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Label className="small mb-1">Buscar</Form.Label>
                  <Form.Control
                    size="sm"
                    type="search"
                    placeholder="email, observación o servicio..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                  />
                </Col>
                <Col md={1} className="text-end">
                  <Badge bg={eventosFiltrados.length? "primary" : "secondary"}>{eventosFiltrados.length}</Badge>
                  <Button size="sm" variant="link" className="p-0 ms-2" onClick={() => { setFiltroServicio('todos'); setFiltroOpcion('todos'); setFiltroEstado('todos'); setBusqueda(''); setDependenciaId(dependenciaUsuario); }}>Limpiar</Button>
                </Col>
              </Row>

              <FullCalendarWidget
                onDateClick={(info: DateClickArg) => { resetTimers(); onDateClick(info); }}
                onEventClick={handleEventClick} // ya tipado
                onDrop={(info) => { resetTimers(); onDrop(info); }}
                onEventDrop={(info) => { resetTimers(); onEventDrop(info); }}
                events={eventosFiltrados}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} className="d-none"><SidePanel aulas={aulas as any} /></Col>
      </Row>

      {shouldShowAddEditModal? (
        <AddEditEvent
          isOpen={isOpen}
          setEnviar={setEnviar}
          onClose={onCloseModal}
          isEditable={isEditable}
          eventData={eventData as Prestamo}
          onUpdateEvent={onUpdateEvent as any}
          onRemoveEvent={onRemoveEvent as any}
          onAddEvent={onAddEvent as any}
          aulas={aulasFiltradasPorDep as any}
          aulasOriginales={aulas as any}
          inventario={inventario as any}
          prestamos={prestamosActuales}
          dependencias={dependencias as any}
        />
      ) : <LoginRequiredModal show={isOpen} onHide={onCloseModal} />}
    </>
  );
};
export { CalendarApp };