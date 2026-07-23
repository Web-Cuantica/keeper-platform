import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useFunnelMetrics } from 'hooks/TracesFunnels/useFunnelMetrics';

import FunnelMetricsTable from './FunnelMetricsTable';

function OverallMetrics(): JSX.Element {
	const { t } = useTranslation('pages');
	const { funnelId } = useParams<{ funnelId: string }>();
	const { isLoading, metricsData, conversionRate, isError } = useFunnelMetrics({
		funnelId,
	});

	return (
		<FunnelMetricsTable
			title={t('funnel_overall_metrics', { defaultValue: 'Overall Funnel Metrics' })}
			subtitle={{
				label: 'Conversion rate',
				value: `${conversionRate.toFixed(2)}%`,
			}}
			isLoading={isLoading}
			isError={isError}
			data={metricsData}
		/>
	);
}

export default OverallMetrics;
