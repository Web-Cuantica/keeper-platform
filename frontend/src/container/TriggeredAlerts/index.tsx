import type { ReactNode } from 'react';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Search } from '@signozhq/icons';
import { Input } from '@signozhq/ui/input';
import { ComboboxSimple, ComboboxSimpleItem } from '@signozhq/ui/combobox';
import ErrorEmptyState from 'components/Alerts/ErrorEmptyState';
import NoResultsEmptyState from 'components/Alerts/NoResultsEmptyState';
import type { FilterValue } from 'components/Alerts/types';
import TanStackTable from 'components/TanStackTableView';
import { useCalculatedPageSize } from 'components/TanStackTableView/useCalculatedPageSize';
import { useTableParams } from 'components/TanStackTableView/useTableParams';
import { useUrlSearchState } from 'hooks/useUrlSearchState';
import { useTimezone } from 'providers/Timezone';

import { EmptyState } from './components/EmptyStates';
import ExpandedAlertsTable from './components/ExpandedAlertsTable';

import {
	TRIGGERED_ALERTS_PARAMS,
	useTriggeredAlertsFilters,
	useTriggeredAlertsGroupBy,
} from './hooks';
import { getAlertColumns, getGroupedColumns } from './table.config';
import styles from './TriggeredAlerts.module.scss';
import type { Alert, GroupedAlert } from './types';
import { useTriggeredAlertsData } from './useTriggeredAlertsData';
import { useTriggeredAlertsHandlers } from './useTriggeredAlertsHandlers';

const QUERY_PARAMS_CONFIG = {
	orderBy: 'orderBy',
	page: 'page',
	limit: 'limit',
} as const;

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

// Genera los filtros de severidad traducidos; se llama en render para no congelar el namespace async
const getSeverityFilters = (t: TFunction): ComboboxSimpleItem[] => [
	{
		value: 'severity:critical',
		label: `${t('al_severity_critical', {
			defaultValue: 'Critical',
		})} (severity:critical)`,
		displayValue: t('al_severity_critical', { defaultValue: 'Critical' }),
	},
	{
		value: 'severity:error',
		label: `${t('al_severity_error', {
			defaultValue: 'Error',
		})} (severity:error)`,
		displayValue: t('al_severity_error', { defaultValue: 'Error' }),
	},
	{
		value: 'severity:warning',
		label: `${t('al_severity_warning', {
			defaultValue: 'Warning',
		})} (severity:warning)`,
		displayValue: t('al_severity_warning', { defaultValue: 'Warning' }),
	},
	{
		value: 'severity:info',
		label: `${t('al_severity_info', {
			defaultValue: 'Info',
		})} (severity:info)`,
		displayValue: t('al_severity_info', { defaultValue: 'Info' }),
	},
];

