# SAE - Sistema de Agendamiento de Espacios y Equipos

Sistema web para gestionar y reservar espacios físicos y equipos dentro de una institución. Permite a usuarios consultar disponibilidad en tiempo real, agendar recursos y a administradores controlar aprobaciones, reportes y uso de los mismos.

## 🚀 Características principales

- **Reserva de espacios**: Salones, auditorios, laboratorios, canchas
- **Reserva de equipos**: Proyectores, portátiles, cámaras, micrófonos
- **Calendario en tiempo real**: Consulta disponibilidad por fecha, hora y recurso
- **Flujo de aprobación**: Solicitudes pendientes, aprobadas o rechazadas
- **Roles de usuario**: Estudiante, docente, administrativo, super admin
- **Gestión de recursos**: CRUD de espacios y equipos desde panel admin
- **Historial y reportes**: Exporta reservas por rango de fechas
- **Notificaciones**: Confirmación y recordatorios por correo

## 🛠️ Tecnologías

| Capa | Tecnología |
| --- | --- |
| Frontend | React 18 + Vite + React Router + Axios |
| Backend API | SPIP con plugins REST |
| Servidor Node | Node.js + Express para middleware/auth |
| Base de datos | MySQL 8.0 |
| Autenticación | JWT |
| Estilos | TailwindCSS |
| Calendario | FullCalendar |

## 📦 Instalación

### **Requisitos previos**
- Node.js v18+
- MySQL 8.0+
- SPIP 4.x instalado con servidor Apache/PHP
- Git

### **1. Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/sae.git
cd sae
