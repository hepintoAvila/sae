export default function encodeBasicUrl(str: string) {
	// Codificar caracteres no ASCII correctamente
	return btoa(encodeURIComponent(str));
}