function TriggeredAlerts(): JSX.Element {
	const { t } = useTranslation('pages');
	const [filterValues, setFilterValues] = useTriggeredAlertsFilters();
	const [selectedGroupBy, setSelectedGroupBy] = useTriggeredAlertsGroupBy();
	const { formatTimezoneAdjustedTimestamp } = useTimezone();

	const { containerRef, calculatedPageSize } = useCalculatedPageSize({
		rowHeight: 46,
	});

	const { page, limit, setLimit, orderBy, setPage } = useTableParams(
		QUERY_PARAMS_CONFIG,
		{
			page: DEFAULT_PAGE,
			limit: DEFAULT_LIMIT,
			storageKey: 'triggered-alerts',
			calculatedPageSize,
			cleanupOnUnmount: true,
		},
	);

	const resetPageOnSearch = useCallback((): void => {
		setPage(1);
	}, [setPage]);

	const { searchText, debouncedSearch, handleSearchChange, clearSearch } =
		useUrlSearchState(TRIGGERED_ALERTS_PARAMS.SEARCH, {
			onDebouncedChange: resetPageOnSearch,
		});

	const selectedFilter = useMemo(
		(): FilterValue[] => (filterValues ?? []).map((v: string) => ({ value: v })),
		[filterValues],
	);

	const {
		filteredAlerts,
		groupedData,
		uniqueLabels,
		isFetching,
		isError,
		isGrouped,
		allAlerts,
		refetch,
	} = useTriggeredAlertsData(
		selectedFilter,
		selectedGroupBy,
		orderBy,
		debouncedSearch,
	);

	const handleFilterChange = useCallback(
		(values: unknown): void => {
			if (Array.isArray(values)) {
				void setFilterValues(values.length ? values : null);
			}
		},
		[setFilterValues],
	);

	const { handleGroupByChange, handleRowClick, handleRowClickNewTab } =
		useTriggeredAlertsHandlers(setSelectedGroupBy);

	const columns = useMemo(
		() => getAlertColumns(formatTimezoneAdjustedTimestamp, t),
		[formatTimezoneAdjustedTimestamp, t],
	);

	const severityFilters = useMemo(() => getSeverityFilters(t), [t]);

	const groupedColumns = useMemo(() => getGroupedColumns(t), [t]);

	const labelOptions: ComboboxSimpleItem[] = uniqueLabels.map((label) => ({
		value: label,
		label,
	}));

	const paginatedAlerts = useMemo(() => {
		const start = (page - 1) * limit;
		return filteredAlerts.slice(start, start + limit);
	}, [filteredAlerts, page, limit]);

	const paginatedGroupedData = useMemo(() => {
		const start = (page - 1) * limit;
		return groupedData.slice(start, start + limit);
	}, [groupedData, page, limit]);

	const renderExpandedRow = useCallback(
		(group: GroupedAlert): ReactNode => (
			<ExpandedAlertsTable
				alerts={group.alerts}
				columns={columns}
				onRowClick={handleRowClick}
				onRowClickNewTab={handleRowClickNewTab}
				isLoading={isFetching}
			/>
		),
		[columns, handleRowClick, handleRowClickNewTab, isFetching],
	);

	const hasActiveFilters = selectedFilter.length > 0 || searchText.length > 0;
	const isEmptyDueToFilters =
		!isFetching &&
		filteredAlerts.length === 0 &&
		hasActiveFilters &&
		allAlerts.length > 0;
	const isEmptyNoAlerts = !isFetching && !isError && allAlerts.length === 0;

	const handleClearFilters = useCallback((): void => {
		void setFilterValues(null);
		clearSearch();
	}, [setFilterValues, clearSearch]);

	return (
		<div className={styles.container}>
			<div className={styles.filtersRow}>
				<Input
					className={styles.searchInput}
					placeholder={t('al_search_alerts_by_name', {
						defaultValue: 'Search alerts by name',
					})}
					value={searchText}
					onChange={handleSearchChange}
					suffix={<Search size={14} className={styles.searchIcon} />}
					testId="triggered-alerts-search-input"
				/>
				<ComboboxSimple
					className={styles.filterSelect}
					multiple
					value={selectedFilter.map((f) => f.value)}
					onChange={handleFilterChange}
					placeholder={t('al_filter_by_tags', { defaultValue: 'Filter by tags' })}
					inputPlaceholder={t('al_create_filters_label_value', {
						defaultValue: "Create new filters with 'label:value'",
					})}
					allowCreate
					items={severityFilters}
					maxDisplayedPills={2}
					testId="triggered-alerts-filter-combobox"
				/>
				<ComboboxSimple
					className={styles.filterSelect}
					value={selectedGroupBy}
					onChange={handleGroupByChange}
					placeholder={t('al_group_by_tag', { defaultValue: 'Group by tag' })}
					inputPlaceholder={t('al_select_one_or_more', {
						defaultValue: 'Select one or more',
					})}
					items={labelOptions}
					multiple
					maxDisplayedPills={2}
					testId="triggered-alerts-groupby-combobox"
				/>
			</div>

			<div ref={containerRef} className={styles.tableContainer}>
				{isError ? (
					<ErrorEmptyState
						title={t('al_failed_to_load_alerts', {
							defaultValue: 'Failed to load alerts',
						})}
						onRefresh={refetch}
					/>
				) : isEmptyDueToFilters ? (
					<NoResultsEmptyState
						title={t('al_no_matching_alerts', {
							defaultValue: 'No matching alerts',
						})}
						subtitle={t('al_no_alerts_match_filters', {
							defaultValue:
								'No alerts match your current filters. Try adjusting your search criteria.',
						})}
						onClear={handleClearFilters}
					/>
				) : isEmptyNoAlerts ? (
					<EmptyState onRefresh={refetch} />
				) : isGrouped ? (
					<TanStackTable<GroupedAlert>
						data={paginatedGroupedData}
						columns={groupedColumns}
						isLoading={isFetching}
						getRowKey={(row): string => row.groupKey}
						getItemKey={(row): string => row.groupKey}
						renderExpandedRow={renderExpandedRow}
						getRowCanExpand={(): boolean => true}
						columnStorageKey="triggered-alerts-grouped-columns"
						enableQueryParams={QUERY_PARAMS_CONFIG}
						pagination={{
							total: groupedData.length,
							calculatedPageSize,
							onLimitChange: setLimit,
						}}
						paginationClassname={styles.paginationContainer}
					/>
				) : (
					<TanStackTable<Alert>
						data={paginatedAlerts}
						columns={columns}
						isLoading={isFetching}
						getRowKey={(row): string => row.fingerprint ?? ''}
						getItemKey={(row): string => row.fingerprint ?? ''}
						onRowClick={handleRowClick}
						onRowClickNewTab={handleRowClickNewTab}
						columnStorageKey="triggered-alerts-columns"
						enableQueryParams={QUERY_PARAMS_CONFIG}
						pagination={{
							total: filteredAlerts.length,
							calculatedPageSize,
							onLimitChange: setLimit,
						}}
						paginationClassname={styles.paginationContainer}
						enableAlternatingRowColors
						plainTextCellLineClamp={2}
					/>
				)}
			</div>
		</div>
	);
}

export default TriggeredAlerts;
