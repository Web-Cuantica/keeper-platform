import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { useCopyToClipboard } from 'react-use';
import { Check, ChevronDown, Plus } from '@signozhq/icons';
import { Button } from '@signozhq/ui/button';
import { DropdownMenuSimple, type MenuItem } from '@signozhq/ui/dropdown-menu';
import { Input } from '@signozhq/ui/input';
import { toast } from '@signozhq/ui/sonner';
import {
	useCreateResetPasswordToken,
	useListUsers,
} from 'api/generated/services/users';
import EditMemberDrawer from 'components/EditMemberDrawer/EditMemberDrawer';
import ResetLinkDialog from 'components/EditMemberDrawer/ResetLinkDialog';
import InviteMembersModal from 'components/InviteMembersModal/InviteMembersModal';
import MembersTable, { MemberRow } from 'components/MembersTable/MembersTable';
import { DATE_TIME_FORMATS } from 'constants/dateTimeFormats';
import useUrlQuery from 'hooks/useUrlQuery';
import { useTimezone } from 'providers/Timezone';
import { toISOString } from 'utils/app';
import { getAbsoluteUrl } from 'utils/basePath';

import { FilterMode, MemberStatus, toMemberStatus } from './utils';

import './MembersSettings.styles.scss';

const PAGE_SIZE = 20;

