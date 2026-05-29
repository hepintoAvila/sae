import { EventInput } from '@fullcalendar/core';

const defaultEvents: EventInput[] = [
	{
		id: '1',
		title: 'Interview - Backend Engineer',
		start: new Date(),
		className: 'bg-success',
	},
];

// external events
const externalEvents = [
	{
		id: 1,
		textClass: 'text-success',
		className: 'bg-success',
		title: 'New Theme Release',
	},
];

export { defaultEvents, externalEvents };
