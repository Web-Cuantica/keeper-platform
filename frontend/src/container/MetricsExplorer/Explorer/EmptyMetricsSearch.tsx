import { Empty } from 'antd';
import { Typography } from '@signozhq/ui/typography';
import { useTranslation } from 'react-i18next';

interface EmptyMetricsSearchProps {
	hasQueryResult?: boolean;
}

export default function EmptyMetricsSearch({
	hasQueryResult,
}: EmptyMetricsSearchProps): JSX.Element {
	const { t } = useTranslation('pages');
	return (
		<div className="empty-metrics-search">
			<Empty
				description={
					<Typography.Title level={5}>
						{hasQueryResult
							? t('metrics_empty_no_data', { defaultValue: 'No data' })
							: t('metrics_empty_select_metric', {
									defaultValue:
										'Select a metric and run a query to see the results',
								})}
					</Typography.Title>
				}
			/>
		</div>
	);
}
