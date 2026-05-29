import { useState } from 'react';
//import * as yup from 'yup';
import { EventInput } from '@fullcalendar/core';
 
import Swal from 'sweetalert2';
import { SendEvent } from '../type';
 
export default function useAddEditEvent(
	eventData: EventInput | undefined,
	isEditable: boolean,
	onUpdateEvent: (value: SendEvent) => void,
	onAddEvent: (value: SendEvent) => void,
) {
	// event state
	const [event] = useState<SendEvent>({
    id: String(eventData?.id || ''),
		title: eventData?.title || '',
		start: new Date(eventData?.start as Date || new Date()),
    end: new Date(eventData?.end as Date || new Date()),
		observaciones: eventData?.observaciones || '',
    className: Array.isArray(eventData?.className) ? eventData.className.join(' ') : eventData?.className || 'white-text',
    email: eventData?.email || '',
    childId: eventData?.childId || undefined,
    dependencia_id: (eventData as any)?.dependencia_id || '',
	});
const onSubmitEvent = (SendEvent: SendEvent) => {
//console.log('onSubmitEvent',SendEvent);



if (new Date(SendEvent.start as Date).getTime() > new Date(SendEvent.end as Date).getTime()) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'La fecha y hora inicial no puede ser mayor que la fecha y hora final',
    });
    return;
  }
if (SendEvent.observaciones.trim() === '') {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ingrese las observaciones',
    });
    return;
  }
  if (!SendEvent.start || !SendEvent.end) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'La fecha y hora inicial y final son requeridas',
    });
    return;
  }

  //console.log('SendEvent', isEditable);
  isEditable ? onUpdateEvent(SendEvent) : onAddEvent(SendEvent);
};
	return {
		event,
		onSubmitEvent,
	};
}
 
