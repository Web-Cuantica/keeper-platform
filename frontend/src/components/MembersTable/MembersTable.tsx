import type React from 'react';
import { useTranslation } from 'react-i18next';
import { Copy } from '@signozhq/icons';
import { Badge } from '@signozhq/ui/badge';
import { Button } from '@signozhq/ui/button';
import { Spin, Table, Tooltip } from 'antd';
import type { ColumnsType, SorterResult } from 'antd/es/table/interface';
import { DATE_TIME_FORMATS } from 'constants/dateTimeFormats';
import { MemberStatus } from 'container/MembersSettings/utils';
import { useTimezone } from 'providers/Timezone';

import './MembersTable.styles.scss';

export interface MemberRow {
	id: string;
	name?: string;
	email: string;
	status: MemberStatus;
	joinedOn: string | null;
	updatedAt?: string | null;
}

interface MembersTableProps {
	data: MemberRow[];
	loading: boolean;
	total: number;
	currentPage: number;
	pageSize: number;
	searchQuery: string;
	onPageChange: (page: number) => void;
	onRowClick?: (member: MemberRow) => void;
	onSortChange?: (
		sorter: SorterResult<MemberRow> | SorterResult<MemberRow>[],
	) => void;
	// Copia el link de invitación de un miembro pendiente (solo aplica a INVITADO)
	onCopyInviteLink?: (member: MemberRow) => void;
	// Id del miembro cuyo link se está generando en este momento (para el spinner)
	copyingMemberId?: string | null;
}

function NameEmailCell({
	name,
	email,
}: {
	name?: string;
	email: string;
}): JSX.Element {
	return (
		<div className="member-name-email-cell">
			{name && (
				<span className="member-name" title={name}>
					{name}
				</span>
			)}
			<Tooltip title={email} overlayClassName="member-tooltip">
				<span className="member-email">{email}</span>
			</Tooltip>
		</div>
	);
}

function StatusBadge({ status }: { status: MemberRow['status'] }): JSX.Element {
	const { t } = useTranslation('pages');
	if (status === MemberStatus.Active) {
		return (
			<Badge color="forest" variant="outline">
				{t('mbr_status_active', { defaultValue: 'ACTIVE' })}
			</Badge>
		);
	}
	if (status === MemberStatus.Deleted) {
		return (
			<Badge color="cherry" variant="outline">
				{t('mbr_status_deleted', { defaultValue: 'DELETED' })}
			</Badge>
		);
	}

	if (status === MemberStatus.Invited) {
		return (
			<Badge color="amber" variant="outline">
				{t('mbr_status_invited', { defaultValue: 'INVITED' })}
			</Badge>
		);
	}

	return <Badge color="vanilla">⎯</Badge>;
}

function MembersEmptyState({
	searchQuery,
}: {
	searchQuery: string;
}): JSX.Element {
	const { t } = useTranslation('pages');
	return (
		<div className="members-empty-state">
			<span
				className="members-empty-state__emoji"
				role="img"
				aria-label="monocle face"
			>
				🧐
			</span>
			{searchQuery ? (
				<p className="members-empty-state__text">
					{t('mbr_empty_search', { defaultValue: 'No results for' })}{' '}
					<strong>{searchQuery}</strong>
				</p>
			) : (
				<p className="members-empty-state__text">
					{t('mbr_empty', { defaultValue: 'No members found' })}
				</p>
			)}
		</div>
	);
}

