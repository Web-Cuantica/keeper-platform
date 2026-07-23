import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'antd';
import { Typography } from '@signozhq/ui/typography';
import { Loader, Trash2, X } from '@signozhq/icons';

import { DeleteRoutingPolicyProps } from './types';

function DeleteRoutingPolicy({
	handleClose,
	handleDelete,
	routingPolicy,
	isDeletingRoutingPolicy,
}: DeleteRoutingPolicyProps): JSX.Element {
	const { t } = useTranslation('pages');
	const deleteButtonIcon = isDeletingRoutingPolicy ? (
		<Loader size={16} />
	) : (
		<Trash2 size={16} />
	);

	return (
		<Modal
			className="delete-policy-modal"
			title={<span className="title">{t('cfg_delete_routing_policy', { defaultValue: "Delete Routing Policy" })}</span>}
			open
			closable={false}
			onCancel={handleClose}
			footer={[
				<Button
					key="cancel"
					onClick={handleClose}
					className="cancel-btn"
					icon={<X size={16} />}
					disabled={isDeletingRoutingPolicy}
				>
					{t('cfg_cancel', { defaultValue: "Cancel" })}
				</Button>,
				<Button
					key="submit"
					type="primary"
					icon={deleteButtonIcon}
					onClick={handleDelete}
					className="delete-btn"
					disabled={isDeletingRoutingPolicy}
				>
					{t('cfg_delete_routing_policy', { defaultValue: "Delete Routing Policy" })}
				</Button>,
			]}
		>
			<Typography.Text className="delete-text">
				{t('cfg_are_you_sure_you_2', { defaultValue: "Are you sure you want to delete" })}<strong>{routingPolicy?.name}</strong>{' '}
				routing policy? Deleting a routing policy is irreversible and cannot be
				undone.
			</Typography.Text>
		</Modal>
	);
}

export default DeleteRoutingPolicy;
