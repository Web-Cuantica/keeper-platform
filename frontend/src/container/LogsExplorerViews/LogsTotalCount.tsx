import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ENTITY_VERSION_V5 } from 'constants/app';
import { PANEL_TYPES } from 'constants/queryBuilder';
import { useGetExplorerQueryRange } from 'hooks/queryBuilder/useGetExplorerQueryRange';
import { useQueryBuilder } from 'hooks/queryBuilder/useQueryBuilder';
import { Query } from 'types/api/queryBuilder/queryBuilderData';
import { DataSource, LogsAggregatorOperator } from 'types/common/queryBuilder';

// Extrae el total de forma defensiva: la respuesta escalar (count() sin groupBy)
// llega como table.rows[].data; como respaldo sumamos los valores de la serie.
function extractTotal(data: any): number | null {
	const result = data?.payload?.data?.result;
	if (!Array.isArray(result) || result.length === 0) {
		return null;
	}
	let total = 0;
	let found = false;
	result.forEach((q: any) => {
		const rows = q?.table?.rows;
		if (Array.isArray(rows) && rows.length) {
			rows.forEach((row: any) => {
				Object.values(row?.data || {}).forEach((v: any) => {
					const n = Number(v);
					if (Number.isFinite(n)) {
						total += n;
						found = true;
					}
				});
			});
			return;
		}
		const series = q?.series;
		if (Array.isArray(series)) {
			series.forEach((s: any) => {
				(s?.values || []).forEach((pt: any) => {
					const v = Array.isArray(pt) ? pt[1] : pt?.value;
					const n = Number(v);
					if (Number.isFinite(n)) {
						total += n;
						found = true;
					}
				});
			});
		}
	});
	return found ? total : null;
}

// Contador del total de logs que coinciden con los filtros actuales del Explorador.
// Se actualiza al cargar y cada vez que cambian los filtros (currentQuery).
function LogsTotalCount(): JSX.Element | null {
	const { t } = useTranslation('pages');
	const { currentQuery } = useQueryBuilder();

	const countQuery: Query | null = useMemo(() => {
		if (!currentQuery) {
			return null;
		}
		return {
			...currentQuery,
			builder: {
				...currentQuery.builder,
				queryData: currentQuery.builder.queryData.map((item) => ({
					...item,
					disabled: false,
					aggregateOperator: LogsAggregatorOperator.COUNT,
					orderBy: [],
					pageSize: undefined,
					groupBy: [],
					aggregations: [{ expression: 'count()' }],
					filters: {
						...item.filters,
						items:
							item.filters?.items?.filter((f) => f.key?.key !== 'id') || [],
						op: item.filters?.op || 'AND',
					},
				})),
			},
		};
	}, [currentQuery]);

	const { data, isFetching } = useGetExplorerQueryRange(
		countQuery,
		PANEL_TYPES.TABLE,
		ENTITY_VERSION_V5,
		{ enabled: !!countQuery, keepPreviousData: true },
		{ dataSource: DataSource.LOGS },
	);

	const total = useMemo(() => extractTotal(data), [data]);

	if (total === null && !isFetching) {
		return null;
	}

	return (
		<div className="logs-total-count" data-testid="logs-total-count">
			<span className="logs-total-count__label">
				{t('logs_total', { defaultValue: 'Total' })}:
			</span>
			<span className="logs-total-count__value">
				{total === null ? '…' : total.toLocaleString('es-MX')}
			</span>
		</div>
	);
}

export default LogsTotalCount;
