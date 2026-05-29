// useCalendar.ts
import { useEffect, useState, useCallback } from 'react'; // Agregamos useCallback
import { DateClickArg, Draggable, DropArg } from '@fullcalendar/interaction';
import { DateInput, EventClickArg, EventDropArg } from '@fullcalendar/core';
import { useToggle } from '@/hooks';
import { Event } from '../types';
import { useAulasContext } from '@/common/context/useAulasContext'; 
//import { co } from 'node_modules/@fullcalendar/core/internal-common';
import { SendEvent } from '../type';
import useAulas from '@/hooks/useAulas';
import Swal from 'sweetalert2';
export default function useCalendar() {
	/*
	 * modal handling
	 */
 const toMysqlFormat = (fecha: string | Date): string => {
  if (!fecha) return '';

  // Si ya es Date, úsalo directo
  const d = fecha instanceof Date ? fecha : new Date(fecha);

  // Si la fecha es inválida, devuelve el original como string
  if (isNaN(d.getTime())) {
    return typeof fecha === 'string' ? fecha : '';
  }

  // Convierte a hora de Bogotá (tu BD guarda local)
  const colombiaStr = d.toLocaleString('en-US', { 
    timeZone: 'America/Bogota',
    hour12: false 
  });
  const colombia = new Date(colombiaStr);

  const pad = (n: number, z = 2) => String(n).padStart(z, '0');
  
  return `${colombia.getFullYear()}-${pad(colombia.getMonth()+1)}-${pad(colombia.getDate())} ` +
         `${pad(colombia.getHours())}:${pad(colombia.getMinutes())}:${pad(colombia.getSeconds())}.${pad(colombia.getMilliseconds(),3)}`;
};

const estandarizarEventos = (eventos: any[]) => {
  return eventos.map(ev => ({
  ...ev,
    start: toMysqlFormat(ev.start), // ahora acepta string o Date
    end: toMysqlFormat(ev.end),
    childId: String(ev.childId?? ev.finalChildId?? '0'),
  }));
};

// USO

	const { aulas,prestamos} = useAulasContext();
	const { sendAulasRequest} = useAulas();
	const [isOpen, _toggle, show, hide] = useToggle();
    const [showLoginPrompt, setShowLoginPrompt] = useState(false); // Nuevo estado para el modal de login
    const onOpenLoginPrompt = useCallback(() => setShowLoginPrompt(true), []);
    const onCloseLoginPrompt = useCallback(() => setShowLoginPrompt(false), []);
	
	const onCloseModal = () => {
		hide();
		setEventData({});
		setDateInfo({} as DateClickArg);
	};

	const onOpenModal = () => show();
	const [isEditable, setIsEditable] = useState<boolean>(false);
	/*
	 * event data
	 */
	const [events, setEvents] = useState<any[]>([...prestamos.map((p) => ({
		id: String(p.id),
		title: String(p.title),
		start: p.start,
		end: p.end,
		observaciones: p.observaciones,
		childId: p.childId,
		className: aulas.find((a) => String(a.id) === String(p.className))?.className || 'white-text',
		textClass: aulas.find((a) => String(a.id) === String(p.textClass))?.textClass || 'white-text',
	}))]);
	const [eventData, setEventData] = useState<any>({});
	const [dateInfo, setDateInfo] = useState<DateClickArg>({} as DateClickArg);
	useEffect(() => {
		// create dragable events
		let draggableEl = document.getElementById('external-events');
		new Draggable(draggableEl!, {
			itemSelector: '.external-event',
		});
	}, []);
	/*
		calendar events
		*/
	// on date click
	const onDateClick = (arg: DateClickArg) => {
		//console.log('onDateClick - fecha:', arg);
		const event = {
			title: '',
			start: arg.date,
			end: arg.date,
			observaciones: '',
			email: '',
			childId: '',
		};
		setEventData(event);
		setDateInfo(arg);
		onOpenModal();
		setIsEditable(false);
	};
	// on event click
	const onEventClick = (arg: EventClickArg) => {
		const userDatos = JSON.parse(localStorage.getItem('userData') || '{}');
		const emailUsuario = (userDatos?.Email || userDatos?.email || '').toLowerCase();

		const event = {
			id: String(arg.event.id),
			title: arg.event.title,
			className: arg.event.classNames[0],
			start: arg.event.start,
			end: arg.event.end,
			observaciones: arg.event.extendedProps.observaciones,
			email: arg.event.extendedProps.email,
			childId: arg.event.extendedProps.childId,
		};

		const emailPrestamo = (event?.email || '').toLowerCase();
		if (emailPrestamo && emailPrestamo!== emailUsuario) { Swal.fire({ icon: 'error', title: 'No autorizado' }); return; }		
		///console.log('onEventClick - event:', event);
		setEventData(event);
		onOpenModal();
		setIsEditable(true);
	};
	// on drop
	const onDrop = (arg: DropArg) => {
		const dropEventData = arg;


		const title = dropEventData.draggedEl.title;
		if (title == null) {
		} else {
			let newEvent = {
				id: String(events.length + 1),
				title: title,
				start: dropEventData? dropEventData.dateStr : new Date(),
				className: dropEventData.draggedEl.attributes.getNamedItem('data-class')?.value,
			};
			const modifiedEvents = [...events];
			modifiedEvents.push(newEvent);
			setEvents(modifiedEvents);
		}
	};
	// on add event
const onAddEvent = (data: SendEvent) => {
    const aulaEncontrada = aulas?.find((e: any) =>
        String(e.id) === String(data.title) || e.title === data.title
    );
    const children = aulaEncontrada?.children?? [];
    // Buscar el child específico por ID
    const selectedChild = children.find((child: any) =>
        String(child.id) === String(data?.childId)
    );

    // Si no hay data.childId o no lo encuentra, usa el primero como fallback
    const childId = selectedChild?.id?? children[0]?.id?? '';

    let modifiedEvents = [...events];
	const finalChildId = childId? childId : '0'
    const event = {
        id: String(modifiedEvents.length + 1),
        title: aulaEncontrada?.title || data.title,
        start: Object.keys(dateInfo).length!== 0? data.start : new Date(),
        end: Object.keys(dateInfo).length!== 0? data.end : new Date(),
        observaciones: data.observaciones || null,
    	textClass: aulaEncontrada?.textClass || 'white-text',
        className: aulaEncontrada?.className,
        email: data.email || '',
        finalChildId, // aquí ya tienes el id correcto
    };
    //console.log('useCalendar - event:', event);
	sendAulasRequest(event as any); // Enviar el evento al servicio de aulas;			

    modifiedEvents = [...modifiedEvents, event];
	const eventosNormalizados = estandarizarEventos(modifiedEvents);

	 /*	
	const eventosColombia = modifiedEvents.map(ev => ({
		...ev,
			start: parseToColombia(ev.start as any),
			end: parseToColombia(ev.end as any),
			childId: String((ev as any).childId?? '0'),
		}));
		*/
	setEvents(eventosNormalizados);
 
    //onCloseModal();
};
	// on update event
	const onUpdateEvent = (data: Event) => {
		const modifiedEvents = [...events];
		const idx = modifiedEvents.findIndex((e) => e['id'] === eventData.id);
		modifiedEvents[idx]['title'] = data.title;
		modifiedEvents[idx]['className'] = data.className;
		setEvents(modifiedEvents);
		onCloseModal();
	};
	// on remove event
	const onRemoveEvent = () => {
		var modifiedEvents = [...events];
		const idx = modifiedEvents.findIndex((e) => e['id'] === eventData.id);
		modifiedEvents.splice(idx, 1);
		setEvents(modifiedEvents);
		onCloseModal();
	};
	// on event drop
	const onEventDrop = (arg: EventDropArg) => {
		
		const userDatos = JSON.parse(localStorage.getItem('userData') || '{}');
		const emailUsuario = (userDatos?.Email || userDatos?.email || '').toLowerCase();
		const emailEvento = (arg.event.extendedProps?.email || '').toLowerCase();
		// valida ANTES de actualizar
		if (emailEvento && emailEvento!== emailUsuario) {
			arg.revert(); // <-- devuelve el evento a su lugar original
			Swal.fire({ icon: 'error', title: 'No autorizado', text: 'No puedes mover préstamos de otros usuarios.' });
			return;
		}
		const modifiedEvents = [...events];
		const idx = modifiedEvents.findIndex((e) => e['id'] === String(arg.event.id!));
		 if (idx!== -1) {
		modifiedEvents[idx]['title'] = arg.event.title;
		modifiedEvents[idx]['className'] = arg.event.classNames;
		modifiedEvents[idx]['start'] = arg.event.start as DateInput;
		modifiedEvents[idx]['end'] = arg.event.end as DateInput;
		 }	
		setEvents(modifiedEvents);
		setIsEditable(false);
	};
	// Nueva función para obtener la dirección /account/login
    const getCurrentLoginPath = (): string | null => {
        const currentPath = window.location.hash.replace(/^#/, '');
		//console.log('Current login path:', currentPath);	
        if (currentPath === '/account/login') {
            return currentPath;
        }
        const match = currentPath.match(/\/account\/login(?:\/.*)?/);
        return match? match[0].split('?')[0] : null;
    };
  
	return {
		isOpen,
		onOpenModal,
		onCloseModal,
		isEditable,
		eventData,
		events,
		onDateClick,
		onEventClick,
		onDrop,
		onEventDrop,
		onUpdateEvent,
		onRemoveEvent,
		onAddEvent,
        getCurrentLoginPath,
        showLoginPrompt, // <-- Exponemos el nuevo estado
        onOpenLoginPrompt, // <-- Exponemos la función para abrir
        onCloseLoginPrompt, // <-- Exponemos la función para cerrar
	};
}