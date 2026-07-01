import { Select } from 'antd';
import { getTranslatedRelativeDurationOptions } from 'container/TopNav/DateTimeSelectionV2/constants';
import { Time } from 'container/TopNav/DateTimeSelectionV2/types';
import { useTranslation } from 'react-i18next';
import { TagFilter } from 'types/api/queryBuilder/queryBuilderData';

import LogsCountInInterval from './components/LogsCountInInterval';

import './styles.scss';

function PreviewIntervalSelector({
	previewFilter,
	value,
	onChange,
}: PreviewIntervalSelectorProps): JSX.Element {
	const { t } = useTranslation('pages');
	const onSelectInterval = (value: unknown): void => onChange(value as Time);

	const isEmptyFilter = (previewFilter?.items?.length || 0) < 1;

	return (
		<div className="logs-filter-preview-time-interval-summary">
			{!isEmptyFilter && (
				<LogsCountInInterval filter={previewFilter} timeInterval={value} />
			)}
			<div>
				<Select value={value} onSelect={onSelectInterval}>
					{getTranslatedRelativeDurationOptions(t).map(({ value, label }) => (
						<Select.Option key={value + label} value={value}>
							{label}
						</Select.Option>
					))}
				</Select>
			</div>
		</div>
	);
}

interface PreviewIntervalSelectorProps {
	value: Time;
	onChange: (interval: Time) => void;
	previewFilter: TagFilter;
}

export default PreviewIntervalSelector;
