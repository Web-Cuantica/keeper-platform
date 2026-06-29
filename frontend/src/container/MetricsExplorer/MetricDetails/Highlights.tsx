import { Color } from '@signozhq/design-tokens';
import { Button, Spin } from 'antd';
import { TooltipSimple } from '@signozhq/ui/tooltip';
import { Typography } from '@signozhq/ui/typography';
import { useGetMetricHighlights } from 'api/generated/services/metrics';
import { DATE_TIME_FORMATS } from 'constants/dateTimeFormats';
import { Info } from '@signozhq/icons';
import { useTimezone } from 'providers/Timezone';
import { useTranslation } from 'react-i18next';

import { formatNumberIntoHumanReadableFormat } from '../Summary/utils';
import { HighlightsProps } from './types';
import {
	formatNumberToCompactFormat,
	formatTimestampToReadableDate,
} from './utils';

const TOOLTIP_CONTENT_PROPS = {
	className: 'metric-highlights-tooltip-content',
};

function Highlights({ metricName }: HighlightsProps): JSX.Element {
	const { t } = useTranslation('pages');
	const {
		data: metricHighlightsData,
		isLoading: isLoadingMetricHighlights,
		isError: isErrorMetricHighlights,
		refetch: refetchMetricHighlights,
	} = useGetMetricHighlights(
		{
			metricName,
		},
		{
			query: {
				enabled: !!metricName,
			},
		},
	);

	const metricHighlights = metricHighlightsData?.data;

	const timeSeriesActive = formatNumberToCompactFormat(
		metricHighlights?.activeTimeSeries,
	);
	const timeSeriesTotal = formatNumberToCompactFormat(
		metricHighlights?.totalTimeSeries,
	);
	const lastReceivedText = formatTimestampToReadableDate(
		metricHighlights?.lastReceived,
		t,
	);
	const { formatTimezoneAdjustedTimestamp } = useTimezone();
	const lastReceivedTooltipText = metricHighlights?.lastReceived
		? t('metrics_last_received_on', {
				defaultValue: 'Last received on {{date}}',
				date: formatTimezoneAdjustedTimestamp(
					metricHighlights.lastReceived,
					DATE_TIME_FORMATS.DASH_DATETIME_UTC,
				),
			})
		: t('metrics_no_data_received', { defaultValue: 'No data received yet' });

	if (isErrorMetricHighlights) {
		return (
			<div className="metric-details-content-grid">
				<div
					className="metric-highlights-error-state"
					data-testid="metric-highlights-error-state"
				>
					<Info size={16} color={Color.BG_CHERRY_500} />
					<Typography.Text>
						{t('metrics_highlights_fetch_error', {
							defaultValue:
								'Something went wrong while fetching metric highlights',
						})}
					</Typography.Text>
					<Button
						type="link"
						size="large"
						onClick={(): void => {
							refetchMetricHighlights();
						}}
					>
						{t('metrics_retry_question', { defaultValue: 'Retry ?' })}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="metric-details-content-grid">
			<div className="labels-row">
				<Typography.Text color="muted" className="metric-details-grid-label">
					{t('metrics_samples', { defaultValue: 'SAMPLES' })}
				</Typography.Text>
				<Typography.Text color="muted" className="metric-details-grid-label">
					{t('metrics_time_series_label', { defaultValue: 'TIME SERIES' })}
				</Typography.Text>
				<Typography.Text color="muted" className="metric-details-grid-label">
					{t('metrics_last_received', { defaultValue: 'LAST RECEIVED' })}
				</Typography.Text>
			</div>
			<div className="values-row">
				{isLoadingMetricHighlights ? (
					<div className="metric-highlights-loading-inline">
						<Spin size="small" />
						<Typography.Text color="muted">
							{t('metrics_loading_stats', {
								defaultValue: 'Loading metric stats',
							})}
						</Typography.Text>
					</div>
				) : (
					<>
						<Typography.Text
							className="metric-details-grid-value"
							data-testid="metric-highlights-data-points"
						>
							<TooltipSimple
								title={metricHighlights?.dataPoints?.toLocaleString()}
								tooltipContentProps={TOOLTIP_CONTENT_PROPS}
								arrow
							>
								<span>
									{formatNumberIntoHumanReadableFormat(
										metricHighlights?.dataPoints ?? 0,
									)}
								</span>
							</TooltipSimple>
						</Typography.Text>
						<Typography.Text
							className="metric-details-grid-value"
							data-testid="metric-highlights-time-series-total"
						>
							<TooltipSimple
								title={t('metrics_active_time_series_tooltip', {
									defaultValue:
										'Active time series are those that have received data points in the last 1 hour.',
								})}
								side="top"
								tooltipContentProps={TOOLTIP_CONTENT_PROPS}
								arrow
							>
								<span>
									{t('metrics_time_series_total_active', {
										defaultValue: '{{total}} total ⎯ {{active}} active',
										total: timeSeriesTotal,
										active: timeSeriesActive,
									})}
								</span>
							</TooltipSimple>
						</Typography.Text>
						<Typography.Text
							className="metric-details-grid-value"
							data-testid="metric-highlights-last-received"
						>
							<TooltipSimple
								title={lastReceivedTooltipText}
								tooltipContentProps={TOOLTIP_CONTENT_PROPS}
								arrow
							>
								<span>{lastReceivedText}</span>
							</TooltipSimple>
						</Typography.Text>
					</>
				)}
			</div>
		</div>
	);
}

export default Highlights;
