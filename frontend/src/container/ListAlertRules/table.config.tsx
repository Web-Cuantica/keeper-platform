import { Badge, BadgeColor } from '@signozhq/ui/badge';
import { SEVERITY_BADGE_COLORS } from 'components/Alerts/constants';
import LabelColumn from 'components/Alerts/LabelColumn';
import type { TableColumnDef } from 'components/TanStackTableView';
import TanStackTable from 'components/TanStackTableView';
import { DATE_TIME_FORMATS } from 'constants/dateTimeFormats';
import type { TFunction } from 'i18next';

import type { AlertRule } from './types';

const STATE_CONFIG: Record<string, { color: BadgeColor; label: string }> = {
	firing: { color: 'error', label: 'Firing' },
	inactive: { color: 'success', label: 'OK' },
	pending: { color: 'warning', label: 'Pending' },
	disabled: { color: 'secondary', label: 'Disabled' },
};

export function getAlertRuleColumns(
	formatTimezoneAdjustedTimestamp: (date: string, format: string) => string,
	t: TFunction,
): TableColumnDef<AlertRule>[] {
	return [
		{
			id: 'state',
			header: t('pages:alertlist_col_status', { defaultValue: 'Status' }),
			accessorKey: 'state',
			width: { fixed: '100px' },
			enableSort: true,
			enableRemove: false,
			enableMove: false,
			cell: ({ row, value }): JSX.Element => {
				const state = String(value ?? '').toLowerCase();
				const STATE_LABELS: Record<string, string> = {
					firing: t('pages:alertlist_state_firing', { defaultValue: 'Firing' }),
					inactive: t('pages:alertlist_state_ok', { defaultValue: 'OK' }),
					pending: t('pages:alertlist_state_pending', { defaultValue: 'Pending' }),
					disabled: t('pages:alertlist_state_disabled', {
						defaultValue: 'Disabled',
					}),
				};
				const config = STATE_CONFIG[state] ?? {
					color: 'secondary' as BadgeColor,
					label: t('pages:alertlist_state_unknown', { defaultValue: 'Unknown' }),
				};
				const label = STATE_LABELS[state] ?? config.label;
				return (
					<Badge
						color={config.color}
						variant="outline"
						testId={`alert-row-${row.id ?? ''}-state`}
					>
						{label}
					</Badge>
				);
			},
		},
		{
			id: 'name',
			header: t('pages:alertlist_col_alert_name', { defaultValue: 'Alert Name' }),
			accessorKey: 'alert',
			width: { default: '100%' },
			enableSort: true,
			enableRemove: false,
			enableMove: false,
			cell: ({ row, value }): JSX.Element => (
				<TanStackTable.Text
					title={value}
					data-testid={`alert-row-${row.id ?? ''}-name`}
				>
					{String(value ?? '-')}
				</TanStackTable.Text>
			),
		},
		{
			id: 'severity',
			header: t('pages:alertlist_col_severity', { defaultValue: 'Severity' }),
			accessorFn: (row) => row.labels?.severity ?? '',
			width: { fixed: '120px' },
			enableSort: true,
			enableMove: false,
			cell: ({ row, value }): JSX.Element => {
				const severity = String(value ?? '').toLowerCase();
				if (!severity) {
					return (
						<TanStackTable.Text data-testid={`alert-row-${row.id ?? ''}-severity`}>
							-
						</TanStackTable.Text>
					);
				}
				return (
					<Badge
						color={SEVERITY_BADGE_COLORS[severity] ?? 'secondary'}
						variant="outline"
						testId={`alert-row-${row.id ?? ''}-severity`}
					>
						{severity}
					</Badge>
				);
			},
		},
		{
			id: 'labels',
			header: t('pages:alertlist_col_labels', { defaultValue: 'Labels' }),
			accessorKey: 'labels',
			width: { default: '100%' },
			enableSort: false,
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
		{
			id: 'createdAt',
			header: t('pages:alertlist_col_created_at', { defaultValue: 'Created At' }),
			accessorKey: 'createdAt',
			width: { default: '100%' },
			enableSort: true,
			enableMove: false,
			defaultVisibility: false,
			cell: ({ value }): JSX.Element => (
				<TanStackTable.Text>
					{value
						? formatTimezoneAdjustedTimestamp(String(value), DATE_TIME_FORMATS.UTC_US)
						: '-'}
				</TanStackTable.Text>
			),
		},
		{
			id: 'createdBy',
			header: t('pages:alertlist_col_created_by', { defaultValue: 'Created By' }),
			accessorKey: 'createdBy',
			width: { default: '100%' },
			enableSort: false,
			enableMove: false,
			defaultVisibility: false,
			cell: ({ value }): JSX.Element => (
				<TanStackTable.Text>{String(value ?? '-')}</TanStackTable.Text>
			),
		},
		{
			id: 'updatedAt',
			header: t('pages:alertlist_col_updated_at', { defaultValue: 'Updated At' }),
			accessorKey: 'updatedAt',
			width: { default: '100%' },
			enableSort: true,
			enableMove: false,
			defaultVisibility: false,
			cell: ({ value }): JSX.Element => (
				<TanStackTable.Text>
					{value
						? formatTimezoneAdjustedTimestamp(String(value), DATE_TIME_FORMATS.UTC_US)
						: '-'}
				</TanStackTable.Text>
			),
		},
		{
			id: 'updatedBy',
			header: t('pages:alertlist_col_updated_by', { defaultValue: 'Updated By' }),
			accessorKey: 'updatedBy',
			width: { default: '100%' },
			enableSort: false,
			enableMove: false,
			defaultVisibility: false,
			cell: ({ value }): JSX.Element => (
				<TanStackTable.Text>{String(value ?? '-')}</TanStackTable.Text>
			),
		},
	];
}
