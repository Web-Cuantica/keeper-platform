import { useTranslation } from 'react-i18next';
import { Button, Flex, SelectProps } from 'antd';
import { Switch } from '@signozhq/ui/switch';
import { Typography } from '@signozhq/ui/typography';
import type { BaseOptionType, DefaultOptionType } from 'antd/es/select';
import { getInvolvedQueriesInTraceOperator } from 'components/QueryBuilderV2/QueryV2/TraceOperator/utils/utils';
import { YAxisSource } from 'components/YAxisUnitSelector/types';
import { getYAxisCategories } from 'components/YAxisUnitSelector/utils';
import ROUTES from 'constants/routes';
import {
	AlertThresholdMatchType,
	AlertThresholdOperator,
} from 'container/CreateAlertV2/context/types';
import { getSelectedQueryOptions } from 'container/FormAlertRules/utils';
import { useSafeNavigate } from 'hooks/useSafeNavigate';
import { ArrowRight } from '@signozhq/icons';
import { IUser } from 'providers/App/types';
import { Query } from 'types/api/queryBuilder/queryBuilderData';
import { EQueryType } from 'types/common/dashboard';
import { USER_ROLES } from 'types/roles';
import { openInNewTab } from 'utils/navigation';

import { ROUTING_POLICIES_ROUTE } from './constants';
import { RoutingPolicyBannerProps } from './types';
import { TraducirFn } from 'types/common/i18n';

export function getQueryNames(currentQuery: Query): BaseOptionType[] {
	const involvedQueriesInTraceOperator = getInvolvedQueriesInTraceOperator(
		currentQuery.builder.queryTraceOperator,
	);
	const queryConfig: Record<EQueryType, () => SelectProps['options']> = {
		[EQueryType.QUERY_BUILDER]: () => [
			...(getSelectedQueryOptions(currentQuery.builder.queryData)?.filter(
				(option) =>
					!involvedQueriesInTraceOperator.includes(option.value as string),
			) || []),
			...(getSelectedQueryOptions(currentQuery.builder.queryFormulas) || []),
			...(getSelectedQueryOptions(currentQuery.builder.queryTraceOperator) || []),
		],
		[EQueryType.PROM]: () => getSelectedQueryOptions(currentQuery.promql),
		[EQueryType.CLICKHOUSE]: () =>
			getSelectedQueryOptions(currentQuery.clickhouse_sql),
	};

	return queryConfig[currentQuery.queryType]?.() || [];
}

export function getCategoryByOptionId(id: string): string | undefined {
	const categories = getYAxisCategories(YAxisSource.ALERTS);
	return categories.find((category) =>
		category.units.some((unit) => unit.id === id),
	)?.name;
}

export function getCategorySelectOptionByName(
	name: string | undefined,
): DefaultOptionType[] {
	if (!name) {
		return [];
	}

	const categories = getYAxisCategories(YAxisSource.ALERTS);
	if (!categories.length) {
		return [];
	}

	return (
		categories
			.find((category) => category.name === name)
			?.units.map((unit) => ({
				label: unit.name,
				value: unit.id,
				'data-testid': `threshold-unit-select-option-${unit.id}`,
			})) || []
	);
}

const getOperatorWord = (op: AlertThresholdOperator): string => {
	switch (op) {
		case AlertThresholdOperator.IS_ABOVE:
			return 'exceed';
		case AlertThresholdOperator.IS_BELOW:
			return 'fall below';
		case AlertThresholdOperator.IS_EQUAL_TO:
			return 'equal';
		case AlertThresholdOperator.IS_NOT_EQUAL_TO:
			return 'not equal';
		default:
			return 'exceed';
	}
};

const getThresholdValue = (op: AlertThresholdOperator): number => {
	switch (op) {
		case AlertThresholdOperator.IS_ABOVE:
			return 80;
		case AlertThresholdOperator.IS_BELOW:
			return 50;
		case AlertThresholdOperator.IS_EQUAL_TO:
			return 100;
		case AlertThresholdOperator.IS_NOT_EQUAL_TO:
			return 0;
		default:
			return 80;
	}
};

