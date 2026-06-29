import type { ColumnsType, ColumnType } from 'antd/es/table';
import { generatorResizeTableColumns } from 'components/TableRenderer/utils';
import type { TFunction } from 'i18next';
import { ServicesList } from 'types/api/metrics/getService';

import { getBaseColumnOptions } from './BaseColumnOptions';
import { ColumnKey, getColumnTitles } from './ColumnContants';
import { getColumnSearchProps } from './GetColumnSearchProps';

export const getColumns = (
	search: string,
	isMetricData: boolean,
	t: TFunction,
): ColumnsType<ServicesList> => {
	const columnTitles = getColumnTitles(t);
	// Unidad de la latencia P99: ns para datos de métricas, ms para trazas.
	const p99Unit: string = isMetricData
		? t('pages:svc_unit_ns', { defaultValue: 'ns' })
		: t('pages:svc_unit_ms', { defaultValue: 'ms' });
	// Conector "in"/"en" traducido por separado para evitar interpolación
	// (los componentes consumen el texto ya resuelto).
	const inWord: string = t('pages:svc_unit_in', { defaultValue: 'in' });
	const p99Title = `${columnTitles[ColumnKey.P99]} (${inWord} ${p99Unit})`;

	const dynamicColumnOption: {
		key: string;
		columnOption: ColumnType<ServicesList>;
	}[] = [
		{
			key: ColumnKey.Application,
			columnOption: {
				...getColumnSearchProps('serviceName', search, t),
			},
		},
		{
			key: ColumnKey.P99,
			columnOption: {
				title: p99Title,
				sorter: (a: ServicesList, b: ServicesList): number => a.p99 - b.p99,
				render: (value: number): string => {
					if (Number.isNaN(value)) {
						return '0.00';
					}
					return isMetricData ? value.toFixed(2) : (value / 1000000).toFixed(2);
				},
			},
		},
		{
			key: ColumnKey.ErrorRate,
			columnOption: {
				sorter: (a: ServicesList, b: ServicesList): number =>
					a.errorRate - b.errorRate,
				render: (value: number): string => value.toFixed(2),
			},
		},
		{
			key: ColumnKey.Operations,
			columnOption: {
				sorter: (a: ServicesList, b: ServicesList): number =>
					a.callRate - b.callRate,
				render: (value: number): string => value.toFixed(2),
			},
		},
	];

	return generatorResizeTableColumns<ServicesList>({
		baseColumnOptions: getBaseColumnOptions(t),
		dynamicColumnOption,
	});
};
