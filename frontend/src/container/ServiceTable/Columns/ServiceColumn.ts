import type { ColumnsType } from 'antd/es/table';
import type { TFunction } from 'i18next';
import { ServicesList } from 'types/api/metrics/getService';

import {
	ColumnKey,
	ColumnWidth,
	getColumnTitles,
	SORTING_ORDER,
} from './ColumnContants';
import { getColumnSearchProps } from './GetColumnSearchProps';

export const getColumns = (
	search: string,
	t: TFunction,
): ColumnsType<ServicesList> => {
	const columnTitles = getColumnTitles(t);

	return [
		{
			title: columnTitles[ColumnKey.Application],
			dataIndex: ColumnKey.Application,
			width: ColumnWidth.Application,
			key: ColumnKey.Application,
			...getColumnSearchProps('serviceName', search, t),
		},
		{
			title: columnTitles[ColumnKey.P99],
			dataIndex: ColumnKey.P99,
			key: ColumnKey.P99,
			width: ColumnWidth.P99,
			defaultSortOrder: SORTING_ORDER,
			sorter: (a: ServicesList, b: ServicesList): number => a.p99 - b.p99,
			render: (value: number): string => (value / 1000000).toFixed(2),
		},
		{
			title: columnTitles[ColumnKey.ErrorRate],
			dataIndex: ColumnKey.ErrorRate,
			key: ColumnKey.ErrorRate,
			width: 150,
			sorter: (a: ServicesList, b: ServicesList): number =>
				a.errorRate - b.errorRate,
			render: (value: number): string => value.toFixed(2),
		},
		{
			title: columnTitles[ColumnKey.Operations],
			dataIndex: ColumnKey.Operations,
			key: ColumnKey.Operations,
			width: ColumnWidth.Operations,
			sorter: (a: ServicesList, b: ServicesList): number =>
				a.callRate - b.callRate,
			render: (value: number): string => value.toFixed(2),
		},
	];
};
