export default  function getElemento<T>(arreglo: T[],index:number): T | null {
return arreglo?.length > 0 ? arreglo[index] : null;
}