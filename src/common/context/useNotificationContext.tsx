import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import { ReactNode, createContext, useContext, useState } from 'react';

const NotificationContext = createContext<any>({});

type ToastrProps = {
	show: boolean;
	title?: string;
	message: string;
	variant?: string;
	delay?: number;
	onClose?: () => void;
};

type TypeVariant = {
	type: 'error' | 'info' | 'success' | 'default';
};

function Toastr({ show, title, message, onClose, variant = 'light', delay = 5000 }: ToastrProps) {
	return (
		<ToastContainer className="p-3" position="top-end">
			<Toast bg={variant.toLowerCase()} delay={delay} show={show} onClose={onClose} autohide>
				{title && (
					<Toast.Header className={`text-${variant}`}>
						<strong className="me-auto">{title}</strong>
					</Toast.Header>
				)}
				<Toast.Body className={['dark', 'danger'].includes(variant) ? 'text-white' : ''}>
					{message}
				</Toast.Body>
			</Toast>
		</ToastContainer>
	);
}

export function useNotificationContext() {
	const context = useContext(NotificationContext);
	if (context === undefined) {
		throw new Error('useNotificationContext must be used within an NotificationProvider');
	}
	return context;
}

const notificationTypes = {
	error: 'danger',
	info: 'info',
	success: 'success',
	default: 'light',
};

export function NotificationProvider({ children }: { children: ReactNode }) {
	const [config, setConfig] = useState<ToastrProps>({
		show: false,
		message: '',
		title: '',
	});

	const hideNotification = () => {
		setConfig({ show: false, message: '', title: '' });
	};
	const showNotification = ({ title, message, type }: TypeVariant & ToastrProps) => {
		setConfig({
			show: true,
			title,
			message,
			variant: notificationTypes[type] ?? 'light',
			onClose: hideNotification,
		});
	};

	return (
		<NotificationContext.Provider value={{ showNotification }}>
			<Toastr {...config} />
			{children}
		</NotificationContext.Provider>
	);
}
