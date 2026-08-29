/**
 * Traducción de los títulos de los filtros rápidos.
 *
 * Los títulos llegan de dos sitios y ninguno puede llamar a `t()`:
 *  - constantes a nivel de módulo (ApiMonitoring, InfraMonitoringK8s, LogsExplorer), que se
 *    evalúan al importar el archivo, cuando i18next todavía no cargó los recursos;
 *  - `getFilterName()`, que los deriva en runtime de la clave del atributo que devuelve el
 *    backend (`service.name` → `Service Name`), así que no hay literal que envolver.
 *
 * Por eso se traducen en el punto de render, derivando la clave del propio título. Si la
 * clave no existe en el locale, i18next devuelve el título original: añadir un filtro nuevo
 * nunca rompe la UI, solo queda sin traducir.
 */
export const claveTituloFiltro = (titulo: string): string =>
	`qf_f_${titulo
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_+|_+$/g, '')}`;
