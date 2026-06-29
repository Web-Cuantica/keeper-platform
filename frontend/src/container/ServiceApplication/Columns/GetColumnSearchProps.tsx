import { Link } from 'react-router-dom';
import { Info, Search } from '@signozhq/icons';
import { Popconfirm, PopconfirmProps } from 'antd';
import type { ColumnType } from 'antd/es/table';
import ROUTES from 'constants/routes';
import { routeConfig } from 'container/SideNav/config';
import { getQueryString } from 'container/SideNav/helper';
import type { TFunction } from 'i18next';
import history from 'lib/history';
import { ServicesList } from 'types/api/metrics/getService';

import { filterDropdown } from '../Filter/FilterDropdown';

import '../ServiceApplication.styles.scss';

const MAX_TOP_LEVEL_OPERATIONS = 2500;

const highTopLevelOperationsPopoverDesc = (
	metrics: string,
	t: TFunction,
): JSX.Element => {
	const description: string = t('pages:svc_high_top_level_ops_desc', {
		defaultValue:
			'The service `{{service}}` has too many top level operations. It makes the dashboard slow to load.',
		service: metrics,
	});

	return <div className="popover-description">{description}</div>;
};

export const getColumnSearchProps = (
	dataIndex: keyof ServicesList,
	search: string,
	t: TFunction,
): ColumnType<ServicesList> => ({
	filterDropdown: (props): JSX.Element => filterDropdown({ ...props, t }),
	filterIcon: <Search size="md" />,
	onFilter: (
		value: string | number | boolean,
		record: ServicesList,
	): boolean => {
		if (record[dataIndex]) {
			return (
				record[dataIndex]
					?.toString()
					.toLowerCase()
					.includes(value.toString().toLowerCase()) || false
			);
		}

		return false;
	},
	render: (metrics: string, record: ServicesList): JSX.Element => {
		const urlParams = new URLSearchParams(search);
		const avialableParams = routeConfig[ROUTES.SERVICE_METRICS];
		const queryString = getQueryString(avialableParams, urlParams);
		const topLevelOperations = record?.dataWarning?.topLevelOps || [];

		const handleShowTopLevelOperations: PopconfirmProps['onConfirm'] = () => {
			history.push(
				`${ROUTES.APPLICATION}/${encodeURIComponent(metrics)}/top-level-operations`,
			);
		};

		const hasHighTopLevelOperations =
			topLevelOperations &&
			Array.isArray(topLevelOperations) &&
			topLevelOperations.length > MAX_TOP_LEVEL_OPERATIONS;

		const tooManyOpsTitle: string = t('pages:svc_too_many_top_level_ops', {
			defaultValue: 'Too Many Top Level Operations',
		});
		const showTopLevelOpsText: string = t('pages:svc_show_top_level_ops', {
			defaultValue: 'Show Top Level Operations',
		});

		return (
			<div className={`serviceName ${hasHighTopLevelOperations ? 'error' : ''} `}>
				{hasHighTopLevelOperations && (
					<Popconfirm
						title={tooManyOpsTitle}
						description={highTopLevelOperationsPopoverDesc(metrics, t)}
						placement="right"
						overlayClassName="service-high-top-level-operations"
						onConfirm={handleShowTopLevelOperations}
						trigger={['hover']}
						showCancel={false}
						okText={showTopLevelOpsText}
					>
						<Info size={14} />
					</Popconfirm>
				)}

				<Link
					to={`${ROUTES.APPLICATION}/${encodeURIComponent(
						metrics,
					)}?${queryString.join('')}`}
				>
					{metrics}
				</Link>
			</div>
		);
	},
});
