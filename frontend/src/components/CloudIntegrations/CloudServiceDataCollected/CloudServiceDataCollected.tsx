import { useTranslation } from 'react-i18next';
import { Table } from 'antd';
import {
	CloudintegrationtypesCollectedLogAttributeDTO,
	CloudintegrationtypesCollectedMetricDTO,
} from 'api/generated/services/sigNoz.schemas';
import { BarChart, ScrollText } from '@signozhq/icons';

import './CloudServiceDataCollected.styles.scss';

function CloudServiceDataCollected({
	logsData,
	metricsData,
}: {
	logsData: CloudintegrationtypesCollectedLogAttributeDTO[] | null | undefined;
	metricsData: CloudintegrationtypesCollectedMetricDTO[] | null | undefined;
}): JSX.Element {
	const { t } = useTranslation('pages');
	const logsColumns = [
		{
			title: t('intg_col_name_upper', { defaultValue: 'NAME' }),
			dataIndex: 'name',
			key: 'name',
			width: '30%',
		},
		{
			title: t('intg_col_path_upper', { defaultValue: 'PATH' }),
			dataIndex: 'path',
			key: 'path',
			width: '40%',
		},
		{
			title: t('intg_col_facet_type', { defaultValue: 'FACET TYPE' }),
			dataIndex: 'type',
			key: 'type',
			width: '30%',
		},
	];

	const metricsColumns = [
		{
			title: t('intg_col_name_upper', { defaultValue: 'NAME' }),
			dataIndex: 'name',
			key: 'name',
			width: '40%',
		},
		{
			title: t('intg_col_unit_upper', { defaultValue: 'UNIT' }),
			dataIndex: 'unit',
			key: 'unit',
			width: '30%',
		},
		{
			title: t('intg_col_type_upper', { defaultValue: 'TYPE' }),
			dataIndex: 'type',
			key: 'type',
			width: '30%',
		},
	];

	const tableProps = {
		pagination: { pageSize: 20, hideOnSinglePage: true },
		showHeader: true,
		size: 'middle' as const,
		bordered: false,
	};

	return (
		<div className="cloud-service-data-collected">
			{logsData && logsData.length > 0 && (
				<div className="cloud-service-data-collected-table">
					<div className="cloud-service-data-collected-table-heading">
						<ScrollText size={14} />
						Logs
					</div>
					<Table
						columns={logsColumns}
						dataSource={logsData}
						{...tableProps}
						className="cloud-service-data-collected-table-logs"
					/>
				</div>
			)}
			{metricsData && metricsData.length > 0 && (
				<div className="cloud-service-data-collected-table">
					<div className="cloud-service-data-collected-table-heading">
						<BarChart size={14} />
						Metrics
					</div>
					<Table
						columns={metricsColumns}
						dataSource={metricsData}
						{...tableProps}
						className="cloud-service-data-collected-table-metrics"
					/>
				</div>
			)}
		</div>
	);
}

export default CloudServiceDataCollected;
