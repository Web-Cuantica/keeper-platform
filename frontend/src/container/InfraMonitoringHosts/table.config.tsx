import React from 'react';
import type { TFunction } from 'i18next';
import { Tooltip } from 'antd';
import { Badge } from '@signozhq/ui/badge';
import { HostData } from 'api/infraMonitoring/getHostLists';
import TanStackTable, { TableColumnDef } from 'components/TanStackTableView';
import { getGroupByEl } from 'container/InfraMonitoringK8s/Base/utils';
import {
	EntityProgressBar,
	ExpandButtonWrapper,
	ValidateColumnValueWrapper,
} from 'container/InfraMonitoringK8s/components';
import { InfraMonitoringEntity } from 'container/InfraMonitoringK8s/constants';
import { useInfraMonitoringGroupBy } from 'container/InfraMonitoringK8s/hooks';
import EntityGroupHeader from 'container/InfraMonitoringK8s/Base/EntityGroupHeader';

import { HostnameCell } from './utils';

import styles from './table.module.scss';
import { Container, Info } from '@signozhq/icons';

function hostRowSource(host: HostData): { meta: Record<string, string> } {
	return {
		meta: {
			...(host.meta ?? {}),
			host_name: host.hostName ?? '',
			'host.name': host.hostName ?? '',
			os_type: host.os ?? '',
			'os.type': host.os ?? '',
		},
	};
}

export function getHostRowKey(host: HostData): string {
	return host.hostName || 'unknown';
}

export function getHostItemKey(host: HostData): string {
	return host.hostName ?? '';
}

function HostGroupCell({ row }: { row: HostData }): JSX.Element {
	const [groupBy] = useInfraMonitoringGroupBy();
	const synthetic = hostRowSource(row);
	return getGroupByEl(synthetic, groupBy) as JSX.Element;
}

