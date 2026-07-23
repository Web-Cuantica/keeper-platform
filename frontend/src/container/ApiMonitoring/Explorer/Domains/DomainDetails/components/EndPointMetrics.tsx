import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { UseQueryResult } from 'react-query';
import { Color } from '@signozhq/design-tokens';
import { Skeleton, Tooltip } from 'antd';
import { Progress } from '@signozhq/ui/progress';
import { Typography } from '@signozhq/ui/typography';
import {
	getDisplayValue,
	getFormattedEndPointMetricsData,
} from 'container/ApiMonitoring/utils';
import { SuccessResponse } from 'types/api';

import ErrorState from './ErrorState';

// eslint-disable-next-line sonarjs/cognitive-complexity
function EndPointMetrics({
	endPointMetricsDataQuery,
}: {
	endPointMetricsDataQuery: UseQueryResult<SuccessResponse<any>, unknown>;
}): JSX.Element {
	const { t } = useTranslation('pages');
	const { isLoading, isRefetching, isError, data, refetch } =
		endPointMetricsDataQuery;

	const metricsData = useMemo(() => {
		if (isLoading || isRefetching || isError) {
			return null;
		}

		return getFormattedEndPointMetricsData(
			data?.payload?.data?.result[0].table.rows,
			t,
		);
	}, [data?.payload?.data?.result, isLoading, isRefetching, isError, t]);

	if (isError) {
		return <ErrorState refetch={refetch} />;
	}

	return (
		<div className="domain-detail-drawer__endpoint">
			<div className="domain-details-grid">
				<div className="labels-row">
					<Typography.Text color="muted" className="domain-details-metadata-label">
						{t('cfg_rate', { defaultValue: "Rate" })}
					</Typography.Text>
					<Typography.Text color="muted" className="domain-details-metadata-label">
						{t('pages:apm_average_latency', { defaultValue: 'AVERAGE LATENCY' })}
					</Typography.Text>
					<Typography.Text color="muted" className="domain-details-metadata-label">
						{t('pages:apm_error_pct', { defaultValue: 'ERROR %' })}
					</Typography.Text>
					<Typography.Text color="muted" className="domain-details-metadata-label">
						{t('pages:apm_last_used_upper', { defaultValue: 'LAST USED' })}
					</Typography.Text>
				</div>

				<div className="values-row">
					<Typography.Text className="domain-details-metadata-value">
						{isLoading || isRefetching ? (
							<Skeleton.Button active size="small" />
						) : (
							<Tooltip title={metricsData?.rate}>
								<span className="round-metric-tag">
									{metricsData?.rate !== '-' ? `${metricsData?.rate} ops/sec` : '-'}
								</span>
							</Tooltip>
						)}
					</Typography.Text>
					<Typography.Text className="domain-details-metadata-value">
						{isLoading || isRefetching ? (
							<Skeleton.Button active size="small" />
						) : (
							<Tooltip title={metricsData?.latency}>
								{metricsData?.latency !== '-' ? `${metricsData?.latency}ms` : '-'}
							</Tooltip>
						)}
					</Typography.Text>
					<Typography.Text className="domain-details-metadata-value error-rate">
						{isLoading || isRefetching ? (
							<Skeleton.Button active size="small" />
						) : (
							<Tooltip title={metricsData?.errorRate}>
								{metricsData?.errorRate !== '-' ? (
									<Progress
										percent={Number(Number(metricsData?.errorRate ?? 0).toFixed(2))}
										strokeLinecap="butt"
										showInfo
										strokeColor={((): string => {
											const errorRatePercent = Number(
												Number(metricsData?.errorRate ?? 0).toFixed(2),
											);
											if (errorRatePercent >= 90) {
												return Color.BG_SAKURA_500;
											}
											if (errorRatePercent >= 60) {
												return Color.BG_AMBER_500;
											}
											return Color.BG_FOREST_500;
										})()}
										className="progress-bar"
									/>
								) : (
									'-'
								)}
							</Tooltip>
						)}
					</Typography.Text>
					<Typography.Text className="domain-details-metadata-value">
						{isLoading || isRefetching ? (
							<Skeleton.Button active size="small" />
						) : (
							<Tooltip title={metricsData?.lastUsed}>
								{getDisplayValue(metricsData?.lastUsed)}
							</Tooltip>
						)}
					</Typography.Text>
				</div>
			</div>
		</div>
	);
}

export default EndPointMetrics;
