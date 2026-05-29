import FullCalendar from '@fullcalendar/react';
import { EventClickArg, EventDropArg, DateSelectArg, EventMountArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg, DropArg } from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import BootstrapTheme from '@fullcalendar/bootstrap';
import esLocale from '@fullcalendar/core/locales/es';

type FullCalendarWidgetProps = {
  onDateClick: (value: DateClickArg) => void;
  onEventClick: (value: EventClickArg) => void;
  onEventDrop: (value: EventDropArg) => void;
  onDrop: (value: DropArg) => void;
  events: Array<any>;
};

const FullCalendarWidget = ({ onDateClick, onEventClick, onDrop, onEventDrop, events }: FullCalendarWidgetProps) => {

  // Mapea servicio a ícono/emoji y color
  const getServicioIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('equipo') || t.includes('tablet')) return { emoji: '💻', bg: '#0ea5e9', label: 'Equipos' };
    if (t.includes('salon') || t.includes('aula 1') || t.includes('a-1')) return { emoji: '🏫', bg: '#8b5cf6', label: 'Salón 1' };
    if (t.includes('aula 2') || t.includes('a-2')) return { emoji: '📚', bg: '#ec4899', label: 'Salón 2' };
    if (t.includes('aula 3') || t.includes('a-3')) return { emoji: '🎓', bg: '#10b981', label: 'Salón 3' };
    if (t.includes('aula 4') || t.includes('a-4')) return { emoji: '✏️', bg: '#f59e0b', label: 'Salón 4' };
    if (t.includes('auditorio')) return { emoji: '🎤', bg: '#ef4444', label: 'Auditorio' };
    return { emoji: '📅', bg: '#6b7280', label: 'Aula' };
  };

  const handleEventMount = (info: EventMountArg) => {
    const start = info.event.start ? new Date(info.event.start) : null;
    const end = info.event.end ? new Date(info.event.end) : null;
    const fecha = start ? start.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
    const hora = start && end ? `${start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}` : '';
    const props = info.event.extendedProps;
    
    const tooltipHtml = `
      <div style="text-align: left; min-width: 220px;">
        <strong style="font-size: 13px; color: #0d6efd;">${info.event.title}</strong><br/>
        <div style="margin: 6px 0; padding: 6px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee;">
          <div>📅 ${fecha}</div><div>🕐 ${hora}</div>
        </div>
        ${props.observaciones ? `<div>📝 <em>${props.observaciones}</em></div>` : ''}
        ${props.email ? `<div>👤 ${props.email}</div>` : ''}
        ${props.equipo_id ? `<div>💻 Equipo #${props.equipo_id}</div>` : ''}
      </div>
    `;

    if ((window as any).bootstrap) {
      new (window as any).bootstrap.Tooltip(info.el, { title: tooltipHtml, html: true, placement: 'top', container: 'body', trigger: 'hover' });
    }
  };

  return (
    <div id="calendar">
      <FullCalendar
        locale={esLocale}
        initialView="dayGridMonth"
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin, BootstrapTheme]}
        handleWindowResize={true}
        themeSystem="bootstrap"
        buttonText={{ today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día', list: 'Lista', prev: 'Ant', next: 'Sig' }}
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth' }}
        editable={true}
        selectable={true}
        droppable={true}
        events={events}
        dateClick={onDateClick}
        eventClick={onEventClick}
        drop={onDrop}
        eventDrop={onEventDrop}
        eventDidMount={handleEventMount}
        select={(arg: DateSelectArg) => console.log('Rango:', arg)}
        eventContent={(arg) => {
          const start = arg.event.start ? new Date(arg.event.start) : null;
          const end = arg.event.end ? new Date(arg.event.end) : null;
          const hora = start ? start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';
          const horaFin = end ? end.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';
          const obs = arg.event.extendedProps?.observaciones || '';
          const email = arg.event.extendedProps?.email || '';
          const statut = arg.event.extendedProps?.statut || 'Activo';
          const servicio = getServicioIcon(arg.event.title);
          
          const colorEstado = statut === 'Activo' ? '#10b981' : '#6b7280';
          const bgColor = arg.event.backgroundColor || servicio.bg;

          return {
            html: `
              <div style="padding: 0; height: 100%; overflow: hidden; position: relative;">
                <!-- LOGO CIRCULAR SUPERIOR -->
                <div style="display: flex; align-items: center; gap: 6px; padding: 5px 7px 3px; background: ${bgColor}; border-radius: 4px 4px 0 0;">
                  <div style="width: 20px; height: 20px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; font-size: 11px; box-shadow: 0 1px 3px rgba(0,0,0,0.2); flex-shrink: 0;">
                    ${servicio.emoji}
                  </div>
                  <div style="font-weight: 700; font-size: 10px; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-transform: uppercase; letter-spacing: 0.3px;">
                    ${arg.event.title}
                  </div>
                </div>
                
                <!-- CONTENIDO -->
                <div style="padding: 5px 7px; background: linear-gradient(180deg, ${bgColor}12, transparent); border-left: 3px solid ${colorEstado};">
                  <div style="display: flex; align-items: center; gap: 4px; font-size: 10px; color: #ffffff; margin-bottom: 2px;">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span style="font-weight: 500;">${hora}${horaFin ? ` - ${horaFin}` : ''}</span>
                  </div>
                  ${obs ? `<div style="font-size: 9px; color: #fafbff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.2;">${obs}</div>` : ''}
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 3px;">
                    <span style="font-size: 8px; color: #ffffff; max-width: 65%; overflow: hidden; text-overflow: ellipsis;">${email.split('@')[0] || ''}</span>
                    <span style="width: 6px; height: 6px; border-radius: 50%; background: ${colorEstado}; flex-shrink: 0;"></span>
                  </div>
                </div>
              </div>
            `,
          };
        }}
      />
    </div>
  );
};

export default FullCalendarWidget;