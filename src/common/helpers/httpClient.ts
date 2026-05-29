// En HttpClient.ts
import axios from 'axios';
const ErrorCodeMessages: { [key: number]: string } = {
	401: 'Invalid credentials',
	403: 'Access Forbidden',
	404: 'Resource or page not found',
};
function HttpClient() {
	// Modificamos el _errorHandler para que devuelva un objeto estructurado
	const _errorHandler = (error: any) => {
		let errorMessage = 'Error desconocido';
		let errorStatus = 500;
		let errorType = 'error';
		if (error.response) {
			// El servidor respondió con un estado fuera del rango 2xx
			errorStatus = error.response.status;
			if (error.response.data && error.response.data.message) {
				errorMessage = error.response.data.message;
			} else if (ErrorCodeMessages[error.response.status]) {
				errorMessage = ErrorCodeMessages[error.response.status];
			} else {
				errorMessage = error.message || `Error del servidor: ${error.response.status}`;
			}
			// Si la API devuelve un 'type' o 'status' dentro de error.response.data, usarlo.
            if(error.response.data && error.response.data.type) errorType = error.response.data.type;
            if(error.response.data && error.response.data.status) errorStatus = error.response.data.status;
		} else if (error.request) {
			// La petición fue hecha pero no se recibió respuesta (ej. red caída)
			errorMessage = 'No se recibió respuesta del servidor. Verifique su conexión.';
			errorStatus = 0; // Indicador de error de red
		} else {
			// Algo sucedió al configurar la petición que disparó un Error
			errorMessage = error.message;
		}
        
        // Retornamos un objeto con la misma estructura que una respuesta exitosa, pero con el estado de error
        // Esto será lo que reciba tu AulaService
		return Promise.resolve({ // Resolvemos, no rechazamos, para que el interceptor .use((res) => res.data) funcione
            status: errorStatus,
            type: errorType,
            message: errorMessage,
            data: null // O un objeto vacío si prefieres
        });
	};
	const _httpClient = axios.create({
		baseURL: import.meta.env.VITE_API_URL, // Asegúrate de que esto esté actualizado
		timeout: 6000,
		headers: {
			'Content-Type': 'application/json',
		},
	});
	_httpClient.interceptors.response.use((response) => {
		// Aquí, 'response.data' ya debería ser el objeto completo de tu API (con status, type, message, data)
		// o el objeto de error estructurado por nuestro _errorHandler.
		return response.data; 
	}, _errorHandler); // El error handler ahora devuelve un Promise.resolve con la estructura deseada.
	return {
		get: (url: string, config = {}) => _httpClient.get(url, config),
		// Asegúrate de que los métodos post, patch, put, delete también usen _httpClient.
        // Actualmente, tu post usa axios.post directamente, lo cual NO pasará por tu interceptor.
        // CÁMBIALO A:
        post: (url: string, data: any, config = {}) => _httpClient.post(url, data, config),
		patch: (url: string, config = {}) => _httpClient.patch(url, config),
		put: (url: string, config = {}) => _httpClient.put(url, config),
		delete: (url: string, config = {}) => _httpClient.delete(url, config),
		client: _httpClient,
	};
}
export default HttpClient();