function MembersTable({
	data,
	loading,
	total,
	currentPage,
	pageSize,
	searchQuery,
	onPageChange,
	onRowClick,
	onSortChange,
	onCopyInviteLink,
	copyingMemberId,
}: MembersTableProps): JSX.Element {
	const { t } = useTranslation('pages');
	const { formatTimezoneAdjustedTimestamp } = useTimezone();

	const formatJoinedOn = (date: string | null): string => {
		if (!date) {
			return '—';
		}
		const d = new Date(date);
		if (Number.isNaN(d.getTime())) {
			return '—';
		}
		return formatTimezoneAdjustedTimestamp(date, DATE_TIME_FORMATS.DASH_DATETIME);
	};

	const columns: ColumnsType<MemberRow> = [
		{
			title: t('mbr_col_name_email', { defaultValue: 'Name / Email' }),
			dataIndex: 'name',
			key: 'name',
			sorter: (a, b): number => a.email.localeCompare(b.email),
			render: (_, record): JSX.Element => (
				<NameEmailCell name={record.name} email={record.email} />
			),
		},
		{
			title: t('mbr_col_status', { defaultValue: 'Status' }),
			dataIndex: 'status',
			key: 'status',
			width: 100,
			align: 'right' as const,
			className: 'member-status-cell',
			sorter: (a, b): number => a.status.localeCompare(b.status),
			render: (status: MemberRow['status']): JSX.Element => (
				<StatusBadge status={status} />
			),
		},
		{
			title: t('mbr_col_joined', { defaultValue: 'Joined On' }),
			dataIndex: 'joinedOn',
			key: 'joinedOn',
			width: 250,
			align: 'right' as const,
			sorter: (a, b): number => {
				if (!a.joinedOn && !b.joinedOn) {
					return 0;
				}
				if (!a.joinedOn) {
					return 1;
				}
				if (!b.joinedOn) {
					return -1;
				}
				return new Date(a.joinedOn).getTime() - new Date(b.joinedOn).getTime();
			},
			render: (joinedOn: string | null): JSX.Element => {
				const formatted = formatJoinedOn(joinedOn);
				const isDash = formatted === '—';
				return (
					<span className={isDash ? 'member-joined-dash' : 'member-joined-date'}>
						{formatted}
					</span>
				);
			},
		},
	];

	// Columna de acción: botón "Copiar link de invitación" solo para miembros INVITADO
	if (onCopyInviteLink) {
		columns.push({
			title: '',
			key: 'actions',
			width: 56,
			align: 'right' as const,
			className: 'member-actions-cell',
			render: (_, record): JSX.Element | null => {
				if (record.status !== MemberStatus.Invited) {
					return null;
				}
				const isCopying = copyingMemberId === record.id;
				return (
					<Tooltip
						title={t('mbr_copy_invite_link', {
							defaultValue: 'Copy invite link',
						})}
					>
						<Button
							variant="ghost"
							color="secondary"
							className="member-copy-invite-btn"
							disabled={isCopying}
							aria-label={t('mbr_copy_invite_link', {
								defaultValue: 'Copy invite link',
							})}
							onClick={(e): void => {
								// Evita disparar el onRowClick (abrir el drawer) al copiar
								e.stopPropagation();
								onCopyInviteLink(record);
							}}
						>
							{isCopying ? <Spin size="small" /> : <Copy size={14} />}
						</Button>
					</Tooltip>
				);
			},
		});
	}

	const showPaginationTotal = (_total: number, range: number[]): JSX.Element => (
		<>
			<span className="members-pagination-range">
				{range[0]} &#8212; {range[1]}
			</span>
			<span className="members-pagination-total">
				{' '}
				{t('mbr_pagination_of', { defaultValue: 'of' })} {_total}
			</span>
		</>
	);

	return (
		<div className="members-table-wrapper">
			<Table<MemberRow>
				columns={columns}
				dataSource={data}
				rowKey="id"
				loading={loading}
				pagination={{
					current: currentPage,
					pageSize,
					total,
					showTotal: showPaginationTotal,
					showSizeChanger: false,
					onChange: onPageChange,
					className: 'members-table-pagination',
					hideOnSinglePage: true,
				}}
				rowClassName={(_, index): string =>
					index % 2 === 0 ? 'members-table-row--tinted' : ''
				}
				onRow={(record): React.HTMLAttributes<HTMLElement> => {
					const isClickable = !!onRowClick;
					return {
						onClick: (): void => {
							if (isClickable) {
								onRowClick(record);
							}
						},
						style: isClickable ? { cursor: 'pointer' } : undefined,
					};
				}}
				onChange={(_, __, sorter): void => {
					if (onSortChange) {
						onSortChange(
							sorter as SorterResult<MemberRow> | SorterResult<MemberRow>[],
						);
					}
				}}
				showSorterTooltip={false}
				locale={{
					emptyText: <MembersEmptyState searchQuery={searchQuery} />,
				}}
				className="members-table"
			/>
		</div>
	);
}

export default MembersTable;
