import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { RelativeDurationOptions } from 'container/TopNav/DateTimeSelectionV2/constants';
import { TagFilter } from 'types/api/queryBuilder/queryBuilderData';

import PreviewIntervalSelector from '../components/PreviewIntervalSelector';
import SampleLogs from '../components/SampleLogs';

import './styles.scss';

function LogsFilterPreview({ filter }: LogsFilterPreviewProps): JSX.Element {
	const { t } = useTranslation('pages');
	const last1HourInterval = RelativeDurationOptions[3].value;
	const [previewTimeInterval, setPreviewTimeInterval] =
		useState(last1HourInterval);

	const isEmptyFilter = (filter?.items?.length || 0) < 1;

	return (
		<div>
			<div className="logs-filter-preview-header">
				<div>{t('cfg_filtered_logs_preview', { defaultValue: "Filtered Logs Preview" })}</div>
				<PreviewIntervalSelector
					previewFilter={filter}
					value={previewTimeInterval}
					onChange={setPreviewTimeInterval}
				/>
			</div>
			<div className="logs-filter-preview-content">
				{isEmptyFilter ? (
					<div>{t('cfg_please_select_a_filter', { defaultValue: "Please select a filter" })}</div>
				) : (
					<SampleLogs filter={filter} timeInterval={previewTimeInterval} count={5} />
				)}
			</div>
		</div>
	);
}

interface LogsFilterPreviewProps {
	filter: TagFilter;
}

export default LogsFilterPreview;