function MembersSettings(): JSX.Element {
	const { t } = useTranslation('pages');
	const history = useHistory();
	const urlQuery = useUrlQuery();
	const { formatTimezoneAdjustedTimestamp } = useTimezone();
	const pageParam = parseInt(urlQuery.get('page') ?? '1', 10);
	const currentPage = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

	// TODO(nuqs): Replace with nuqs once the nuqs setup and integration is done - for search
	const [searchQuery, setSearchQuery] = useState('');
	const [filterMode, setFilterMode] = useState<FilterMode>(FilterMode.All);
	const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
	const [selectedMember, setSelectedMember] = useState<MemberRow | null>(null);

	// Estado del diálogo de link de invitación (reutilizado para B: copiar desde la fila,
	// y para A: mostrar el link justo tras crear la invitación)
	const [showResetLinkDialog, setShowResetLinkDialog] = useState(false);
	const [resetLink, setResetLink] = useState<string | null>(null);
	const [resetLinkExpiresAt, setResetLinkExpiresAt] = useState<string | null>(
		null,
	);
	const [hasCopiedResetLink, setHasCopiedResetLink] = useState(false);
	const [copyingMemberId, setCopyingMemberId] = useState<string | null>(null);

	const [, copyToClipboard] = useCopyToClipboard();
	const { mutateAsync: createResetToken } = useCreateResetPasswordToken();

	const { data: usersData, isLoading, refetch: refetchUsers } = useListUsers();

	const allMembers = useMemo(
		(): MemberRow[] =>
			(usersData?.data ?? []).map((user) => ({
				id: user.id,
				name: user.displayName,
				email: user.email ?? '',
				status: toMemberStatus(user.status ?? ''),
				joinedOn: toISOString(user.createdAt),
				updatedAt: toISOString(user?.updatedAt),
			})),
		[usersData],
	);

	const filteredMembers = useMemo((): MemberRow[] => {
		let result = allMembers;

		if (filterMode === FilterMode.Invited) {
			result = result.filter((m) => m.status === MemberStatus.Invited);
		} else if (filterMode === FilterMode.Deleted) {
			result = result.filter((m) => m.status === MemberStatus.Deleted);
		}

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			result = result.filter(
				(m) =>
					m?.name?.toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
			);
		}

		return result;
	}, [allMembers, filterMode, searchQuery]);

	// TODO(nuqs): Replace with nuqs once the nuqs setup and integration is done
	const setPage = useCallback(
		(page: number): void => {
			urlQuery.set('page', String(page));
			history.replace({ search: urlQuery.toString() });
		},
		[history, urlQuery],
	);

	useEffect(() => {
		if (filteredMembers.length === 0) {
			return;
		}
		const maxPage = Math.ceil(filteredMembers.length / PAGE_SIZE);
		if (currentPage > maxPage) {
			setPage(maxPage);
		}
		if (currentPage < 1) {
			setPage(1);
		}
	}, [filteredMembers.length, currentPage, setPage]);

	const pendingCount = allMembers.filter(
		(m) => m.status === MemberStatus.Invited,
	).length;
	const deletedCount = allMembers.filter(
		(m) => m.status === MemberStatus.Deleted,
	).length;
	const totalCount = allMembers.length;

	const allLabel = t('mbr_filter_all', { defaultValue: 'All members' });
	const pendingLabel = t('mbr_filter_pending', {
		defaultValue: 'Pending invites',
	});
	const deletedLabel = t('mbr_filter_deleted', { defaultValue: 'Deleted' });

	const filterMenuItems: MenuItem[] = [
		{
			key: FilterMode.All,
			label: (
				<div className="members-filter-option">
					<span>
						{allLabel} ⎯ {totalCount}
					</span>
					{filterMode === FilterMode.All && <Check size={14} />}
				</div>
			),
			onClick: (): void => {
				setFilterMode(FilterMode.All);
				setPage(1);
			},
		},
		{
			key: FilterMode.Invited,
			label: (
				<div className="members-filter-option">
					<span>
						{pendingLabel} ⎯ {pendingCount}
					</span>
					{filterMode === FilterMode.Invited && <Check size={14} />}
				</div>
			),
			onClick: (): void => {
				setFilterMode(FilterMode.Invited);
				setPage(1);
			},
		},
		{
			key: FilterMode.Deleted,
			label: (
				<div className="members-filter-option">
					<span>
						{deletedLabel} ⎯ {deletedCount}
					</span>
					{filterMode === FilterMode.Deleted && <Check size={14} />}
				</div>
			),
			onClick: (): void => {
				setFilterMode(FilterMode.Deleted);
				setPage(1);
			},
		},
	];

	const filterLabel =
		filterMode === FilterMode.All
			? `${allLabel} ⎯ ${totalCount}`
			: filterMode === FilterMode.Invited
				? `${pendingLabel} ⎯ ${pendingCount}`
				: `${deletedLabel} ⎯ ${deletedCount}`;

	// Genera un link de invitación para un miembro pendiente y abre el diálogo.
	// Si autoCopy=true (botón "Copiar link" de la fila) copia al portapapeles de una vez.
	const generateAndShowLink = useCallback(
		async (memberId: string, autoCopy: boolean): Promise<void> => {
			setCopyingMemberId(memberId);
			try {
				const response = await createResetToken({ pathParams: { id: memberId } });
				if (response?.data?.token) {
					const link = getAbsoluteUrl(
						`/password-reset?token=${response.data.token}`,
					);
					setResetLink(link);
					setResetLinkExpiresAt(
						response.data.expiresAt
							? formatTimezoneAdjustedTimestamp(
									String(response.data.expiresAt),
									DATE_TIME_FORMATS.DASH_DATETIME,
								)
							: null,
					);
					if (autoCopy) {
						copyToClipboard(link);
						setHasCopiedResetLink(true);
						toast.success(
							t('mbr_invite_link_copied', {
								defaultValue: 'Invite link copied to clipboard',
							}),
							{ position: 'top-right' },
						);
					} else {
						setHasCopiedResetLink(false);
					}
					setShowResetLinkDialog(true);
				} else {
					toast.error(
						t('mbr_generate_link_failed', { defaultValue: 'Failed to generate link' }),
						{ position: 'top-right' },
					);
				}
			} catch {
				toast.error(
					t('mbr_generate_link_failed', { defaultValue: 'Failed to generate link' }),
					{ position: 'top-right' },
				);
			} finally {
				setCopyingMemberId(null);
			}
		},
		[createResetToken, formatTimezoneAdjustedTimestamp, copyToClipboard, t],
	);

	// B) Copiar el link de invitación desde la fila del miembro pendiente
	const handleCopyInviteLink = useCallback(
		(member: MemberRow): void => {
			void generateAndShowLink(member.id, true);
		},
		[generateAndShowLink],
	);

	// A) Tras invitar: refresca la lista y, si fue un único invitado, muestra su link
	// de inmediato; si fueron varios, lleva al filtro de pendientes donde cada uno
	// tiene su botón "Copiar link".
	const handleInviteComplete = useCallback(
		async (invitedEmails: string[]): Promise<void> => {
			const result = await refetchUsers();
			const users = result.data?.data ?? [];
			const pendingInvited = users.filter(
				(u) =>
					invitedEmails.includes(u.email ?? '') &&
					toMemberStatus(u.status ?? '') === MemberStatus.Invited,
			);
			if (pendingInvited.length === 1) {
				void generateAndShowLink(pendingInvited[0].id, false);
			} else if (pendingInvited.length > 1) {
				setFilterMode(FilterMode.Invited);
				setPage(1);
			}
		},
		[refetchUsers, generateAndShowLink, setPage],
	);

	const handleCopyResetLink = useCallback((): void => {
		if (!resetLink) {
			return;
		}
		copyToClipboard(resetLink);
		setHasCopiedResetLink(true);
	}, [resetLink, copyToClipboard]);

	const handleRowClick = useCallback((member: MemberRow): void => {
		setSelectedMember(member);
	}, []);

	const handleDrawerClose = useCallback((): void => {
		setSelectedMember(null);
	}, []);

	const handleMemberEditComplete = useCallback((): void => {
		void refetchUsers();
	}, [refetchUsers]);

	return (
		<div className="members-settings-page">
			<div className="members-settings">
				<div className="members-settings__header">
					<h1 className="members-settings__title">
						{t('mbr_title', { defaultValue: 'Members' })}
					</h1>
					<p className="members-settings__subtitle">
						{t('mbr_subtitle', {
							defaultValue: 'Overview of people added to this workspace.',
						})}
					</p>
				</div>

				<div className="members-settings__controls">
					<DropdownMenuSimple
						menu={{ items: filterMenuItems }}
						className="members-filter-dropdown"
					>
						<Button
							variant="solid"
							color="secondary"
							className="members-filter-trigger"
						>
							<span>{filterLabel}</span>
							<ChevronDown size={12} className="members-filter-trigger__chevron" />
						</Button>
					</DropdownMenuSimple>

					<div className="members-settings__search">
						<Input
							type="search"
							placeholder={t('mbr_search_placeholder', {
								defaultValue: 'Search by name or email...',
							})}
							value={searchQuery}
							onChange={(e): void => {
								setSearchQuery(e.target.value);
								setPage(1);
							}}
							className="members-search-input"
							name="members-search"
						/>
					</div>

					<Button
						variant="solid"
						color="primary"
						onClick={(): void => setIsInviteModalOpen(true)}
					>
						<Plus size={12} />
						{t('mbr_invite', { defaultValue: 'Invite member' })}
					</Button>
				</div>
			</div>
			<MembersTable
				data={filteredMembers}
				loading={isLoading}
				total={filteredMembers.length}
				currentPage={currentPage}
				pageSize={PAGE_SIZE}
				searchQuery={searchQuery}
				onPageChange={setPage}
				onRowClick={handleRowClick}
				onCopyInviteLink={handleCopyInviteLink}
				copyingMemberId={copyingMemberId}
			/>

			<InviteMembersModal
				open={isInviteModalOpen}
				onClose={(): void => setIsInviteModalOpen(false)}
				onComplete={handleInviteComplete}
			/>

			<EditMemberDrawer
				member={selectedMember}
				open={selectedMember !== null}
				onClose={handleDrawerClose}
				onComplete={handleMemberEditComplete}
			/>

			<ResetLinkDialog
				open={showResetLinkDialog}
				linkType="invite"
				resetLink={resetLink}
				expiresAt={resetLinkExpiresAt}
				hasCopied={hasCopiedResetLink}
				onClose={(): void => setShowResetLinkDialog(false)}
				onCopy={handleCopyResetLink}
			/>
		</div>
	);
}

export default MembersSettings;
