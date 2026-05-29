import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          "Drag and drop your event or click in the calendar": "Drag and drop your event or click in the calendar",
        }
      },
      es: {
        translation: {
          "Drag and drop your event or click in the calendar": "Arrastra y suelta tu sala o haz clic en el calendario",
        }
      }
    },
    lng: "es",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });
// Define la interfaz para las props de SidePanel para mayor claridad y seguridad de tipos
interface SidePanelProps {
    // Definimos el tipo de cada objeto en el array 'aulas'
    aulas: {
        id: string; // Asumiendo que 'id' es una string para la key
        className: string;
        textClass: string; // Aquí puede ser string, o tu tipo más específico
        title: string;    // Aquí puede ser string, o tu tipo más específico
    }[];
}
const SidePanel = ({ aulas }: SidePanelProps) => {
	const { t } = useTranslation();
	//console.log("Renderizando SidePanel con aulas:", aulas); // Log para depuración
	return (
		<>
			<div id="external-events" className="m-t-20">
				<br />
				<p className="text-muted">{t('Arrastra y suelta tu sala o haz clic en el calendario')}</p>
				{/* external events */}
                {/* Ahora 'aulas' ya es un array, no necesita el '|| []' pero no hace daño */}
				{aulas?.map((event, index) => { 
					return (
						<div
                            // Usar event.id para la key si es única, es mejor que index.toString()
							key={event.id || index.toString()} 
							className={classNames(
								'external-event',
								event.className + '-lighten', // Asegúrate de que event.className es una string
								event.textClass // Asegúrate de que event.textClass es compatible con classNames
							)}
							title={event.title} // Si title siempre es string, puedes quitar typeof y String()
							data-class={event.className}
						>
							<i className="mdi mdi-checkbox-blank-circle me-2 vertical-middle"></i>
							{event.title}
						</div>
					);
				})}
			</div>
		</>
	);
};
export default SidePanel;