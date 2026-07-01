import { useTranslation } from 'react-i18next';
import { Input } from '@signozhq/ui/input';
import { Collapse } from 'antd';
import { Typography } from '@signozhq/ui/typography';

import { useCreateAlertState } from '../context';
import AdvancedOptionItem from './AdvancedOptionItem';
import EvaluationCadence from './EvaluationCadence';

function AdvancedOptions(): JSX.Element {
	const { t } = useTranslation('pages');
	const { advancedOptions, setAdvancedOptions } = useCreateAlertState();

	return (
		<div className="advanced-options-container">
			<Collapse bordered={false}>
				<Collapse.Panel
					header={t('al_v2_advanced_options', { defaultValue: 'ADVANCED OPTIONS' })}
					key="1"
				>
					<EvaluationCadence />
					<AdvancedOptionItem
						title={t('al_v2_alert_data_stops', {
							defaultValue: 'Alert when data stops coming',
						})}
						description={t('al_v2_alert_data_stops_desc', {
							defaultValue:
								'Send notification if no data is received for a specified time period.',
						})}
						tooltipText={t('al_v2_alert_data_stops_tooltip', {
							defaultValue:
								'Useful for monitoring data pipelines or services that should continuously send data. For example, alert if no logs are received for 10 minutes',
						})}
						input={
							<div className="advanced-option-item-input-group">
								<Input
									placeholder={t('al_v2_enter_tolerance', {
										defaultValue: 'Enter tolerance limit...',
									})}
									type="number"
									style={{ width: 100 }}
									onChange={(e): void =>
										setAdvancedOptions({
											type: 'SET_SEND_NOTIFICATION_IF_DATA_IS_MISSING',
											payload: {
												toleranceLimit: Number(e.target.value),
												timeUnit: advancedOptions.sendNotificationIfDataIsMissing.timeUnit,
											},
										})
									}
									value={advancedOptions.sendNotificationIfDataIsMissing.toleranceLimit}
								/>
								<Typography.Text>
									{t('al_v2_unit_minutes', { defaultValue: 'Minutes' })}
								</Typography.Text>
							</div>
						}
						onToggle={(): void =>
							setAdvancedOptions({
								type: 'TOGGLE_SEND_NOTIFICATION_IF_DATA_IS_MISSING',
								payload: !advancedOptions.sendNotificationIfDataIsMissing.enabled,
							})
						}
						defaultShowInput={advancedOptions.sendNotificationIfDataIsMissing.enabled}
						data-testid="send-notification-if-data-is-missing-container"
					/>
					<AdvancedOptionItem
						title={t('al_v2_minimum_data', {
							defaultValue: 'Minimum data required',
						})}
						description={t('al_v2_minimum_data_desc', {
							defaultValue:
								'Only trigger alert when there are enough data points to make a reliable decision.',
						})}
						tooltipText={t('al_v2_minimum_data_tooltip', {
							defaultValue:
								"Prevents false alarms when there's insufficient data. For example, require at least 5 data points before checking if CPU usage is above 80%.",
						})}
						input={
							<div className="advanced-option-item-input-group">
								<Input
									placeholder={t('al_v2_enter_min_datapoints', {
										defaultValue: 'Enter minimum datapoints...',
									})}
									style={{ width: 100 }}
									type="number"
									onChange={(e): void =>
										setAdvancedOptions({
											type: 'SET_ENFORCE_MINIMUM_DATAPOINTS',
											payload: {
												minimumDatapoints: Number(e.target.value),
											},
										})
									}
									value={advancedOptions.enforceMinimumDatapoints.minimumDatapoints}
								/>
								<Typography.Text>
									{t('al_v2_unit_datapoints', { defaultValue: 'Datapoints' })}
								</Typography.Text>
							</div>
						}
						onToggle={(): void =>
							setAdvancedOptions({
								type: 'TOGGLE_ENFORCE_MINIMUM_DATAPOINTS',
								payload: !advancedOptions.enforceMinimumDatapoints.enabled,
							})
						}
						defaultShowInput={advancedOptions.enforceMinimumDatapoints.enabled}
						data-testid="enforce-minimum-datapoints-container"
					/>
					{/* TODO: Add back when the functionality is implemented */}
					{/* <AdvancedOptionItem
						title="Account for data delay"
						description="Shift the evaluation window backwards to account for data processing delays."
						tooltipText="Use when your data takes time to arrive on the platform. For example, if logs typically arrive 5 minutes late, set a 5-minute delay so the alert checks the correct time window."
						input={
							<div className="advanced-option-item-input-group">
								<Input
									placeholder="Enter delay..."
									style={{ width: 100 }}
									type="number"
									onChange={(e): void =>
										setAdvancedOptions({
											type: 'SET_DELAY_EVALUATION',
											payload: {
												delay: Number(e.target.value),
												timeUnit: advancedOptions.delayEvaluation.timeUnit,
											},
										})
									}
									value={advancedOptions.delayEvaluation.delay}
								/>
								<Select
									style={{ width: 120 }}
									options={timeOptions}
									placeholder="Select time unit"
									onChange={(value): void =>
										setAdvancedOptions({
											type: 'SET_DELAY_EVALUATION',
											payload: {
												delay: advancedOptions.delayEvaluation.delay,
												timeUnit: value as string,
											},
										})
									}
									value={advancedOptions.delayEvaluation.timeUnit}
								/>
							</div>
						}
					/> */}
				</Collapse.Panel>
			</Collapse>
		</div>
	);
}

export default AdvancedOptions;
