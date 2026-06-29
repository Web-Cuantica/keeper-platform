import React, { useCallback, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Color } from '@signozhq/design-tokens';
import { Button, Dropdown, Popover, Spin, Tooltip, Tree } from 'antd';
import type { MenuProps } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { useCopyToClipboard } from 'react-use';
import GroupByIcon from 'assets/CustomIcons/GroupByIcon';
import cx from 'classnames';
import CopyClipboardHOC from 'components/Logs/CopyClipboardHOC';
import { v4 as uuid } from 'uuid';
import { DATE_TIME_FORMATS } from 'constants/dateTimeFormats';
import { QueryParams } from 'constants/query';
import { OPERATORS } from 'constants/queryBuilder';
import ROUTES from 'constants/routes';
import { ChangeViewFunctionType } from 'container/ExplorerOptions/types';
import { RESTRICTED_SELECTED_FIELDS } from 'container/LogsFilters/config';
import { MetricsType } from 'container/MetricsApplication/constant';
import { useGetSearchQueryParam } from 'hooks/queryBuilder/useGetSearchQueryParam';
import { useQueryBuilder } from 'hooks/queryBuilder/useQueryBuilder';
import { ICurrentQueryData } from 'hooks/useHandleExplorerTabChange';
import {
	ArrowDownToDot,
	ArrowUpFromDot,
	Copy,
	Ellipsis,
	RefreshCw,
} from '@signozhq/icons';
import { ExplorerViews } from 'pages/LogsExplorer/utils';
import { useTimezone } from 'providers/Timezone';
import {
	BaseAutocompleteData,
	DataTypes,
} from 'types/api/queryBuilder/queryAutocompleteResponse';

import { DataType } from '../TableView';
import {
	filterKeyForField,
	getFieldAttributes,
	getSanitizedLogBody,
	parseFieldValue,
	removeEscapeCharacters,
} from '../utils';
import useAsyncJSONProcessing from './useAsyncJSONProcessing';

import './TableViewActions.styles.scss';

interface ITableViewActionsProps {
	fieldData: Record<string, string>;
	record: DataType;
	isListViewPanel: boolean;
	isfilterInLoading: boolean;
	isfilterOutLoading: boolean;
	onClickHandler: (
		operator: string,
		fieldKey: string,
		fieldValue: string,
		dataType: string | undefined,
		logType: MetricsType | undefined,
	) => () => void;
	handleChangeSelectedView?: ChangeViewFunctionType;
}

// Memoized Tree Component
const MemoizedTree = React.memo<{ treeData: DataNode[] }>(({ treeData }) => (
	<Tree
		defaultExpandAll
		showLine
		treeData={treeData}
		className="selectable-tree"
	/>
));

MemoizedTree.displayName = 'MemoizedTree';

// Body Content Component
const BodyContent: React.FC<{
	fieldData: Record<string, string>;
	record: DataType;
	bodyHtml: { __html: string };
	textToCopy: string;
	handleChangeSelectedView?: ChangeViewFunctionType;
}> = React.memo(
	({ fieldData, record, bodyHtml, textToCopy, handleChangeSelectedView }) => {
		const { isLoading, treeData, error } = useAsyncJSONProcessing(
			fieldData.value,
			record.field === 'body',
			handleChangeSelectedView,
		);

		// Show JSON tree if available, otherwise show HTML content
		if (record.field === 'body' && treeData) {
			return <MemoizedTree treeData={treeData} />;
		}

		if (record.field === 'body' && isLoading) {
			return (
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
					<Spin size="small" />
					<span style={{ color: Color.BG_SIENNA_400 }}>Processing JSON...</span>
				</div>
			);
		}

		if (record.field === 'body' && error) {
			return (
				<span
					style={{ color: Color.BG_SIENNA_400, whiteSpace: 'pre-wrap', tabSize: 4 }}
				>
					Error parsing Body JSON
				</span>
			);
		}

		if (record.field === 'body') {
			return (
				<CopyClipboardHOC entityKey="body" textToCopy={textToCopy}>
					<span
						style={{ color: Color.BG_SIENNA_400, whiteSpace: 'pre-wrap', tabSize: 4 }}
					>
						<span dangerouslySetInnerHTML={bodyHtml} />
					</span>
				</CopyClipboardHOC>
			);
		}

		return null;
	},
);