const getDataPoints = (
	matchType: AlertThresholdMatchType,
	op: AlertThresholdOperator,
): number[] => {
	const dataPointMap: Record<
		AlertThresholdMatchType,
		Record<AlertThresholdOperator, number[]>
	> = {
		[AlertThresholdMatchType.AT_LEAST_ONCE]: {
			[AlertThresholdOperator.IS_BELOW]: [60, 45, 40, 55, 35],
			[AlertThresholdOperator.IS_EQUAL_TO]: [95, 100, 105, 90, 100],
			[AlertThresholdOperator.IS_NOT_EQUAL_TO]: [5, 0, 10, 15, 0],
			[AlertThresholdOperator.IS_ABOVE]: [75, 85, 90, 78, 95],
			[AlertThresholdOperator.ABOVE_BELOW]: [75, 85, 90, 78, 95],
		},
		[AlertThresholdMatchType.ALL_THE_TIME]: {
			[AlertThresholdOperator.IS_BELOW]: [45, 40, 35, 42, 38],
			[AlertThresholdOperator.IS_EQUAL_TO]: [100, 100, 100, 100, 100],
			[AlertThresholdOperator.IS_NOT_EQUAL_TO]: [5, 10, 15, 8, 12],
			[AlertThresholdOperator.IS_ABOVE]: [85, 87, 90, 88, 95],
			[AlertThresholdOperator.ABOVE_BELOW]: [85, 87, 90, 88, 95],
		},
		[AlertThresholdMatchType.ON_AVERAGE]: {
			[AlertThresholdOperator.IS_BELOW]: [60, 40, 45, 35, 45],
			[AlertThresholdOperator.IS_EQUAL_TO]: [95, 105, 100, 95, 105],
			[AlertThresholdOperator.IS_NOT_EQUAL_TO]: [5, 10, 15, 8, 12],
			[AlertThresholdOperator.IS_ABOVE]: [75, 85, 90, 78, 95],
			[AlertThresholdOperator.ABOVE_BELOW]: [75, 85, 90, 78, 95],
		},
		[AlertThresholdMatchType.IN_TOTAL]: {
			[AlertThresholdOperator.IS_BELOW]: [8, 5, 10, 12, 8],
			[AlertThresholdOperator.IS_EQUAL_TO]: [20, 20, 20, 20, 20],
			[AlertThresholdOperator.IS_NOT_EQUAL_TO]: [10, 15, 25, 5, 30],
			[AlertThresholdOperator.IS_ABOVE]: [10, 15, 25, 5, 30],
			[AlertThresholdOperator.ABOVE_BELOW]: [10, 15, 25, 5, 30],
		},
		[AlertThresholdMatchType.LAST]: {
			[AlertThresholdOperator.IS_BELOW]: [75, 85, 90, 78, 45],
			[AlertThresholdOperator.IS_EQUAL_TO]: [75, 85, 90, 78, 100],
			[AlertThresholdOperator.IS_NOT_EQUAL_TO]: [75, 85, 90, 78, 25],
			[AlertThresholdOperator.IS_ABOVE]: [75, 85, 90, 78, 95],
			[AlertThresholdOperator.ABOVE_BELOW]: [75, 85, 90, 78, 95],
		},
	};

	return dataPointMap[matchType]?.[op] || [75, 85, 90, 78, 95];
};

const getTooltipOperatorSymbol = (op: AlertThresholdOperator): string => {
	const symbolMap: Record<AlertThresholdOperator, string> = {
		[AlertThresholdOperator.IS_ABOVE]: '>',
		[AlertThresholdOperator.IS_BELOW]: '<',
		[AlertThresholdOperator.IS_EQUAL_TO]: '=',
		[AlertThresholdOperator.IS_NOT_EQUAL_TO]: '!=',
		[AlertThresholdOperator.ABOVE_BELOW]: '>',
	};
	return symbolMap[op] || '>';
};

const handleTooltipClick = (
	e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>,
): void => {
	e.stopPropagation();
};

function TooltipContent({
	children,
}: {
	children: React.ReactNode;
}): JSX.Element {
	return (
		<div
			role="button"
			tabIndex={0}
			onClick={handleTooltipClick}
			onKeyDown={(e): void => {
				if (e.key === 'Enter' || e.key === ' ') {
					handleTooltipClick(e);
				}
			}}
			className="tooltip-content"
		>
			{children}
		</div>
	);
}

function TooltipExample({
	children,
	dataPoints,
	operatorSymbol,
	thresholdValue,
	matchType,
}: {
	children: React.ReactNode;
	dataPoints: number[];
	operatorSymbol: string;
	thresholdValue: number;
	matchType: AlertThresholdMatchType;
}): JSX.Element {
	const { t } = useTranslation('pages');
	return (
		<div className="tooltip-example">
			<strong>{t('al_v2_tooltip_example', { defaultValue: 'Example:' })}</strong>
			<br />
			{t('al_v2_tooltip_example_intro', {
				defaultValue:
					'Say, For a 5-minute window (configured in Evaluation settings), 1 min aggregation interval (set up in query) → 5',
			})}{' '}
			{matchType === AlertThresholdMatchType.IN_TOTAL
				? t('al_v2_tooltip_error_counts', { defaultValue: 'error counts' })
				: t('al_v2_tooltip_data_points', { defaultValue: 'data points' })}
			: [{dataPoints.join(', ')}]<br />
			{t('al_v2_tooltip_with_threshold', {
				defaultValue: 'With threshold',
			})}{' '}
			{operatorSymbol} {thresholdValue}: {children}
		</div>
	);
}

