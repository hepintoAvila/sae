import { Form } from 'react-bootstrap';
import { Control, Controller, RegisterOptions } from 'react-hook-form';

type ColorInputProps = {
	type?: 'color';
	id?: string;
	name: string;
	className?: string;
	containerClass?: string;
	label?: string;
	helpText?: string;
	readOnly?: boolean;
	disabled?: boolean;
	placeholder?: string;
	errors?: any;
	control?: Control<any>;
	register?: RegisterOptions;
};

export default function ColorInput({
	type = 'color',
	name,
	id,
	control,
	className,
	containerClass,
	label,
	placeholder,
	helpText,
	errors,
	register,
	...props
}: ColorInputProps) {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState }) => (
				<Form.Group className={containerClass ?? ''}>
					{label && <Form.Label>{label}</Form.Label>}
					<Form.Control
						type={type}
						id={id}
						{...props}
						{...field}
						value={field.value ?? ''}
						onChange={(e) => {
							field.onChange(e.target.value);
						}}
						placeholder={placeholder}
						className={className}
						isInvalid={Boolean(fieldState.error?.message)}
					/>
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
}
