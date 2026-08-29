import { useTranslation } from 'react-i18next';
import { Trash2 } from '@signozhq/icons';
import { ConfirmDialog } from '@signozhq/ui/dialog';
import { Typography } from '@signozhq/ui/typography';
import ErrorInPlace from 'components/ErrorInPlace/ErrorInPlace';
import APIError from 'types/api/error';
import styles from './DeleteRoleModal.module.scss';
import { Callout } from '@signozhq/ui/callout';

interface DeleteRoleModalProps {
	isOpen: boolean;
	roleName: string;
	error: APIError | null;
	onCancel: () => void;
	onConfirm: () => Promise<boolean>;
}

function DeleteRoleModal({
	isOpen,
	roleName,
	error,
	onCancel,
	onConfirm,
}: DeleteRoleModalProps): JSX.Element {
	const { t } = useTranslation('pages');
	return (
		<ConfirmDialog
			open={isOpen}
			onOpenChange={(next): void => {
				if (!next) {
					onCancel();
				}
			}}
			title={t('cfg_delete_role', { defaultValue: "Delete Role" })}
			titleIcon={<Trash2 size={14} />}
			confirmText="Delete Role"
			confirmColor="destructive"
			cancelText={t('cfg_cancel', { defaultValue: "Cancel" })}
			onConfirm={onConfirm}
			onCancel={onCancel}
			disableOutsideClick
		>
			<Typography>
				{t('cfg_are_you_sure_you', { defaultValue: "Are you sure you want to delete the role" })}<strong>{roleName}</strong>? This
				action cannot be undone.
			</Typography>
			{error && (
				<Callout
					title={t('cfg_failed_to_delete_role', { defaultValue: "Failed to delete role" })}
					color="cherry"
					className={styles.errorCallout}
				>
					<ErrorInPlace error={error} height="auto" padding={0} />
				</Callout>
			)}
		</ConfirmDialog>
	);
}

export default DeleteRoleModal;