function TooltipLink(): JSX.Element {
	const { t } = useTranslation('pages');
	return (
		<div className="tooltip-link">
			<a
				href="https://signoz.io/docs"
				target="_blank"
				rel="noopener noreferrer"
				className="tooltip-link-text"
			>
				{t('al_v2_learn_more', { defaultValue: 'Learn more' })}
			</a>
		</div>
	);
}

export const getMatchTypeTooltip = (
	matchType: AlertThresholdMatchType,
	operator: AlertThresholdOperator,
	t: TraducirFn,
): React.ReactNode => {
	const operatorSymbol = getTooltipOperatorSymbol(operator);
	const operatorWord = getOperatorWord(operator);
	const thresholdValue = getThresholdValue(operator);
	const dataPoints = getDataPoints(matchType, operator);
	const getMatchingPointsCount = (): number =>
		dataPoints.filter((p) => {
			switch (operator) {
				case AlertThresholdOperator.IS_ABOVE:
					return p > thresholdValue;
				case AlertThresholdOperator.IS_BELOW:
					return p < thresholdValue;
				case AlertThresholdOperator.IS_EQUAL_TO:
					return p === thresholdValue;
				case AlertThresholdOperator.IS_NOT_EQUAL_TO:
					return p !== thresholdValue;
				default:
					return p > thresholdValue;
			}
		}).length;

	switch (matchType) {
		case AlertThresholdMatchType.AT_LEAST_ONCE:
			return (
				<TooltipContent>
					<div className="tooltip-description">
						{t('al_v2_match_at_least_once_desc_pre', {
							defaultValue:
								'Data is aggregated at each interval within your evaluation window, creating multiple data points. This option triggers if',
						})}{' '}
						<span>{t('al_v2_emphasis_any', { defaultValue: 'ANY' })}</span>{' '}
						{t('al_v2_match_at_least_once_desc_post', {
							defaultValue:
								'of those aggregated data points crosses the threshold.',
						})}
					</div>
					<TooltipExample
						dataPoints={dataPoints}
						operatorSymbol={operatorSymbol}
						thresholdValue={thresholdValue}
						matchType={matchType}
					>
						{t('al_v2_alert_triggers_points', {
							defaultValue: 'Alert triggers ({{count}} points {{operatorWord}} {{value}})',
							count: getMatchingPointsCount(),
							operatorWord,
							value: thresholdValue,
						})}
					</TooltipExample>
					<TooltipLink />
				</TooltipContent>
			);

		case AlertThresholdMatchType.ALL_THE_TIME:
			return (
				<TooltipContent>
					<div className="tooltip-description">
						{t('al_v2_match_all_time_desc_pre', {
							defaultValue:
								'Data is aggregated at each interval within your evaluation window, creating multiple data points. This option triggers if',
						})}{' '}
						<span>{t('al_v2_emphasis_all', { defaultValue: 'ALL' })}</span>{' '}
						{t('al_v2_match_all_time_desc_post', {
							defaultValue: 'aggregated data points cross the threshold.',
						})}
					</div>
					<TooltipExample
						dataPoints={dataPoints}
						operatorSymbol={operatorSymbol}
						thresholdValue={thresholdValue}
						matchType={matchType}
					>
						{t('al_v2_alert_triggers_all_points', {
							defaultValue: 'Alert triggers (all points {{operatorWord}} {{value}})',
							operatorWord,
							value: thresholdValue,
						})}
						<br />
						{t('al_v2_alert_no_fire_if_point', {
							defaultValue: 'If any point was {{value}}, no alert would fire',
							value: thresholdValue,
						})}
					</TooltipExample>
					<TooltipLink />
				</TooltipContent>
			);

		case AlertThresholdMatchType.ON_AVERAGE: {
			const average = (
				dataPoints.reduce((a, b) => a + b, 0) / dataPoints.length
			).toFixed(1);
			return (
				<TooltipContent>
					<div className="tooltip-description">
						{t('al_v2_match_average_desc_pre', {
							defaultValue:
								'Data is aggregated at each interval within your evaluation window, creating multiple data points. This option triggers if the',
						})}{' '}
						<span>{t('al_v2_emphasis_average', { defaultValue: 'AVERAGE' })}</span>{' '}
						{t('al_v2_match_average_desc_post', {
							defaultValue:
								'of all aggregated data points crosses the threshold.',
						})}
					</div>
					<TooltipExample
						dataPoints={dataPoints}
						operatorSymbol={operatorSymbol}
						thresholdValue={thresholdValue}
						matchType={matchType}
					>
						{t('al_v2_alert_triggers_average', {
							defaultValue: 'Alert triggers (average = {{value}})',
							value: average,
						})}
					</TooltipExample>
					<TooltipLink />
				</TooltipContent>
			);
		}

		case AlertThresholdMatchType.IN_TOTAL: {
			const total = dataPoints.reduce((a, b) => a + b, 0);
			return (
				<TooltipContent>
					<div className="tooltip-description">
						{t('al_v2_match_total_desc_pre', {
							defaultValue:
								'Data is aggregated at each interval within your evaluation window, creating multiple data points. This option triggers if the',
						})}{' '}
						<span>{t('al_v2_emphasis_sum', { defaultValue: 'SUM' })}</span>{' '}
						{t('al_v2_match_total_desc_post', {
							defaultValue:
								'of all aggregated data points crosses the threshold.',
						})}
					</div>
					<TooltipExample
						dataPoints={dataPoints}
						operatorSymbol={operatorSymbol}
						thresholdValue={thresholdValue}
						matchType={matchType}
					>
						{t('al_v2_alert_triggers_total', {
							defaultValue: 'Alert triggers (total = {{value}})',
							value: total,
						})}
					</TooltipExample>
					<TooltipLink />
				</TooltipContent>
			);
		}

		case AlertThresholdMatchType.LAST: {
			const lastPoint = dataPoints[dataPoints.length - 1];
			return (
				<TooltipContent>
					<div className="tooltip-description">
						{t('al_v2_match_last_desc_pre', {
							defaultValue:
								'Data is aggregated at each interval within your evaluation window, creating multiple data points. This option triggers based on the',
						})}{' '}
						<span>
							{t('al_v2_emphasis_most_recent', { defaultValue: 'MOST RECENT' })}
						</span>{' '}
						{t('al_v2_match_last_desc_post', {
							defaultValue: 'aggregated data point only.',
						})}
					</div>
					<TooltipExample
						dataPoints={dataPoints}
						operatorSymbol={operatorSymbol}
						thresholdValue={thresholdValue}
						matchType={matchType}
					>
						{t('al_v2_alert_triggers_last', {
							defaultValue: 'Alert triggers (last point = {{value}})',
							value: lastPoint,
						})}
					</TooltipExample>
					<TooltipLink />
				</TooltipContent>
			);
		}

		default:
			return '';
	}
};

