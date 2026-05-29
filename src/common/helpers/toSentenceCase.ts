type Aula = { id: number; dependencia_id: number; title: string; className: string; textClass: string; statut?: string };
type Opcion = { id: number; idAula: number; dependencia_id: number; title: string; stock: number; className?: string; textClass?: string; statut?: string };
 
export function toSentenceCase(string: string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}
// 1️⃣ Extrae AULAS limpias (sin children)
export function extractAulasFromProp(aulasConChildren: Aula[]): Aula[] {
  if (!aulasConChildren ||!Array.isArray(aulasConChildren)) return [];
  return aulasConChildren.map((aula: any): Aula => ({
	id: Number(aula.id),
	dependencia_id: Number(aula.dependencia_id),
	title: aula.title,
	className: aula.className || 'bg-primary',
	textClass: aula.textClass || 'text-white',
	statut: aula.statut || 'Activo',
  }));
};

// 2️⃣ Extrae OPCIONES desde children
export  function extractOpcionesFromAulas(aulasConChildren: Aula[]): Opcion[] {
  if (!aulasConChildren ||!Array.isArray(aulasConChildren)) return [];
  return aulasConChildren.flatMap((aula: any) => {
	const idAula = Number(aula.id);
	const dependencia_id = Number(aula.dependencia_id);
	return (aula.children || []).map((child: any): Opcion => ({
	  id: Number(child.id),
	  idAula,
	  dependencia_id: Number(child.dependencia_id) || dependencia_id,
	  title: child.title,
	  stock: Number(child.stock) || 1,
	  className: child.className || 'bg-primary',
	  textClass: child.textClass || 'text-white',
	  statut: child.statut || 'Activo',
	}));
  });
};
