import { mapQueryDataFromApi } from '../mapQueryDataFromApi';
import {
	compositeQueriesWithFunctions,
	compositeQueryWithoutVariables,
	compositeQueryWithVariables,
	defaultOutput,
	outputWithFunctions,
	replaceVariables,
	stepIntervalUnchanged,
} from './mapQueryDataFromApiInputs';

jest.mock('uuid', () => ({
	v4: (): string => 'test-id',
}));

describe('mapQueryDataFromApi function tests', () => {
	it('should not update the step interval when query is passed', () => {
		const output = mapQueryDataFromApi(compositeQueryWithoutVariables);

		// composite query is the response from the `v3/query_range/format` API call.
		// even if the composite query returns stepInterval updated do not modify it
		expect(output).toStrictEqual(stepIntervalUnchanged);
	});

	it('should update filter from the composite query', () => {
		const output = mapQueryDataFromApi(compositeQueryWithVariables);

		// replace the variables in the widget query and leave the rest items untouched
		expect(output).toStrictEqual(replaceVariables);
	});

	it('should not update the step intervals with multiple queries and functions', () => {
		const output = mapQueryDataFromApi(compositeQueriesWithFunctions);

		expect(output).toStrictEqual(outputWithFunctions);
	});

	it('should use the default query values and the compositeQuery object when query is not passed', () => {
		const output = mapQueryDataFromApi(compositeQueryWithoutVariables);

		// when the query object is not passed take the initial values and merge the composite query on top of it
		expect(output).toStrictEqual(defaultOutput);
	});

	// Regresión de la vista guardada del explorador de trazas. Guardar una vista y
	// volver a abrirla devolvía "Cannot use 'in' operator..." / "not implemented" y la
	// petición a query_range NUNCA salía: el fallo era del cliente, al construir el
	// payload. Causa: el spec v5 que persiste la vista NO incluye `aggregations`, y el
	// hueco se rellenaba SIEMPRE con los valores por defecto de métricas, así que una
	// consulta de trazas volvía con {metricName, temporality, ...} en vez de count().
	it('reconstruye la agregación de trazas al releer una vista guardada', () => {
		// Forma real devuelta por GET /api/v1/explorer/views?sourcePage=traces.
		const vistaGuardada = {
			queryType: 'builder',
			panelType: 'list',
			queries: [
				{
					type: 'builder_query',
					spec: {
						name: 'A',
						stepInterval: 0,
						signal: 'traces',
						source: '',
						filter: { expression: "name != 'resourceFetch'" },
						having: { expression: '' },
					},
				},
			],
		} as unknown as Parameters<typeof mapQueryDataFromApi>[0];

		const [consulta] = mapQueryDataFromApi(vistaGuardada).builder.queryData;

		expect(consulta.dataSource).toBe('traces');
		expect(consulta.aggregations).toStrictEqual([{ expression: 'count() ' }]);
	});
});
