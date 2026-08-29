import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useFunnelStepsMetrics } from 'hooks/TracesFunnels/useFunnelMetrics';

import FunnelMetricsTable from './FunnelMetricsTable';
import { StepTransition } from './StepsTransitionResults';

interface StepsTransitionMetricsProps {
	selectedTransition: string;
	transitions: StepTransition[];
	startStep?: number;
	endStep?: number;
}

function StepsTransitionMetrics({
	selectedTransition,
	transitions,
	startStep,
	endStep,
}: StepsTransitionMetricsProps): JSX.Element {
	const { t } = useTranslation('pages');
	const { funnelId } = useParams<{ funnelId: string }>();
	const currentTransition = transitions.find(
		(transition) => transition.value === selectedTransition,
	);

	const { isLoading, metricsData, conversionRate } = useFunnelStepsMetrics({
		funnelId: funnelId || '',
		stepStart: startStep,
		stepEnd: endStep,
	});

	if (!currentTransition) {
		return <div>{t('funnel_no_transition', { defaultValue: 'No transition selected' })}</div>;
	}

	return (
		<FunnelMetricsTable
			title={currentTransition.label}
			subtitle={{
				label: 'Conversion rate',
				value: `${conversionRate.toFixed(2)}%`,
			}}
			isLoading={isLoading}
			data={metricsData}
		/>
	);
}

StepsTransitionMetrics.defaultProps = {
	startStep: undefined,
	endStep: undefined,
};

export default StepsTransitionMetrics;
