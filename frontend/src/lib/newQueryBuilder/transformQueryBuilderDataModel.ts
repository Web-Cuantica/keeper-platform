import {
	initialFormulaBuilderFormValues,
	initialQueryBuilderFormValuesMap,
} from 'constants/queryBuilder';
import { FORMULA_REGEXP, TRACE_OPERATOR_REGEXP } from 'constants/regExp';
import {
	BuilderQueryDataResourse,
	IBuilderFormula,
	IBuilderQuery,
	IBuilderTraceOperator,
} from 'types/api/queryBuilder/queryBuilderData';
import { QueryBuilderData } from 'types/common/queryBuilder';

export const transformQueryBuilderDataModel = (
	data: BuilderQueryDataResourse,
	queryTypes?: Record<
		string,
		'builder_query' | 'builder_formula' | 'builder_trace_operator'
	>,
): QueryBuilderData => {
	const queryData: QueryBuilderData['queryData'] = [];
	const queryFormulas: QueryBuilderData['queryFormulas'] = [];
	const queryTraceOperator: QueryBuilderData['queryTraceOperator'] = [];

	Object.entries(data).forEach(([key, value]) => {
		const isFormula = queryTypes
			? queryTypes[key] === 'builder_formula'
			: FORMULA_REGEXP.test(value.queryName);

		const isTraceOperator = queryTypes
			? queryTypes[key] === 'builder_trace_operator'
			: TRACE_OPERATOR_REGEXP.test(value.queryName);

		if (isFormula) {
			const formula = value as IBuilderFormula;
			queryFormulas.push({ ...initialFormulaBuilderFormValues, ...formula });
		} else if (isTraceOperator) {
			const traceOperator = value as IBuilderTraceOperator;
			queryTraceOperator.push({ ...traceOperator });
		} else {
			const queryFromData = value as IBuilderQuery;
			// Los valores por defecto se toman de la fuente de datos de la consulta, no
			// siempre de métricas. Una consulta guardada (p. ej. una vista del explorador)
			// no persiste `aggregations`; si se rellenaba con los de métricas, una consulta
			// de trazas volvía con la agregación en forma de métrica
			// ({metricName, temporality, ...}) en vez de [{expression:'count() '}], y el
			// constructor del payload reventaba antes de llegar a la red.
			const valoresPorDefecto =
				initialQueryBuilderFormValuesMap[queryFromData.dataSource] ??
				initialQueryBuilderFormValuesMap.metrics;

			queryData.push({
				...valoresPorDefecto,
				...queryFromData,
			});
		}
	});

	return { queryData, queryFormulas, queryTraceOperator };
};
