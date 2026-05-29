import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import classNames from 'classnames';
import 'react-datepicker/dist/react-datepicker.min.css';
type DatepickerInputProps = {
	onClick?: () => void;
	value?: string;
	inputClass: string;
	children?: React.ReactNode;
};
/* Datepicker with Input */
const DatepickerInput = forwardRef<HTMLInputElement, DatepickerInputProps>((props, ref) => {
	const onDateValueChange = () => {
		// Esto se ejecuta cuando el input cambia directamente, pero DatePicker maneja el cambio de fecha.
		// Podrías añadir lógica si necesitas manejar la entrada manual de texto aquí.
		console.log('date value changed');
	};
	return (
		<input
			type="text"
			className={classNames("form-control date", props.inputClass)} // Asegúrate de aplicar inputClass aquí también
			onClick={props.onClick}
			value={props.value}
			onChange={onDateValueChange}
			ref={ref}
		/>
	);
});
/* Datepicker with Addon Input */
const DatepickerInputWithAddon = forwardRef<HTMLInputElement, DatepickerInputProps>(
	(props, ref) => (
		<div className="input-group" ref={ref}>
			<input
				type="text"
				className={classNames("form-control form-control-light", props.inputClass)} // Asegúrate de aplicar inputClass aquí
				onClick={props.onClick}
				value={props.value}
				readOnly
			/>
			<div className="input-group-append">
				<span className="input-group-text bg-primary border-primary text-white">
					<i className="mdi mdi-calendar-range font-13"></i>
				</span>
			</div>
		</div>
	)
);
type HyperDatepickerProps = {
	value: Date | null; // <-- Cambiado a Date | null
	onChange: (date: Date | null) => void; // <-- Cambiado a Date | null
	hideAddon?: boolean;
	inputClass?: string;
	dateFormat?: string;
	name?: string;
	title?: string;
	minDate?: Date;
	maxDate?: Date;
	className?: string;
	showTimeSelect?: boolean;
	tI?: number;
	timeFormat?: string;
	timeCaption?: string;
	showTimeSelectOnly?: boolean;
	monthsShown?: number;
	inline?: boolean;
};
const CustomDatePicker = (props: HyperDatepickerProps) => {
	// handle custom input
	// **AQUÍ ESTÁ EL CAMBIO CLAVE:**
	const inputValue = props.value instanceof Date && !isNaN(props.value.getTime())
		? props.value.toDateString()
		: '';
	const input =
		(props.hideAddon || false) === true ? (
			<DatepickerInput
				inputClass={props.inputClass ?? ''}
				value={inputValue}
			/>
		) : (
			<DatepickerInputWithAddon
				inputClass={props.inputClass ?? ''}
				value={inputValue}
			/>
		);
	return (
		<>
			{/* date picker control */}
			<DatePicker
				customInput={input}
				timeIntervals={props.tI}
				name={props.name}
				title={props.title}
				// className={classNames('form-control', props.inputClass)} // Esto ya no es necesario si customInput maneja las clases. Podría duplicarlas.
				selected={props.value}
				onChange={(date: Date | null) => props.onChange(date)} // <-- Asegura que el tipo coincida
				showTimeSelect={props.showTimeSelect}
				timeFormat={props.timeFormat || 'hh:mm a'}
				timeCaption={props.timeCaption}
				dateFormat={props.dateFormat || 'MM/dd/yyyy'}
				minDate={props.minDate}
				maxDate={props.maxDate}
				monthsShown={props.monthsShown}
				showTimeSelectOnly={props.showTimeSelectOnly}
				inline={props.inline}
				autoComplete="off"
			/>
		</>
	);
};
export default CustomDatePicker;