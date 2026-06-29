import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { getBasePath } from 'utils/basePath';

import cacheBursting from '../../i18n-translations-hash.json';

i18n
	// load translation using http -> see /public/locales
	.use(Backend)
	// detect user language
	.use(LanguageDetector)
	// pass the i18n instance to react-i18next.
	.use(initReactI18next)
	// init i18next
	.init({
		debug: false,
		// Español por defecto: en el primer ingreso (sin preferencia guardada) el portal
		// arranca en 'es'. Si una clave faltara en 'es', cae a 'en' como respaldo.
		fallbackLng: ['es', 'en'],
		supportedLngs: ['es', 'en', 'en-GB'],
		// Sin 'navigator': el idioma NO depende del navegador del usuario. Solo se respeta
		// lo que el usuario elija en el selector (persistido en localStorage) o ?lng= para pruebas.
		detection: {
			order: ['querystring', 'localStorage', 'cookie'],
			lookupQuerystring: 'lng',
			caches: ['localStorage'],
		},
		interpolation: {
			escapeValue: false, // not needed for react as it escapes by default
		},
		backend: {
			loadPath: (languages: string[], namespaces: string[]): string => {
				const language = languages[0];
				const namespace = namespaces[0];
				const pathkey = `/${language}/${namespace}`;
				const hash = cacheBursting[pathkey as keyof typeof cacheBursting] || '';
				return `${getBasePath()}locales/${language}/${namespace}.json?h=${hash}`;
			},
		},
		react: {
			useSuspense: false,
		},
	});

// Mantiene el atributo <html lang> en sincronía con el idioma activo (accesibilidad y SEO).
function syncHtmlLang(lng?: string): void {
	if (typeof document !== 'undefined' && lng) {
		document.documentElement.lang = lng.startsWith('es') ? 'es' : 'en';
	}
}
i18n.on('languageChanged', syncHtmlLang);
i18n.on('initialized', () => syncHtmlLang(i18n.language));

export default i18n;
