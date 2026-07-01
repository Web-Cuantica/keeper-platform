import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { Button, Modal } from 'antd';
import { Typography } from '@signozhq/ui/typography';
import logEvent from 'api/common/logEvent';
import unInstallIntegration from 'api/Integrations/uninstallIntegration';
import { SOMETHING_WENT_WRONG } from 'constants/api';
import { useNotifications } from 'hooks/useNotifications';
import { X } from '@signozhq/icons';

import { INTEGRATION_TELEMETRY_EVENTS } from '../constants';
import { ConnectionStates } from './TestConnection';

import './IntegrationDetailPage.styles.scss';

interface IntergrationsUninstallBarProps {
	integrationTitle: string;
	integrationId: string;
	onUnInstallSuccess: () => void;
	connectionStatus: ConnectionStates;
	removeIntegrationTitle?: string;
}
function IntergrationsUninstallBar(
	props: IntergrationsUninstallBarProps,
): JSX.Element {
	const {
		integrationTitle,
		integrationId,
		onUnInstallSuccess,
		connectionStatus,
		removeIntegrationTitle,
	} = props;
	const { t } = useTranslation('pages');
	const { notifications } = useNotifications();
	const [isModalOpen, setIsModalOpen] = useState(false);

	const resolvedRemoveIntegrationTitle =
		removeIntegrationTitle ??
		t('intg_remove_from_signoz', { defaultValue: 'Remove from SigNoz' });

	const { mutate: uninstallIntegration, isLoading: isUninstallLoading } =
		useMutation(unInstallIntegration, {
			onSuccess: () => {
				onUnInstallSuccess?.();
				setIsModalOpen(false);
			},
			onError: () => {
				notifications.error({
					message: SOMETHING_WENT_WRONG,
				});
			},
		});

	const showModal = (): void => {
		setIsModalOpen(true);
	};

	const handleOk = (): void => {
		logEvent(
			INTEGRATION_TELEMETRY_EVENTS.INTEGRATIONS_DETAIL_REMOVE_INTEGRATION,
			{
				integration: integrationId,
				integrationStatus: connectionStatus,
			},
		);
		uninstallIntegration({
			integration_id: integrationId,
		});
	};

	const handleCancel = (): void => {
		setIsModalOpen(false);
	};
	return (
		<div className="uninstall-integration-bar">
			<div className="unintall-integration-bar-text">
				<Typography.Text className="heading">
					{t('intg_remove_integration', { defaultValue: 'Remove Integration' })}
				</Typography.Text>
				<Typography.Text className="subtitle">
					{t('intg_remove_integration_subtitle', {
						defaultValue:
							'Removing the {{title}} integration would make your workspace stop listening for data from {{title}} instances.',
						title: integrationTitle,
					})}
				</Typography.Text>
			</div>
			<Button
				className="uninstall-integration-btn"
				icon={<X size={14} />}
				onClick={(): void => showModal()}
			>
				{resolvedRemoveIntegrationTitle}
			</Button>
			<Modal
				className="remove-integration-modal"
				open={isModalOpen}
				title={t('intg_remove_integration_modal_title', {
					defaultValue: 'Remove integration',
				})}
				onOk={handleOk}
				onCancel={handleCancel}
				okText={t('intg_remove_integration', { defaultValue: 'Remove Integration' })}
				okButtonProps={{
					danger: true,
					disabled: isUninstallLoading,
				}}
			>
				<Typography.Text className="remove-integration-text">
					{t('intg_remove_integration_modal_body', {
						defaultValue:
							'Removing this integration makes SigNoz stop listening for data from {{title}} instances. You would still have to manually remove the configuration in your code to stop sending data.',
						title: integrationTitle,
					})}
				</Typography.Text>
			</Modal>
		</div>
	);
}

IntergrationsUninstallBar.defaultProps = {
	removeIntegrationTitle: 'Remove from SigNoz',
};

export default IntergrationsUninstallBar;
