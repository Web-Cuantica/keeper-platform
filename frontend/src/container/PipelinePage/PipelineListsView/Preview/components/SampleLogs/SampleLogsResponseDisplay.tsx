import { useTranslation } from 'react-i18next';
import { SampleLogsResponse } from '../../hooks/useSampleLogs';
import LogsList from '../LogsList';

function SampleLogsResponseDisplay({
	response,
}: SampleLogsResponseDisplayProps): JSX.Element {
	const { t } = useTranslation('pages');
	const { isLoading, isError, logs } = response;

	if (isError) {
		return (
			<div className="sample-logs-notice-container">
				{t('cfg_an_error_occured_while', { defaultValue: "An error occured while querying sample logs" })}
			</div>
		);
	}

	if (isLoading) {
		return <div className="sample-logs-notice-container">Loading...</div>;
	}

	if (logs.length < 1) {
		return <div className="sample-logs-notice-container">{t('cfg_no_logs_found', { defaultValue: "No logs found" })}</div>;
	}

	return <LogsList logs={logs} />;
}

export interface SampleLogsResponseDisplayProps {
	response: SampleLogsResponse;
}

export default SampleLogsResponseDisplay;
