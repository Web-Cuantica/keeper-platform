import type { TableColumnsType as ColumnsType } from 'antd';
import type { TFunction } from 'i18next';
import { ServicesList } from 'types/api/metrics/getService';

import {
	ColumnKey,
	ColumnWidth,
	getColumnTitles,
	SORTING_ORDER,
} from './ColumnContants';

// Opciones base de columnas; recibe `t` para traducir los títulos (namespace `pages`).
export const getBaseColumnOptions = (
	t: TFunction,
): ColumnsType<ServicesList> => {
	const columnTitles = getColumnTitles(t);

	return [
		{
			title: columnTitles[ColumnKey.Application],
			dataIndex: ColumnKey.Application,
			width: ColumnWidth.Application,
			key: ColumnKey.Application,
		},
		{
			dataIndex: ColumnKey.P99,
			key: ColumnKey.P99,
			width: ColumnWidth.P99,
			defaultSortOrder: SORTING_ORDER,
		},
		{
			title: columnTitles[ColumnKey.ErrorRate],
			dataIndex: ColumnKey.ErrorRate,
			key: ColumnKey.ErrorRate,
			width: 150,
		},
		{
			title: columnTitles[ColumnKey.Operations],
			dataIndex: ColumnKey.Operations,
			key: ColumnKey.Operations,
			width: ColumnWidth.Operations,
		},
	];
};
