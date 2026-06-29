import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { Ellipsis } from '@signozhq/icons';
import { Button } from '@signozhq/ui/button';
import { DropdownMenuSimple } from '@signozhq/ui/dropdown-menu';
import { toast } from '@signozhq/ui/sonner';
import { convertToApiError } from 'api/ErrorResponseHandlerForGeneratedAPIs';
import {
	createRule,
	deleteRuleByID,
	invalidateListRules,
	patchRuleByID,
} from 'api/generated/services/rules';
import type {
	RenderErrorResponseDTO,
	RuletypesPostableRuleDTO,
} from 'api/generated/services/sigNoz.schemas';
import type { AxiosError } from 'axios';

import type { AlertRule } from '../types';
import { ALERT_ACTIONS, alertActionLogEvent } from '../utils';
import styles from './ActionsMenu.module.scss';

interface ActionsMenuProps {
	rule: AlertRule;
	onEdit: (rule: AlertRule, options?: { newTab?: boolean }) => void;
	isLoading?: boolean;
}

function ActionsMenu({
	rule,
	onEdit,
	isLoading: externalLoading = false,
}: ActionsMenuProps): JSX.Element {
	const { t } = useTranslation('pages');
	const queryClient = useQueryClient();

	const handleToggle = useCallback((): void => {
		alertActionLogEvent(ALERT_ACTIONS.TOGGLE, rule);
		const newDisabled = !rule.disabled;
		toast.promise(
			patchRuleByID({ id: rule.id ?? '' }, {
				disabled: newDisabled,
			} as RuletypesPostableRuleDTO).then(() => invalidateListRules(queryClient)),
			{
				loading: newDisabled
					? t('pages:alertlist_toast_disabling', {
							defaultValue: 'Disabling alert...',
					  })
					: t('pages:alertlist_toast_enabling', {
							defaultValue: 'Enabling alert...',
					  }),
				success: newDisabled
					? t('pages:alertlist_toast_disabled', { defaultValue: 'Alert disabled' })
					: t('pages:alertlist_toast_enabled', { defaultValue: 'Alert enabled' }),
				error: (error): string => {
					const apiError = convertToApiError(
						error as AxiosError<RenderErrorResponseDTO>,
					);
					return (
						apiError?.getErrorMessage() ||
						t('pages:alertlist_toast_toggle_error', {
							defaultValue: 'Failed to toggle alert state',
						})
					);
				},
				position: 'top-right',
			},
		);
	}, [rule, queryClient, t]);

	const handleEdit = useCallback((): void => {
		alertActionLogEvent(ALERT_ACTIONS.EDIT, rule);
		onEdit(rule);
	}, [rule, onEdit]);

	const handleEditNewTab = useCallback((): void => {
		alertActionLogEvent(ALERT_ACTIONS.EDIT, rule);
		onEdit(rule, { newTab: true });
	}, [rule, onEdit]);

	const handleClone = useCallback((): void => {
		alertActionLogEvent(ALERT_ACTIONS.CLONE, rule);
		toast.promise(
			createRule({
				...rule,
				alert: `${rule.alert} - Copy`,
			} as RuletypesPostableRuleDTO).then(async (response) => {
				await invalidateListRules(queryClient);
				const newRule = response.data;
				if (newRule) {
					onEdit(newRule as AlertRule);
				}
			}),
			{
				loading: t('pages:alertlist_toast_cloning', {
					defaultValue: 'Cloning alert...',
				}),
				success: t('pages:alertlist_toast_cloned', {
					defaultValue: 'Alert cloned successfully',
				}),
				error: (error): string => {
					const apiError = convertToApiError(
						error as AxiosError<RenderErrorResponseDTO>,
					);
					return (
						apiError?.getErrorMessage() ||
						t('pages:alertlist_toast_clone_error', {
							defaultValue: 'Failed to clone alert',
						})
					);
				},
				position: 'top-right',
			},
		);
	}, [rule, queryClient, onEdit, t]);

	const handleDelete = useCallback((): void => {
		alertActionLogEvent(ALERT_ACTIONS.DELETE, rule);
		toast.promise(
			deleteRuleByID({ id: rule.id ?? '' }).then(() =>
				invalidateListRules(queryClient),
			),
			{
				loading: t('pages:alertlist_toast_deleting', {
					defaultValue: 'Deleting alert...',
				}),
				success: t('pages:alertlist_toast_deleted', {
					defaultValue: 'Alert deleted successfully',
				}),
				error: (error): string => {
					const apiError = convertToApiError(
						error as AxiosError<RenderErrorResponseDTO>,
					);
					return (
						apiError?.getErrorMessage() ||
						t('pages:alertlist_toast_delete_error', {
							defaultValue: 'Failed to delete alert',
						})
					);
				},
				position: 'top-right',
			},
		);
	}, [rule, queryClient, t]);

	const menuItems = useMemo(
		() => [
			{
				key: 'toggle',
				label: rule.disabled
					? t('pages:alertlist_action_enable', { defaultValue: 'Enable' })
					: t('pages:alertlist_action_disable', { defaultValue: 'Disable' }),
				disabled: externalLoading,
				onClick: handleToggle,
			},
			{
				key: 'edit',
				label: t('pages:alertlist_action_edit', { defaultValue: 'Edit' }),
				disabled: externalLoading,
				onClick: handleEdit,
			},
			{
				key: 'edit-new-tab',
				label: t('pages:alertlist_action_edit_new_tab', {
					defaultValue: 'Edit in New Tab',
				}),
				disabled: externalLoading,
				onClick: handleEditNewTab,
			},
			{
				key: 'clone',
				label: t('pages:alertlist_action_clone', { defaultValue: 'Clone' }),
				disabled: externalLoading,
				onClick: handleClone,
			},
			{ key: 'divider', type: 'divider' as const },
			{
				key: 'delete',
				label: t('pages:alertlist_action_delete', { defaultValue: 'Delete' }),
				disabled: externalLoading,
				danger: true,
				onClick: handleDelete,
			},
		],
		[
			rule.disabled,
			externalLoading,
			handleToggle,
			handleEdit,
			handleEditNewTab,
			handleClone,
			handleDelete,
			t,
		],
	);

	const handleClick = (e: React.MouseEvent): void => {
		e.stopPropagation();
	};

	return (
		// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
		<div onClick={handleClick}>
			<DropdownMenuSimple menu={{ items: menuItems }} align="end">
				<Button
					variant="outlined"
					color="secondary"
					size="icon"
					className={styles.actionButton}
					data-testid="alert-actions"
				>
					<Ellipsis size={16} />
				</Button>
			</DropdownMenuSimple>
		</div>
	);
}

export default ActionsMenu;
