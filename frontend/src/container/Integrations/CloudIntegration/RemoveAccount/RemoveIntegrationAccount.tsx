import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@signozhq/ui/button';
import { Modal } from 'antd/lib';
import logEvent from 'api/common/logEvent';
import { useDisconnectAccount } from 'api/generated/services/cloudintegration';
import { SOMETHING_WENT_WRONG } from 'constants/api';
import {
	INTEGRATION_TELEMETRY_EVENTS,
	INTEGRATION_TYPES,
} from 'container/Integrations/constants';
import { useNotifications } from 'hooks/useNotifications';
import { Unlink } from '@signozhq/icons';

import './RemoveIntegrationAccount.scss';

function RemoveIntegrationAccount({
	cloudProvider,
	accountId,
	onRemoveIntegrationAccountSuccess,
}: {
	cloudProvider: string;
	accountId: string;
	onRemoveIntegrationAccountSuccess: () => void;
}): JSX.Element {
	const { t } = useTranslation('pages');
	const { notifications } = useNotifications();
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleDisconnect = (): void => {
		setIsModalOpen(true);
	};

	const { mutate: disconnectAccount, isLoading: isRemoveIntegrationLoading } =
		useDisconnectAccount({
			mutation: {
				onSuccess: () => {
					onRemoveIntegrationAccountSuccess?.();
					setIsModalOpen(false);
				},
				onError: () => {
					notifications.error({
						message: SOMETHING_WENT_WRONG,
					});
				},
			},
		});
	const handleOk = (): void => {
		logEvent(INTEGRATION_TELEMETRY_EVENTS.INTEGRATION_ACCOUNT_REMOVED, {
			accountId,
			integration: cloudProvider,
		});
		disconnectAccount({
			pathParams: {
				cloudProvider,
				id: accountId,
			},
		});
	};

	const handleCancel = (): void => {
		setIsModalOpen(false);
	};

	return (
		<div className="remove-integration-account-container">
			<Button
				variant="solid"
				color="destructive"
				prefix={<Unlink size={14} />}
				onClick={handleDisconnect}
				disabled={isRemoveIntegrationLoading}
			>
				{t('intg_disconnect', { defaultValue: 'Disconnect' })}
			</Button>

			<Modal
				className="remove-integration-account-modal"
				open={isModalOpen}
				title={t('intg_remove_integration_modal_title', {
					defaultValue: 'Remove integration',
				})}
				onOk={handleOk}
				onCancel={handleCancel}
				okText={t('intg_remove_account', { defaultValue: 'Remove Account' })}
				okButtonProps={{
					danger: true,
					loading: isRemoveIntegrationLoading,
				}}
			>
				{cloudProvider === INTEGRATION_TYPES.AWS ? (
					<>
						{t('intg_remove_aws_account_body_1', {
							defaultValue:
								'Removing this account will remove all components created for sending telemetry to SigNoz in your AWS account within the next ~15 minutes (cloudformation stacks named signoz-integration-telemetry-collection in enabled regions).',
						})}{' '}
						<br />
						<br />
						{t('intg_remove_aws_account_body_2', {
							defaultValue:
								'After that, you can delete the cloudformation stack that was created manually when connecting this account.',
						})}
					</>
				) : (
					<>
						{t('intg_remove_azure_account_body_1', {
							defaultValue:
								'Removing this account will remove all components created for sending telemetry to SigNoz in your Azure subscription within the next ~15 minutes (deployment stack named signoz-integration-telemetry will be deleted automatically).',
						})}{' '}
						<br />
						<br />
						{t('intg_remove_azure_account_body_2', {
							defaultValue:
								"After that, you have to manually delete 'signoz-integration' deployment stack that was created while connecting this account (Takes ~20 minutes to delete).",
						})}
					</>
				)}
			</Modal>
		</div>
	);
}

export default RemoveIntegrationAccount;
