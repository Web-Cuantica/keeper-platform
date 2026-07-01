import { useTranslation } from 'react-i18next';
import { Table } from 'antd';
import { Typography } from '@signozhq/ui/typography';
import { BarChart, ScrollText } from '@signozhq/icons';

import './IntegrationDetailContentTabs.styles.scss';

interface DataCollectedProps {
	logsData: Array<any>;
	metricsData: Array<any>;
}

function DataCollected(props: DataCollectedProps): JSX.Element {
	const { t } = useTranslation('pages');
	const { logsData, metricsData } = props;
	const logsColumns = [
		{
			title: t('intg_col_name', { defaultValue: 'Name' }),
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: t('intg_col_path', { defaultValue: 'Path' }),
			dataIndex: 'path',
			key: 'path',
		},
		{
			title: t('intg_col_type', { defaultValue: 'Type' }),
			dataIndex: 'type',
			key: 'type',
		},
	];

	const metricsColumns = [
		{
			title: t('intg_col_name', { defaultValue: 'Name' }),
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: t('intg_col_type', { defaultValue: 'Type' }),
			dataIndex: 'type',
			key: 'type',
		},
		{
			title: t('intg_col_unit', { defaultValue: 'Unit' }),
			dataIndex: 'unit',
			key: 'unit',
		},
	];

	const paginationConfig = { pageSize: 20, hideOnSinglePage: true };

	return (
		<div className="integration-data-collected">
			<div className="logs-section">
				<div className="logs-heading">
					<ScrollText size={14} />
					<Typography.Text>Logs</Typography.Text>
				</div>
				<Table
					columns={logsColumns}
					rowClassName={(_, index): string =>
						index % 2 === 0 ? 'table-row-dark' : ''
					}
					dataSource={logsData}
					pagination={paginationConfig}
					className="logs-section-table"
				/>
			</div>
			<div className="metrics-section">
				<div className="metrics-heading">
					<BarChart size={14} />
					<Typography.Text>Metrics</Typography.Text>
				</div>
				<Table
					columns={metricsColumns}
					rowClassName={(_, index): string =>
						index % 2 === 0 ? 'table-row-dark' : ''
					}
					dataSource={metricsData}
					pagination={paginationConfig}
					className="metrics-section-table"
				/>
			</div>
		</div>
	);
}

export default DataCollected;