// Construye las columnas en tiempo de render con `t` disponible para traducir
// los encabezados y tooltips (no debe evaluarse en useState).
export const getHostColumnsConfig = (
	t: TFunction,
): TableColumnDef<HostData>[] => [
	{
		id: 'hostGroup',
		header: (): React.ReactNode => (
			<EntityGroupHeader
				title={t('pages:infra_col_host_group', { defaultValue: 'HOST GROUP' })}
			/>
		),
		accessorFn: (row): string => row.hostName ?? '',
		width: { min: 300 },
		enableSort: false,
		enableRemove: false,
		enableMove: false,
		pin: 'left',
		visibilityBehavior: 'hidden-on-collapse',
		cell: ({ row, isExpanded, toggleExpanded }): React.ReactNode => (
			<ExpandButtonWrapper isExpanded={isExpanded} toggleExpanded={toggleExpanded}>
				<HostGroupCell row={row} />
			</ExpandButtonWrapper>
		),
	},
	{
		id: 'hostName',
		header: (): React.ReactNode => (
			<EntityGroupHeader
				title={t('pages:infra_col_hostname', { defaultValue: 'Hostname' })}
				icon={<Container size={14} />}
			/>
		),
		accessorFn: (row): string => row.hostName ?? '',
		width: { min: 290 },
		enableSort: false,
		enableRemove: false,
		enableMove: false,
		pin: 'left',
		visibilityBehavior: 'hidden-on-expand',
		cell: ({ value }): React.ReactNode => (
			<HostnameCell hostName={value as string} />
		),
	},
	{
		id: 'active',
		header: (): React.ReactNode => (
			<div className={styles.statusHeader}>
				{t('pages:infra_col_status', { defaultValue: 'Status' })}
				<Tooltip
					title={t('pages:infra_status_tooltip', {
						defaultValue: 'Sent system metrics in last 10 mins',
					})}
				>
					<Info size="md" />
				</Tooltip>
			</div>
		),
		accessorFn: (row): boolean => row.active,
		width: { min: 150, default: 150 },
		enableSort: false,
		cell: ({ value }): React.ReactNode => {
			const active = value as boolean;
			return (
				<Badge
					className={`${styles.statusTag} ${
						active ? styles.statusTagActive : styles.statusTagInactive
					}`}
				>
					{active
						? t('pages:infra_status_active', { defaultValue: 'ACTIVE' })
						: t('pages:infra_status_inactive', { defaultValue: 'INACTIVE' })}
				</Badge>
			);
		},
	},
	{
		id: 'cpu',
		header: (): React.ReactNode => (
			<div className={styles.columnHeaderRight}>
				{t('pages:infra_col_cpu_usage', { defaultValue: 'CPU Usage' })}
			</div>
		),
		accessorFn: (row): number => row.cpu,
		width: { min: 220 },
		enableSort: true,
		cell: ({ value }): React.ReactNode => {
			const cpu = value as number;
			return (
				<div className={styles.progressContainer}>
					<ValidateColumnValueWrapper
						value={cpu}
						entity={InfraMonitoringEntity.HOSTS}
						attribute="CPU metric"
					>
						<EntityProgressBar value={cpu} type="cpu" />
					</ValidateColumnValueWrapper>
				</div>
			);
		},
	},
	{
		id: 'memory',
		header: (): React.ReactNode => (
			<div className={`${styles.columnHeaderRight} ${styles.memoryUsageHeader}`}>
				{t('pages:infra_col_memory_usage', { defaultValue: 'Memory Usage' })}
				<Tooltip
					title={t('pages:infra_memory_tooltip', {
						defaultValue: 'Excluding cache memory',
					})}
				>
					<Info size="md" />
				</Tooltip>
			</div>
		),
		accessorFn: (row): number => row.memory,
		width: { min: 220 },
		enableSort: true,
		cell: ({ value }): React.ReactNode => {
			const memory = value as number;
			return (
				<div className={styles.progressContainer}>
					<ValidateColumnValueWrapper
						value={memory}
						entity={InfraMonitoringEntity.HOSTS}
						attribute="memory metric"
					>
						<EntityProgressBar value={memory} type="memory" />
					</ValidateColumnValueWrapper>
				</div>
			);
		},
	},
	{
		id: 'diskUsage',
		header: (): React.ReactNode => (
			<div className={styles.columnHeaderRight}>
				{t('pages:infra_col_disk', { defaultValue: 'Disk Usage' })}
			</div>
		),
		accessorFn: (row): number => row.diskUsage,
		width: { min: 220 },
		enableSort: true,
		cell: ({ value }): React.ReactNode => {
			const disk = value as number;
			return (
				<div className={styles.progressContainer}>
					<ValidateColumnValueWrapper
						value={disk}
						entity={InfraMonitoringEntity.HOSTS}
						attribute="disk metric"
					>
						<EntityProgressBar value={disk} type="disk" />
					</ValidateColumnValueWrapper>
				</div>
			);
		},
	},
	{
		id: 'wait',
		header: (): React.ReactNode => (
			<div className={styles.columnHeaderRight}>
				{t('pages:infra_col_iowait', { defaultValue: 'IOWait' })}
			</div>
		),
		accessorFn: (row): number => row.wait,
		width: { min: 100, default: 100 },
		enableSort: true,
		cell: ({ value }): React.ReactNode => {
			const wait = value as number;

			return (
				<ValidateColumnValueWrapper
					value={wait}
					entity={InfraMonitoringEntity.HOSTS}
					attribute="IOWait metric"
				>
					<TanStackTable.Text>{`${Number((wait * 100).toFixed(1))}%`}</TanStackTable.Text>
				</ValidateColumnValueWrapper>
			);
		},
	},
	{
		id: 'load15',
		header: (): React.ReactNode => (
			<div className={styles.columnHeaderRight}>
				{t('pages:infra_col_load_avg', { defaultValue: 'Load Avg' })}
			</div>
		),
		accessorFn: (row): number => row.load15,
		width: { min: 100, default: 100 },
		enableSort: true,
		cell: ({ value }): React.ReactNode => {
			const load15 = value as number;

			return (
				<ValidateColumnValueWrapper
					value={load15}
					entity={InfraMonitoringEntity.HOSTS}
					attribute="load average metric"
				>
					<TanStackTable.Text>{load15}</TanStackTable.Text>
				</ValidateColumnValueWrapper>
			);
		},
	},
];
