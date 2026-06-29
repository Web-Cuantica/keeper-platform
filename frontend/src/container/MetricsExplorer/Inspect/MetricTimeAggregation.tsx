import { Typography } from '@signozhq/ui/typography';
// TODO(@signozhq/ui-input): migrate this <Input> once @signozhq/ui Input
// supports the `onWheel` handler (used to blur on scroll for number inputs).
import { Input, Select } from 'antd';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import { TIME_AGGREGATION_OPTIONS } from './constants';
import { InspectionStep } from './types';
import { MetricTimeAggregationProps } from './types';
import { getDefaultTimeAggregationInterval } from './utils';

function MetricTimeAggregation({
	currentMetricInspectionOptions,
	dispatchMetricInspectionOptions,
	inspectionStep,
	inspectMetricsTimeSeries,
}: MetricTimeAggregationProps): JSX.Element {
	const { t } = useTranslation('pages');
	return (
		<div
			data-testid="metric-time-aggregation"
			className="metric-time-aggregation"
		>
			<div
				className={classNames('metric-time-aggregation-header', {
					'selected-step': inspectionStep === InspectionStep.TIME_AGGREGATION,
				})}
			>
				<Typography.Text>
					{t('metrics_aggregate_by_time', { defaultValue: 'AGGREGATE BY TIME' })}
				</Typography.Text>
			</div>
			<div className="metric-time-aggregation-content">
				<div className="inspect-metrics-input-group">
					<Typography.Text>
						{t('metrics_align_with', { defaultValue: 'Align with' })}
					</Typography.Text>
					<Select
						value={currentMetricInspectionOptions.timeAggregationOption}
						onChange={(value): void => {
							dispatchMetricInspectionOptions({
								type: 'SET_TIME_AGGREGATION_OPTION',
								payload: value,
							});
							// set the time aggregation interval to the default value if it is not set
							if (!currentMetricInspectionOptions.timeAggregationInterval) {
								dispatchMetricInspectionOptions({
									type: 'SET_TIME_AGGREGATION_INTERVAL',
									payload: getDefaultTimeAggregationInterval(
										inspectMetricsTimeSeries[0],
									),
								});
							}
						}}
						style={{ width: 130 }}
						placeholder={t('metrics_select_option', {
							defaultValue: 'Select option',
						})}
					>
						{Object.entries(TIME_AGGREGATION_OPTIONS).map(([key, value]) => (
							<Select.Option key={key} value={key}>
								{value}
							</Select.Option>
						))}
					</Select>
				</div>
				<div className="inspect-metrics-input-group">
					<Typography.Text>
						{t('metrics_aggregated_every', { defaultValue: 'aggregated every' })}
					</Typography.Text>
					<Input
						type="number"
						className="no-arrows-input"
						value={currentMetricInspectionOptions.timeAggregationInterval}
						placeholder={t('metrics_select_interval', {
							defaultValue: 'Select interval...',
						})}
						suffix={t('metrics_seconds', { defaultValue: 'seconds' })}
						onChange={(e): void => {
							dispatchMetricInspectionOptions({
								type: 'SET_TIME_AGGREGATION_INTERVAL',
								payload: parseInt(e.target.value, 10),
							});
						}}
						onWheel={(e): void => (e.target as HTMLInputElement).blur()}
					/>
				</div>
			</div>
		</div>
	);
}

export default MetricTimeAggregation;
