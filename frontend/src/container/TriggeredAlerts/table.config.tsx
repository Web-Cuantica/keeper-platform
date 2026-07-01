import type { TFunction } from 'i18next';
import { BellDot } from '@signozhq/icons';
import { Badge } from '@signozhq/ui/badge';
import { SEVERITY_BADGE_COLORS } from 'components/Alerts/constants';
import type { TableColumnDef } from 'components/TanStackTableView';
import TanStackTable from 'components/TanStackTableView';
import { DATE_TIME_FORMATS } from 'constants/dateTimeFormats';
import AlertStatusTag from './components/AlertStatusTag';
import LabelColumn from 'components/Alerts/LabelColumn';
import styles from './TriggeredAlerts.module.scss';
import type { Alert, GroupedAlert } from './types';
import { GroupTagsCell } from 'container/TriggeredAlerts/components/GroupTagsCell';

export function getAlertColumns(
	formatTimezoneAdjustedTimestamp: (date: string, format: string) => string,
	t: TFunction,
): TableColumnDef<Alert>[] {
	return [
		{
			id: 'status',
			header: t('al_col_status', { defaultValue: 'Status' }) as string,
			accessorFn: (row) => row.status?.state,
			width: { fixed: '100px' },
			enableSort: false,
			enableMove: false,
			cell: ({ row, value }): JSX.Element => (
				<AlertStatusTag
					state={String(value ?? '')}
					testId={`alert-row-${row.fingerprint ?? ''}-status`}
				/>
			),
		},
		{
			id: 'alertName',
			header: t('al_col_alert_name', { defaultValue: 'Alert Name' }) as string,
			accessorFn: (row) => row.labels?.alertname ?? '',
			width: { default: '100%' },
			enableSort: true,
			enableMove: false,
			cell: ({ row, value }): JSX.Element => (
				<TanStackTable.Text
					title={value}
					data-testid={`alert-row-${row.fingerprint ?? ''}-name`}
				>
					{String(value ?? '-')}
				</TanStackTable.Text>
			),
		},
		{
			id: 'severity',
			header: t('al_col_severity', { defaultValue: 'Severity' }) as string,
			accessorFn: (row) => row.labels?.severity ?? '',
			width: { fixed: '120px' },
			enableSort: true,
			enableMove: false,
			cell: ({ row, value }): JSX.Element => {
				const severity = String(value ?? '').toLowerCase();
				const testId = `alert-row-${row.fingerprint ?? ''}-severity`;
				if (!severity) {
					return <TanStackTable.Text data-testid={testId}>-</TanStackTable.Text>;
				}
				return (
					<Badge
						color={SEVERITY_BADGE_COLORS[severity] ?? 'secondary'}
						variant="outline"
						testId={testId}
					>
						{severity}
					</Badge>
				);
			},
		},
		{
			id: 'firingSince',
			header: t('al_col_firing_since', { defaultValue: 'Firing Since' }) as string,
			accessorKey: 'startsAt',
			width: { min: 280, default: 280 },
			enableSort: true,
			enableMove: false,
			cell: ({ value }): JSX.Element => (
				<TanStackTable.Text>
					{value
						? formatTimezoneAdjustedTimestamp(String(value), DATE_TIME_FORMATS.UTC_US)
						: '-'}
				</TanStackTable.Text>
			),
		},
		{
			id: 'labels',
			header: t('al_col_labels', { defaultValue: 'Labels' }) as string,
			accessorKey: 'labels',
			width: { default: '100%' },
			enableMove: false,
			cell: ({ value }): JSX.Element => {
				const labels = value as Record<string, string> | undefined;
				if (!labels) {
					return <TanStackTable.Text>-</TanStackTable.Text>;
				}

				const tagKeys = Object.keys(labels).filter((k) => k !== 'severity');
				if (!tagKeys.length) {
					return <TanStackTable.Text>-</TanStackTable.Text>;
				}

				return <LabelColumn labels={tagKeys} value={labels} color="sakura" />;
			},
		},
	];
}

export function getGroupedColumns(
	t: TFunction,
): TableColumnDef<GroupedAlert>[] {
	return [
		{
			id: 'groupTags',
			header: (): JSX.Element => (
				<div className={styles.groupHeader}>
					<BellDot size={14} />
					<span>{t('al_col_group', { defaultValue: 'Group' })}</span>
				</div>
			),
		accessorFn: (row) => row.groupKey,
		width: { default: '100%' },
		enableRemove: false,
		enableMove: false,
		pin: 'left',
		cell: ({ row: groupRow, isExpanded, toggleExpanded }): JSX.Element => {
			return (
				<GroupTagsCell
					groupRow={groupRow}
					isExpanded={isExpanded}
					toggleExpanded={toggleExpanded}
				/>
			);
		},
	},
	{
		id: 'alertCount',
		header: t('al_col_alerts', { defaultValue: 'Alerts' }) as string,
		accessorFn: (row) => row.alerts.length,
		width: { min: 80, default: 100 },
		enableMove: false,
		cell: ({ value }): JSX.Element => (
			<TanStackTable.Text>{String(value)}</TanStackTable.Text>
		),
	},
	];
}
