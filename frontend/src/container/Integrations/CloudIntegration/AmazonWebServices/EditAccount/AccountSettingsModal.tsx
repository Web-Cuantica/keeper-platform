import { Dispatch, SetStateAction, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { Button } from '@signozhq/ui/button';
import { DrawerWrapper } from '@signozhq/ui/drawer';
import { Form } from 'antd';
import { invalidateListAccounts } from 'api/generated/services/cloudintegration';
import { INTEGRATION_TYPES } from 'container/Integrations/constants';
import { useAccountSettingsModal } from 'hooks/integration/aws/useAccountSettingsModal';
import useUrlQuery from 'hooks/useUrlQuery';
import history from 'lib/history';
import { Save } from '@signozhq/icons';

import logEvent from '../../../../../api/common/logEvent';
import RemoveIntegrationAccount from '../../RemoveAccount/RemoveIntegrationAccount';
import { RegionSelector } from '../RegionForm/RegionSelector';
import { CloudAccount } from '../types';

import './AccountSettingsModal.style.scss';

interface AccountSettingsModalProps {
	onClose: () => void;
	account: CloudAccount;
	setActiveAccount: Dispatch<SetStateAction<CloudAccount | null>>;
}

function AccountSettingsModal({
	onClose,
	account,
	setActiveAccount,
}: AccountSettingsModalProps): JSX.Element {
	const { t } = useTranslation('pages');
	const {
		form,
		isLoading,
		selectedRegions,
		includeAllRegions,
		isSaveDisabled,
		setSelectedRegions,
		setIncludeAllRegions,
		handleSubmit,
		handleClose,
	} = useAccountSettingsModal({ onClose, account, setActiveAccount });

	const queryClient = useQueryClient();
	const urlQuery = useUrlQuery();

	const handleRemoveIntegrationAccountSuccess = useCallback((): void => {
		void invalidateListAccounts(queryClient, {
			cloudProvider: INTEGRATION_TYPES.AWS,
		});
		urlQuery.delete('cloudAccountId');
		setActiveAccount(null);
		handleClose();
		history.replace({ search: urlQuery.toString() });

		logEvent('AWS Integration: Account removed', {
			id: account?.id,
			cloudAccountId: account?.cloud_account_id,
		});
	}, [
		queryClient,
		urlQuery,
		setActiveAccount,
		handleClose,
		account?.id,
		account?.cloud_account_id,
	]);

	const renderAccountDetails = useCallback(() => {
		return (
			<Form
				form={form}
				layout="vertical"
				initialValues={{
					selectedRegions,
					includeAllRegions,
				}}
			>
				<div className="account-settings-modal__body">
					<div className="account-settings-modal__body-account-info">
						<div className="account-settings-modal__body-account-info-connected-account-details">
							<div className="account-settings-modal__body-account-info-connected-account-details-title">
								{t('intg_connected_account_details', {
									defaultValue: 'Connected Account details',
								})}
							</div>
							<div className="account-settings-modal__body-account-info-connected-account-details-account-id">
								{t('intg_aws_account_label', { defaultValue: 'AWS Account:' })}{' '}
								<span className="account-settings-modal__body-account-info-connected-account-details-account-id-account-id">
									{account?.providerAccountId}
								</span>
							</div>
						</div>
					</div>

					<div className="account-settings-modal__body-region-selector">
						<div className="account-settings-modal__body-region-selector-title">
							{t('intg_which_regions_monitor', {
								defaultValue: 'Which regions do you want to monitor?',
							})}
						</div>
						<div className="account-settings-modal__body-region-selector-description">
							{t('intg_choose_regions_short', {
								defaultValue: 'Choose only the regions you want SigNoz to monitor.',
							})}
						</div>

						<RegionSelector
							selectedRegions={selectedRegions}
							setSelectedRegions={setSelectedRegions}
							setIncludeAllRegions={setIncludeAllRegions}
						/>
					</div>
				</div>
			</Form>
		);
	}, [
		form,
		selectedRegions,
		includeAllRegions,
		account?.providerAccountId,
		setSelectedRegions,
		setIncludeAllRegions,
		t,
	]);

	const handleDrawerOpenChange = useCallback(
		(open: boolean): void => {
			if (!open) {
				handleClose();
			}
		},
		[handleClose],
	);

	const footer = (
		<div className="account-settings-modal__footer">
			<RemoveIntegrationAccount
				accountId={account?.id}
				onRemoveIntegrationAccountSuccess={handleRemoveIntegrationAccountSuccess}
				cloudProvider={INTEGRATION_TYPES.AWS}
			/>

			<Button
				variant="solid"
				color="secondary"
				disabled={isSaveDisabled}
				onClick={handleSubmit}
				loading={isLoading}
				prefix={<Save size={14} />}
			>
				{t('intg_update_changes', { defaultValue: 'Update Changes' })}
			</Button>
		</div>
	);

	return (
		<DrawerWrapper
			open={true}
			className="account-settings-modal"
			title={t('intg_account_settings', { defaultValue: 'Account Settings' })}
			direction="right"
			showCloseButton
			onOpenChange={handleDrawerOpenChange}
			width="wide"
			footer={footer}
		>
			{renderAccountDetails()}
		</DrawerWrapper>
	);
}

export default AccountSettingsModal;
