import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Space } from 'antd';
import { RadioGroup, RadioGroupItem } from '@signozhq/ui/radio-group';
import { Typography } from '@signozhq/ui/typography';
import {
	OnboardingMethods,
	useOnboardingContext,
} from 'container/OnboardingContainer/context/OnboardingContext';

export default function SelectMethod(): JSX.Element {
	const { t } = useTranslation('pages');
	const { selectedMethod, updateSelectedMethod } = useOnboardingContext();
	const [value, setValue] = useState(selectedMethod);

	const onChange = (next: string): void => {
		setValue(next);
		updateSelectedMethod(next);
	};

	return (
		<div>
			<RadioGroup onChange={onChange} value={value}>
				<Space direction="vertical">
					<RadioGroupItem value={OnboardingMethods.QUICK_START}>
						<Typography.Text> {t('onb_quick_start', { defaultValue: "Quick Start" })}</Typography.Text> <br />
						<small>{t('onb_send_data_to_signoz', { defaultValue: "Send data to SigNoz directly from OpenTelemetry SDK." })}</small>
					</RadioGroupItem>

					<RadioGroupItem value={OnboardingMethods.RECOMMENDED_STEPS}>
						<Typography.Text> {t('onb_use_recommended_steps', { defaultValue: "Use Recommended Steps" })}</Typography.Text> <br />
						<small>
							Send data to SigNoz via OpenTelemetry Collector (better control on data
							you send to SigNoz, collect host metrics & logs).
						</small>
					</RadioGroupItem>
				</Space>
			</RadioGroup>
		</div>
	);
}