export function NotificationChannelsNotFoundContent({
	user,
	refreshChannels,
}: {
	user: IUser;
	refreshChannels: () => void;
}): JSX.Element {
	const { t } = useTranslation('pages');
	return (
		<Flex justify="space-between">
			<Flex gap={4} align="center">
				<Typography.Text>
					{t('al_v2_no_channels_yet', { defaultValue: 'No channels yet.' })}
				</Typography.Text>
				{user?.role === USER_ROLES.ADMIN ? (
					<Typography.Text>
						{t('al_v2_create_one', { defaultValue: 'Create one' })}
						<Button
							style={{ padding: '0 4px' }}
							type="link"
							onClick={(): void => {
								openInNewTab(ROUTES.CHANNELS_NEW);
							}}
						>
							{t('al_v2_create_one_here', { defaultValue: 'here.' })}
						</Button>
					</Typography.Text>
				) : (
					<Typography.Text>
						{t('al_v2_ask_admin_channels', {
							defaultValue: 'Please ask your admin to create one.',
						})}
					</Typography.Text>
				)}
			</Flex>
			<Button type="text" onClick={refreshChannels}>
				{t('al_v2_refresh', { defaultValue: 'Refresh' })}
			</Button>
		</Flex>
	);
}

export function RoutingPolicyBanner({
	notificationSettings,
	setNotificationSettings,
}: RoutingPolicyBannerProps): JSX.Element {
	const { t } = useTranslation('pages');
	const { safeNavigate } = useSafeNavigate();
	return (
		<div className="routing-policies-info-banner">
			<Typography.Text>
				{t('al_v2_use_routing_policies_pre', { defaultValue: 'Use' })}{' '}
				<strong>
					{t('al_v2_routing_policies', { defaultValue: 'Routing Policies' })}
				</strong>{' '}
				{t('al_v2_use_routing_policies_post', {
					defaultValue: 'for dynamic routing',
				})}
			</Typography.Text>
			<div className="routing-policies-info-banner-right">
				<Switch
					value={notificationSettings.routingPolicies}
					testId="routing-policies-switch"
					onChange={(value): void => {
						setNotificationSettings({
							type: 'SET_ROUTING_POLICIES',
							payload: value,
						});
					}}
				/>
				<Button
					type="link"
					className="view-routing-policies-button"
					data-testid="view-routing-policies-button"
					onClick={(): void => safeNavigate(ROUTING_POLICIES_ROUTE)}
				>
					{t('al_v2_view_routing_policies', {
						defaultValue: 'View Routing Policies',
					})}
					<ArrowRight size={14} />
				</Button>
			</div>
		</div>
	);
}
