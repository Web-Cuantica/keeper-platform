import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { Button } from 'antd';
import { Switch } from '@signozhq/ui/switch';
import { Typography } from '@signozhq/ui/typography';
import DownloadOptionsMenu from 'components/DownloadOptionsMenu/DownloadOptionsMenu';
import FieldsSelector from 'components/FieldsSelector';
import LogsFormatOptionsMenu from 'components/LogsFormatOptionsMenu/LogsFormatOptionsMenu';
import ListViewOrderBy from 'components/OrderBy/ListViewOrderBy';
import { LOCALSTORAGE } from 'constants/localStorage';
import { PANEL_TYPES } from 'constants/queryBuilder';
import ROUTES from 'constants/routes';
import { useOptionsMenu } from 'container/OptionsMenu';
import { LOGS_REQUIRED_COLUMNS } from 'container/OptionsMenu/constants';
import { ArrowUp10, Minus, Play } from '@signozhq/icons';
import { DataSource, StringOperators } from 'types/common/queryBuilder';

import LogsTotalCount from './LogsTotalCount';

function LogsActionsContainer({
	listQuery,
	selectedPanelType,
	showFrequencyChart,
	handleToggleFrequencyChart,
	orderBy,
	setOrderBy,
}: {
	listQuery: any;
	selectedPanelType: PANEL_TYPES;
	showFrequencyChart: boolean;
	handleToggleFrequencyChart: () => void;
	orderBy: string;
	setOrderBy: (value: string) => void;
}): JSX.Element {
	const { t } = useTranslation('pages');
	const { options, config } = useOptionsMenu({
		storageKey: LOCALSTORAGE.LOGS_LIST_OPTIONS,
		dataSource: DataSource.LOGS,
		aggregateOperator: listQuery?.aggregateOperator || StringOperators.NOOP,
	});

	const [isFieldsSelectorOpen, setIsFieldsSelectorOpen] = useState(false);
	const history = useHistory();

	const formatItems = [
		{
			key: 'raw',
			label: t('logs_format_raw', { defaultValue: 'Raw' }),
			data: {
				title: t('logs_format_raw_max_lines', {
					defaultValue: 'max lines per row',
				}),
			},
		},
		{
			key: 'list',
			label: t('logs_format_default', { defaultValue: 'Default' }),
		},
		{
			key: 'table',
			label: t('logs_format_column', { defaultValue: 'Column' }),
			data: {
				title: t('logs_format_columns', { defaultValue: 'columns' }),
			},
		},
	];

	return (
		<div className="logs-actions-container">
			<div className="tab-options">
				<div className="tab-options-left">
					{selectedPanelType === PANEL_TYPES.LIST && (
						<>
							<div className="frequency-chart-view-controller">
								<Typography>
									{t('logs_frequency_chart', {
										defaultValue: 'Frequency chart',
									})}
								</Typography>
								<Switch
									value={showFrequencyChart}
									defaultValue
									onChange={handleToggleFrequencyChart}
								/>
							</div>
							<Button
								type="text"
								size="small"
								icon={<Play size={14} />}
								className="keeper-live-tail-btn"
								onClick={(): void => history.push(ROUTES.LIVE_LOGS)}
							>
								Live Tail
							</Button>
							<LogsTotalCount />
						</>
					)}
				</div>

				<div className="tab-options-right">
					{selectedPanelType === PANEL_TYPES.LIST && (
						<>
							<div className="order-by-container">
								<div className="order-by-label">
									{t('logs_order_by', { defaultValue: 'Order by' })}{' '}
									<Minus size={14} /> <ArrowUp10 size={14} />
								</div>

								<ListViewOrderBy
									value={orderBy}
									onChange={(value): void => setOrderBy(value)}
									dataSource={DataSource.LOGS}
								/>
							</div>
							<div className="download-options-container">
								<DownloadOptionsMenu
									dataSource={DataSource.LOGS}
									selectedColumns={options?.selectColumns}
								/>
							</div>
							<div className="format-options-container">
								<LogsFormatOptionsMenu
									items={formatItems}
									selectedOptionFormat={options.format}
									config={config}
									onOpenColumns={(): void => setIsFieldsSelectorOpen(true)}
								/>
							</div>
						</>
					)}
				</div>
			</div>
			{config.fieldsSelector && (
				<FieldsSelector
					isOpen={isFieldsSelectorOpen}
					title={t('logs_edit_columns', { defaultValue: 'Edit columns' })}
					fields={config.fieldsSelector.value}
					onFieldsChange={config.fieldsSelector.onFieldsChange}
					onClose={(): void => setIsFieldsSelectorOpen(false)}
					signal={DataSource.LOGS}
					requiredFields={LOGS_REQUIRED_COLUMNS}
				/>
			)}
		</div>
	);
}

export default LogsActionsContainer;
