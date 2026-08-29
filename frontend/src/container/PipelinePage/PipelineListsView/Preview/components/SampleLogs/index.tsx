import { useTranslation } from 'react-i18next';
import useSampleLogs, { SampleLogsRequest } from '../../hooks/useSampleLogs';
import LogsResponseDisplay from './SampleLogsResponseDisplay';

function SampleLogs(props: SampleLogsRequest): JSX.Element {
	const { t } = useTranslation('pages');
	const sampleLogsResponse = useSampleLogs(props);

	if ((props?.filter?.items?.length || 0) < 1) {
		return (
			<div className="sample-logs-notice-container">{t('cfg_please_select_a_filter', { defaultValue: "Please select a filter" })}</div>
		);
	}

	return <LogsResponseDisplay response={sampleLogsResponse} />;
}

export default SampleLogs;