BodyContent.displayName = 'BodyContent';

export default function TableViewActions(
	props: ITableViewActionsProps,
): React.ReactElement {
	const {
		fieldData,
		record,
		isListViewPanel,
		isfilterInLoading,
		isfilterOutLoading,
		onClickHandler,
		handleChangeSelectedView,
	} = props;

	const { pathname } = useLocation();
	const {
		stagedQuery,
		updateQueriesData,
		currentQuery,
		redirectWithQueryBuilderData,
	} = useQueryBuilder();
	const viewName = useGetSearchQueryParam(QueryParams.viewName) || '';
	const { dataType, logType: fieldType } = getFieldAttributes(record.field);

	// there is no option for where clause in old logs explorer and live logs page
	const isOldLogsExplorerOrLiveLogsPage = useMemo(
		() => pathname === ROUTES.OLD_LOGS_EXPLORER || pathname === ROUTES.LIVE_LOGS,
		[pathname],
	);

	const [isOpen, setIsOpen] = useState<boolean>(false);

	// Copia al portapapeles para las acciones del menú kebab (estilo DataDog).
	const [, setCopy] = useCopyToClipboard();

	const { formatTimezoneAdjustedTimestamp } = useTimezone();

	// Memoize bodyHtml computation
	const bodyHtml = useMemo(() => {
		if (record.field !== 'body') {
			return { __html: '' };
		}

		return {
			__html: getSanitizedLogBody(record.value, { shouldEscapeHtml: true }),
		};
	}, [record.field, record.value]);

	const fieldFilterKey = filterKeyForField(fieldData.field);

	const handleGroupByAttribute = useCallback((): void => {
		if (!stagedQuery) {
			return;
		}
		const normalizedDataType: DataTypes | undefined =
			dataType && Object.values(DataTypes).includes(dataType as DataTypes)
				? (dataType as DataTypes)
				: undefined;

		const updatedQuery = updateQueriesData(
			stagedQuery,
			'queryData',
			(item, index) => {
				// Only add groupBy for index 0
				if (index === 0) {
					const newGroupByItem: BaseAutocompleteData = {
						key: fieldFilterKey,
						type: fieldType || '',
						dataType: normalizedDataType,
					};

					const updatedGroupBy = [...(item.groupBy || []), newGroupByItem];

					return { ...item, groupBy: updatedGroupBy };
				}

				return item;
			},
		);

		const queryData: ICurrentQueryData = {
			name: viewName,
			id: updatedQuery.id,
			query: updatedQuery,
		};

		handleChangeSelectedView?.(ExplorerViews.TIMESERIES, queryData);
	}, [
		stagedQuery,
		updateQueriesData,
		fieldFilterKey,
		fieldType,
		dataType,
		handleChangeSelectedView,
		viewName,
	]);

	const handleReplaceFilter = useCallback((): void => {
		if (!stagedQuery) {
			return;
		}
		const normalizedDataType: DataTypes | undefined =
			dataType && Object.values(DataTypes).includes(dataType as DataTypes)
				? (dataType as DataTypes)
				: undefined;

		const updatedQuery = updateQueriesData(
			stagedQuery,
			'queryData',
			(item, index) => {
				// Only replace filters for index 0
				if (index === 0) {
					const newFilterItem: BaseAutocompleteData = {
						key: fieldFilterKey,
						type: fieldType || '',
						dataType: normalizedDataType,
					};

					// Create new filter items array with single IN filter
					const newFilters = {
						items: [
							{
								id: '',
								key: newFilterItem,
								op: OPERATORS.IN,
								value: [parseFieldValue(fieldData.value)],
							},
						],
						op: 'AND',
					};

					// Clear the expression and update filters
					return {
						...item,
						filters: newFilters,
						filter: { expression: '' },
					};
				}

				return item;
			},
		);

		const queryData: ICurrentQueryData = {
			name: viewName,
			id: updatedQuery.id,
			query: updatedQuery,
		};

		handleChangeSelectedView?.(ExplorerViews.LIST, queryData);
	}, [
		stagedQuery,
		updateQueriesData,
		fieldFilterKey,
		fieldType,
		dataType,
		fieldData,
		handleChangeSelectedView,
		viewName,
	]);

	// Memoize textToCopy computation
	const textToCopy = useMemo(() => {
		let text = fieldData.value;
		try {
			text = text.replace(/^"|"$/g, '');
		} catch (error) {
			console.error(
				'Failed to remove starting and ending quotes from the value',
				error,
			);
		}
		// If the value is valid JSON (object or array), pretty-print it for copying
		try {
			const parsed = JSON.parse(text);
			if (typeof parsed === 'object' && parsed !== null) {
				return JSON.stringify(parsed, null, 2);
			}
		} catch {
			// not JSON, return as-is
		}
		return text;
	}, [fieldData.value]);

	// Memoize cleanTimestamp computation
	const cleanTimestamp = useMemo(() => {
		if (record.field !== 'timestamp') {
			return '';
		}
		return fieldData.value.replace(/^["']|["']$/g, '');
	}, [record.field, fieldData.value]);

	const renderFieldContent = useCallback((): JSX.Element => {
		const commonStyles: React.CSSProperties = {
			color: Color.BG_SIENNA_400,
			whiteSpace: 'pre-wrap',
			tabSize: 4,
		};

		switch (record.field) {
			case 'body':
				return (
					<BodyContent
						fieldData={fieldData}
						record={record}
						bodyHtml={bodyHtml}
						textToCopy={textToCopy}
						handleChangeSelectedView={handleChangeSelectedView}
					/>
				);

			case 'timestamp':
				return (
					<span style={commonStyles}>
						{formatTimezoneAdjustedTimestamp(
							cleanTimestamp,
							DATE_TIME_FORMATS.UTC_US_MS,
						)}
					</span>
				);

			default:
				return (
					<span style={commonStyles}>{removeEscapeCharacters(fieldData.value)}</span>
				);
		}
	}, [
		record,
		fieldData,
		bodyHtml,
		textToCopy,
		handleChangeSelectedView,
		formatTimezoneAdjustedTimestamp,
		cleanTimestamp,
	]);

	// Aplica un filtro del atributo al query del explorer. Usa el MISMO mecanismo
	// probado que el sidebar de facets: arma el item en filters.items y, como el
	// explorer V5 prioriza filter.expression sobre filters.items, sincroniza la
	// expresión con el helper canónico (fusiona con la existente sin perderla).
	// Luego redirige para correr la query. (El antiguo onClickHandler ->
	// onAddToQueryExplorer dependía de un fetch de autocomplete que no aplicaba el
	// filtro en este contexto, por eso el kebab "no hacía nada".)
	const applyFilter = useCallback(
		(operator: string, replace = false): void => {
			if (!currentQuery) {
				return;
			}
			const normalizedDataType: DataTypes =
				dataType && Object.values(DataTypes).includes(dataType as DataTypes)
					? (dataType as DataTypes)
					: DataTypes.String;

			const rawValue = parseFieldValue(fieldData.value);
			const formatted =
				typeof rawValue === 'number' || typeof rawValue === 'boolean'
					? String(rawValue)
					: `'${String(rawValue).replace(/'/g, "\\'")}'`;
			const clause = `${fieldFilterKey} ${operator} ${formatted}`;

			const newItem = {
				id: uuid(),
				op: operator,
				key: {
					id: fieldFilterKey,
					key: fieldFilterKey,
					dataType: normalizedDataType,
					type: fieldType || '',
				} as BaseAutocompleteData,
				value: rawValue,
			};

			const nextQuery = {
				...currentQuery,
				builder: {
					...currentQuery.builder,
					queryData: currentQuery.builder.queryData.map((item, index) => {
						if (index !== 0) {
							return item;
						}
						const existingItems = replace ? [] : item.filters?.items || [];
						const existingExpr = replace ? '' : (item.filter?.expression || '').trim();
						// El explorer V5 prioriza filter.expression; se anexa el clause nuevo
						// a la expresión existente (sintaxis `key op 'valor'`).
						const expression = existingExpr ? `${existingExpr} AND ${clause}` : clause;
						return {
							...item,
							filters: {
								items: [...existingItems, newItem],
								op: item.filters?.op || 'AND',
							},
							filter: { ...item.filter, expression },
						};
					}),
				},
			};

			redirectWithQueryBuilderData(nextQuery);
		},
		[
			currentQuery,
			dataType,
			fieldFilterKey,
			fieldType,
			fieldData.value,
			redirectWithQueryBuilderData,
		],
	);

	// Acciones del atributo en un menú kebab (estilo DataDog): copiar, filtrar,
	// excluir, agrupar y reemplazar filtro. El onClick va a NIVEL DE MENÚ (no
	// por item) porque el onClick por-item del Dropdown de antd no dispara aquí.
	const actionMenuItems: MenuProps['items'] = useMemo(() => {
		const items: MenuProps['items'] = [
			{ key: 'copy-value', icon: <Copy size={14} />, label: 'Copy value' },
			{
				key: 'copy-key-value',
				icon: <Copy size={14} />,
				label: 'Copy key:value',
			},
			{ type: 'divider' },
			{
				key: 'filter-for',
				icon: <ArrowDownToDot size={14} style={{ transform: 'rotate(90deg)' }} />,
				label: `Filter by ${fieldFilterKey}`,
			},
			{
				key: 'filter-out',
				icon: <ArrowUpFromDot size={14} style={{ transform: 'rotate(90deg)' }} />,
				label: `Exclude ${fieldFilterKey}`,
			},
		];

		if (!isOldLogsExplorerOrLiveLogsPage) {
			items.push(
				{
					key: 'group-by',
					icon: <GroupByIcon />,
					label: `Group by ${fieldFilterKey}`,
				},
				{
					key: 'replace-filter',
					icon: <RefreshCw size={14} />,
					label: 'Replace filter with this value',
				},
			);
		}

		return items;
	}, [fieldFilterKey, isOldLogsExplorerOrLiveLogsPage]);

	// onClick a nivel de menú: rutea cada acción por su key (patrón confiable).
	const handleMenuClick = useCallback<NonNullable<MenuProps['onClick']>>(
		({ key }): void => {
			switch (key) {
				case 'copy-value':
					setCopy(textToCopy);
					break;
				case 'copy-key-value':
					setCopy(`${fieldFilterKey}: ${textToCopy}`);
					break;
				case 'filter-for':
					applyFilter(OPERATORS['=']);
					break;
				case 'filter-out':
					applyFilter(OPERATORS['!=']);
					break;
				case 'group-by':
					handleGroupByAttribute();
					break;
				case 'replace-filter':
					applyFilter(OPERATORS['='], true);
					break;
				default:
					break;
			}
		},
		[
			setCopy,
			textToCopy,
			fieldFilterKey,
			applyFilter,
			handleGroupByAttribute,
		],
	);

	// El kebab ⋮ siempre visible (no en hover) que abre el menú de acciones.
	const renderActionsKebab = useCallback((): JSX.Element | null => {
		if (isListViewPanel || RESTRICTED_SELECTED_FIELDS.includes(fieldFilterKey)) {
			return null;
		}
		return (
			<span className="log-attr-actions" data-log-detail-ignore="true">
				<Dropdown
					menu={{ items: actionMenuItems, onClick: handleMenuClick }}
					trigger={['click']}
					placement="bottomRight"
					// `drawer-popover` evita que el handleClickOutside del LogDetail cierre
					// el drawer (y desmonte el menú) en el mousedown, antes de que dispare
					// el onClick del item. Sin esto, ninguna acción del kebab corría.
					overlayClassName="log-attr-actions-menu drawer-popover"
				>
					<Button
						type="text"
						className="log-attr-kebab periscope-btn"
						icon={<Ellipsis size={14} />}
						onClick={(e): void => e.stopPropagation()}
					/>
				</Dropdown>
			</span>
		);
	}, [isListViewPanel, fieldFilterKey, actionMenuItems, handleMenuClick]);

	// Early return for body field with async processing
	if (record.field === 'body') {
		return (
			<div className={cx('value-field', isOpen ? 'open-popover' : '')}>
				<BodyContent
					fieldData={fieldData}
					record={record}
					bodyHtml={bodyHtml}
					textToCopy={textToCopy}
					handleChangeSelectedView={handleChangeSelectedView}
				/>
				{renderActionsKebab()}
			</div>
		);
	}

	return (
		<div className={cx('value-field', isOpen ? 'open-popover' : '')}>
			<CopyClipboardHOC entityKey={fieldFilterKey} textToCopy={textToCopy}>
				{renderFieldContent()}
			</CopyClipboardHOC>
			{renderActionsKebab()}
		</div>
	);
}

TableViewActions.defaultProps = {
	handleChangeSelectedView: undefined,
};
