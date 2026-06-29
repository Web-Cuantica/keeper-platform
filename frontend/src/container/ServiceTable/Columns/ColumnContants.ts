import type { TFunction } from 'i18next';

export enum ColumnKey {
	Application = 'serviceName',
	P99 = 'p99',
	ErrorRate = 'errorRate',
	Operations = 'callRate',
}

// Devuelve los títulos de columna traducidos. Recibe `t` para mantener el tipado
// y garantizar que el namespace `pages` ya esté cargado por el componente.
export const getColumnTitles = (t: TFunction): Record<ColumnKey, string> => ({
	[ColumnKey.Application]: t('pages:svc_col_application', {
		defaultValue: 'Application',
	}),
	[ColumnKey.P99]: t('pages:svc_col_p99_latency_ms', {
		defaultValue: 'P99 latency (in ms)',
	}),
	[ColumnKey.ErrorRate]: t('pages:svc_col_error_rate', {
		defaultValue: 'Error Rate (% of total)',
	}),
	[ColumnKey.Operations]: t('pages:svc_col_operations_per_second', {
		defaultValue: 'Operations Per Second',
	}),
});

export enum ColumnWidth {
	Application = 200,
	P99 = 150,
	ErrorRate = 150,
	Operations = 150,
}

export const SORTING_ORDER = 'descend';

// Placeholder del buscador de servicios; traducido vía `t` (namespace `pages`).
export const getSearchPlaceholder = (t: TFunction): string =>
	t('pages:svc_search_by_service', { defaultValue: 'Search by service' });
