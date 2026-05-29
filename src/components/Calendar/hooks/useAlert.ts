import Swal, { SweetAlertIcon } from 'sweetalert2';

type AlertOptions = {
  title?: string;
  text?: string;
  html?: string;
  timer?: number;
};

export const useAlert = () => {

  const toast = (icon: SweetAlertIcon, title: string, opts: AlertOptions = {}) => {
    return Swal.fire({
      icon,
      title,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: opts.timer?? 1500,
     ...opts,
    });
  };

  return {
    // básicos
    success: (title: string, opts?: AlertOptions) => toast('success', title, opts),
    error: (title: string, text?: string) => Swal.fire({ icon: 'error', title, text }),
    warning: (title: string, text?: string) => Swal.fire({ icon: 'warning', title, text }),
    info: (title: string, text?: string) => Swal.fire({ icon: 'info', title, text }),

    // específicos de tu app
    noAutorizado: () => Swal.fire({
      icon: 'error',
      title: 'No autorizado',
      text: 'Solo el dueño puede realizar esta acción'
    }),

    conflictoHorario: () => Swal.fire({
      icon: 'error',
      title: 'Conflicto de horario',
      text: 'Ya existe un préstamo en ese rango'
    }),

    horarioNoDisponible: (aula: string, hora: string) => Swal.fire({
      icon: 'error',
      title: 'Horario no disponible',
      html: `Ya existe un préstamo de <b>${aula}</b> a las <b>${hora}</b>.`
    }),

    yaTienePrestamo: () => Swal.fire({
      icon: 'error',
      title: 'Ya tienes un préstamo activo',
      text: 'Solo 1 tablet por sede'
    }),

    faltanFechas: () => Swal.fire({ icon: 'warning', title: 'Faltan fechas' }),

    horaInvalida: () => Swal.fire({ icon: 'error', title: 'La hora final debe ser mayor' }),

    // confirmaciones
    confirmarEliminar: async (esEquipo: boolean, sede: string) => {
      return Swal.fire({
        icon: esEquipo? 'question' : 'warning',
        title: esEquipo? '¿Devolver equipo?' : '¿Eliminar préstamo?',
        text: esEquipo? `Se liberará el equipo y quedará Disponible en ${sede}` : 'Esta acción no se puede deshacer',
        showCancelButton: true,
        confirmButtonText: esEquipo? 'Sí, devolver' : 'Sí, eliminar',
        confirmButtonColor: esEquipo? '#198754' : '#d33',
        cancelButtonText: 'Cancelar'
      });
    },

    confirmarSerie: async () => {
      return Swal.fire({
        icon: 'warning',
        title: 'Préstamo recurrente',
        html: '<p><b>¿Qué deseas eliminar?</b></p>',
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: 'Solo este',
        denyButtonText: 'Toda la serie',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#6c757d',
        denyButtonColor: '#d33'
      });
    },

    restringido: () => Swal.fire({
      icon: 'warning',
      title: 'Restringido',
      text: 'Solo puedes abrir tus préstamos.'
    }),
  };
};