import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Color } from '@signozhq/design-tokens';
import { Form, Select } from 'antd';
import { ChevronDown } from '@signozhq/icons';
import { Region } from 'utils/regions';
import { popupContainer } from 'utils/selectPopupContainer';

import { RegionSelector } from './RegionForm/RegionSelector';

// Form section components
function RegionDeploymentSection({
	regions,
	handleRegionChange,
	isFormDisabled,
}: {
	regions: Region[];
	handleRegionChange: (value: string) => void;
	isFormDisabled: boolean;
}): JSX.Element {
	const { t } = useTranslation('pages');
	return (
		<div className="cloud-account-setup-form__form-group">
			<div className="cloud-account-setup-form__title">
				{t('intg_deploy_cloud_stack_title', {
					defaultValue: 'Where should we deploy the SigNoz Cloud stack?',
				})}
			</div>
			<div className="cloud-account-setup-form__description">
				{t('intg_deploy_cloud_stack_desc', {
					defaultValue: 'Choose the AWS region for CloudFormation stack deployment',
				})}
			</div>
			<Form.Item
				name="region"
				rules={[
					{
						required: true,
						message: t('intg_select_region_required', {
							defaultValue: 'Please select a region',
						}),
					},
				]}
				className="cloud-account-setup-form__form-item"
			>
				<Select
					placeholder={t('intg_region_placeholder_aws', {
						defaultValue: 'e.g. US East (N. Virginia)',
					})}
					suffixIcon={<ChevronDown size={16} color={Color.BG_VANILLA_400} />}
					className="cloud-account-setup-form__select integrations-select"
					onChange={handleRegionChange}
					disabled={isFormDisabled}
					getPopupContainer={popupContainer}
				>
					{regions.flatMap((region) =>
						region.subRegions.map((subRegion) => (
							<Select.Option key={subRegion.id} value={subRegion.id}>
								{subRegion.displayName}
							</Select.Option>
						)),
					)}
				</Select>
			</Form.Item>
		</div>
	);
}

function MonitoringRegionsSection({
	selectedRegions,
	setSelectedRegions,
	setIncludeAllRegions,
}: {
	selectedRegions: string[];
	setSelectedRegions: Dispatch<SetStateAction<string[]>>;
	setIncludeAllRegions: Dispatch<SetStateAction<boolean>>;
}): JSX.Element {
	const { t } = useTranslation('pages');
	return (
		<div className="cloud-account-setup-form__form-group">
			<div className="cloud-account-setup-form__title">
				{t('intg_which_regions_monitor', {
					defaultValue: 'Which regions do you want to monitor?',
				})}
			</div>
			<div className="cloud-account-setup-form__description">
				{t('intg_choose_regions_desc', {
					defaultValue:
						'Choose only the regions you want SigNoz to monitor. You can enable all at once, or pick specific ones:',
				})}
			</div>

			<RegionSelector
				selectedRegions={selectedRegions}
				setSelectedRegions={setSelectedRegions}
				setIncludeAllRegions={setIncludeAllRegions}
			/>
		</div>
	);
}

function ComplianceNote(): JSX.Element {
	const { t } = useTranslation('pages');
	return (
		<div className="cloud-account-setup-form__form-group">
			<div className="cloud-account-setup-form__note">
				{t('intg_compliance_note', {
					defaultValue:
						'Note: Some organizations may require the CloudFormation stack to be deployed in the same region as their primary infrastructure for compliance or latency reasons.',
				})}
			</div>
		</div>
	);
}

export { ComplianceNote, MonitoringRegionsSection, RegionDeploymentSection };
