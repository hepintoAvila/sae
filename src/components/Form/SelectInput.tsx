import { ReactNode } from 'react';
import { Form } from 'react-bootstrap';
import { Control, Controller, RegisterOptions } from 'react-hook-form';

type FormSelectProps = {
	name: string;
	type?: 'select';
	id?: string;
	className?: string;
	containerClass?: string;
	label?: string;
	placeholder?: string;
	helpText?: string;
	multiple?: boolean;
	children: ReactNode;
	errors?: any;
	control?: Control<any>;
	register?: RegisterOptions;
};

const SelectInput = ({
	name,
	type = 'select',
	id,
	className,
	containerClass,
	label,
	placeholder,
	helpText,
	children,
	multiple,
	errors,
	control,
	register,
	...props
}: FormSelectProps) => {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState }) => (
				<Form.Group className={containerClass ?? ''}>
					{label && <Form.Label>{label}</Form.Label>}
					<Form.Select
						multiple={multiple}
						id={id}
						{...props}
						{...field}
						value={field.value ?? ''}
						onChange={(e) => {
							field.onChange(e.target.value);
						}}
						 
						className={className}
						isInvalid={Boolean(fieldState.error?.message)}
					>
						{children}
					</Form.Select>
					{helpText && (
						<Form.Text id={`${name}-help`} muted>
							{helpText}
						</Form.Text>
					)}
					{errors && errors[name] && (
						<Form.Control.Feedback type="invalid">
							{errors[name]['message']}
						</Form.Control.Feedback>
					)}
				</Form.Group>
			)}
		/>
	);
};

export default SelectInput;
