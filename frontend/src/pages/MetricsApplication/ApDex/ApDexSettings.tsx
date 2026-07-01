import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from '@signozhq/icons';
import { Card, InputNumber } from 'antd';
import Spinner from 'components/Spinner';
import TextToolTip from 'components/TextToolTip';
import {
	apDexToolTipText,
	apDexToolTipUrl,
	apDexToolTipUrlText,
} from 'constants/apDex';
import { themeColors } from 'constants/theme';
import { useSetApDexSettings } from 'hooks/apDex/useSetApDexSettings';
import { useNotifications } from 'hooks/useNotifications';

import { APPLICATION_SETTINGS } from '../constants';
import {
	AppDexThresholdContainer,
	Button,
	SaveAndCancelContainer,
	SaveButton,
	Typography,
} from '../styles';
import { onSaveApDexSettings } from '../utils';
import { ApDexSettingsProps } from './types';

function ApDexSettings({
	servicename,
	handlePopOverClose,
	isLoading,
	data,
	refetchGetApDexSetting,
}: ApDexSettingsProps): JSX.Element {
	const { t } = useTranslation('pages');
	const [thresholdValue, setThresholdValue] = useState(() => {
		if (data) {
			return data.data[0].threshold;
		}
		return 0;
	});
	const { notifications } = useNotifications();

	const { isLoading: isApDexLoading, mutateAsync } = useSetApDexSettings({
		servicename,
		threshold: thresholdValue,
		excludeStatusCode: '',
	});

	const handleThreadholdChange = (value: number | null): void => {
		if (value !== null) {
			setThresholdValue(value);
		}
	};

	if (isLoading) {
		return (
			<Typography.Text style={{ color: themeColors.white }}>
				<Spinner height="5vh" tip={t('svc_apdex_loading', { defaultValue: 'Loading...' })} />
			</Typography.Text>
		);
	}

	return (
		<Card
			title={t('svc_apdex_title', { defaultValue: APPLICATION_SETTINGS })}
			extra={<X size="lg" onClick={handlePopOverClose} />}
			actions={[
				<SaveAndCancelContainer key="SaveAndCancelContainer">
					<Button onClick={handlePopOverClose}>{t('svc_apdex_cancel', { defaultValue: 'Cancel' })}</Button>
					<SaveButton
						onClick={onSaveApDexSettings({
							handlePopOverClose,
							mutateAsync,
							notifications,
							refetchGetApDexSetting,
							servicename,
							thresholdValue,
						})}
						type="primary"
						loading={isApDexLoading}
					>
						{t('svc_apdex_save', { defaultValue: 'Save' })}
					</SaveButton>
				</SaveAndCancelContainer>,
			]}
		>
			<AppDexThresholdContainer>
				<Typography>
					{t('svc_apdex_threshold', {
						defaultValue: 'Apdex threshold (in seconds)',
					})}{' '}
					<TextToolTip
						text={t('svc_apdex_tooltip', { defaultValue: apDexToolTipText })}
						url={apDexToolTipUrl}
						useFilledIcon={false}
						urlText={t('svc_apdex_tooltip_url', { defaultValue: apDexToolTipUrlText })}
					/>
				</Typography>
				<InputNumber
					value={thresholdValue}
					onChange={handleThreadholdChange}
					min={0}
					step={0.1}
				/>
			</AppDexThresholdContainer>
			{/* TODO: Add this feature later when backend is ready to support it. */}
			{/* <ExcludeErrorCodeContainer>
				<Typography.Text>
					Exclude following error codes from error rate calculation
				</Typography.Text>
				<Input placeholder="e.g. 406, 418" />
			</ExcludeErrorCodeContainer> */}
		</Card>
	);
}

ApDexSettings.defaultProps = {
	isLoading: undefined,
	data: undefined,
	refetchGetApDexSetting: undefined,
};

export default ApDexSettings;
