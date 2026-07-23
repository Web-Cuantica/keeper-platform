import { useTranslation } from 'react-i18next';
import { useFunnelErrorTraces } from 'hooks/TracesFunnels/useFunnels';
import { FunnelStepData } from 'types/api/traceFunnels';

import FunnelTopTracesTable from './FunnelTopTracesTable';

interface TopTracesWithErrorsProps {
	funnelId: string;
	stepAOrder: number;
	stepBOrder: number;
	steps: FunnelStepData[];
}

function TopTracesWithErrors(props: TopTracesWithErrorsProps): JSX.Element {
	const { t } = useTranslation('pages');
	return (
		<FunnelTopTracesTable
			{...props}
			title={t('funnel_traces_errors', { defaultValue: 'Traces with errors' })}
			tooltip="A list of the traces with errors in the funnel"
			useQueryHook={useFunnelErrorTraces}
		/>
	);
}

export default TopTracesWithErrors;
