import { useNotificationContext } from '@/common/context';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import useAuth from '@/hooks/useAuth';

export const loginFormSchema = yup.object({
  login: yup
    .string()
    .required('El correo es obligatorio')
    .email('Formato de correo inválido')
    .test(
      'unicesar-domain',
      'Debe usar un correo @unicesar.edu.co',
      (value) => !!value && value.toLowerCase().endsWith('@unicesar.edu.co')
    ),
  password: yup
    .string()
    .required('La contraseña es obligatoria')
    .min(3, 'Mínimo 3 caracteres'),
});

export type LoginFormFields = yup.InferType<typeof loginFormSchema>;

export default function useLogin() {
	const [loading, setLoading] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();
 	const { isAuthenticated, loginUser,  } = useAuth();
	
	const { showNotification } = useNotificationContext();

	const redirectUrl = useMemo(
		() => (location.state && location.state.from ? location.state.from.pathname : '/'),
		[location.state]
	);

	const login = async (values: LoginFormFields) => {
		setLoading(true);
		try {
			const objet = {
				login: values.login,
				password: values.password,
			};
			// loginUser may return different shapes or undefined, so don't force AxiosResponse
			const res = await loginUser(objet);
			//console.log('res response:', res);
			// support token locations: res.data.token (Axios) or res.auth.token (custom)
			 
			const token = res?.Auth?.AppKey ?? res?.Auth?.AppKey;
			if (token) {
				//saveSession({ ...(res ?? {}), token });
				navigate(redirectUrl);
			} else {
				showNotification({ message: 'Invalid login response', type: 'error' });
			}
		 
		} catch (error: any) {
			showNotification({ message: error.toString(), type: 'error' });
		} finally {
			setLoading(false);
		}
	};

	return { loading, login, redirectUrl,isAuthenticated };
}


