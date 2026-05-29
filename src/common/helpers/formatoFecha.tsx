export default function formatoFecha(fecha: number | Date) {
  const date = typeof fecha === 'number' ? new Date(fecha) : fecha;
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}