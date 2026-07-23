import { useTranslation } from 'react-i18next';
import { useFunnelSlowTraces } from 'hooks/TracesFunnels/useFunnels';
import { FunnelStepData } from 'types/api/traceFunnels';

import FunnelTopTracesTable from './FunnelTopTracesTable';

interface TopSlowestTracesProps {
	funnelId: string;
	stepAOrder: number;
	stepBOrder: number;
	steps: FunnelStepData[];
}

function TopSlowestTraces(props: TopSlowestTracesProps): JSX.Element {
	const { t } = useTranslation('pages');
	return (
		<FunnelTopTracesTable
			{...props}
			title={t('funnel_slowest', { defaultValue: 'Slowest 5 traces' })}
			tooltip="A list of the slowest traces in the funnel"
			useQueryHook={useFunnelSlowTraces}
		/>
	);
}

export default TopSlowestTraces;
