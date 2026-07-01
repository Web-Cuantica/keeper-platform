import type { TFunction } from 'i18next';
import { DataSource } from 'types/common/queryBuilder';

export const getAlertInfoLinks = (
	t: TFunction,
): {
	infoText: string;
	link: string;
	leftIconVisible: boolean;
	rightIconVisible: boolean;
	dataSource: DataSource;
}[] => [
	{
		infoText: t('pages:al_link_create_metrics_alerts', {
			defaultValue: 'How to create Metrics-based alerts',
		}),
		link:
			'https://signoz.io/docs/alerts-management/metrics-based-alerts/?utm_source=product&utm_medium=alert-empty-page',
		leftIconVisible: false,
		rightIconVisible: true,
		dataSource: DataSource.METRICS,
	},
	{
		infoText: t('pages:al_link_create_log_alerts', {
			defaultValue: 'How to create Log-based alerts',
		}),
		link:
			'https://signoz.io/docs/alerts-management/log-based-alerts/?utm_source=product&utm_medium=alert-empty-page',
		leftIconVisible: false,
		rightIconVisible: true,
		dataSource: DataSource.LOGS,
	},
	{
		infoText: t('pages:al_link_create_trace_alerts', {
			defaultValue: 'How to create Trace-based alerts',
		}),
		link:
			'https://signoz.io/docs/alerts-management/trace-based-alerts/?utm_source=product&utm_medium=alert-empty-page',
		leftIconVisible: false,
		rightIconVisible: true,
		dataSource: DataSource.TRACES,
	},
];

export const getAlertCards = (
	t: TFunction,
): {
	header: string;
	subheader: string;
	dataSource: DataSource;
	link: string;
}[] => [
	{
		header: t('pages:al_card_high_memory_header', {
			defaultValue: 'Alert on high memory usage',
		}),
		subheader: t('pages:al_card_high_memory_subheader', {
			defaultValue: "Monitor your host's memory usage",
		}),
		dataSource: DataSource.METRICS,
		link:
			'https://signoz.io/docs/alerts-management/metrics-based-alerts/?utm_source=product&utm_medium=alert-empty-page#1-alert-when-memory-usage-for-host-goes-above-400-mb-or-any-fixed-memory',
	},
	{
		header: t('pages:al_card_slow_api_header', {
			defaultValue: 'Alert on slow external API calls',
		}),
		subheader: t('pages:al_card_slow_api_subheader', {
			defaultValue: 'Monitor your external API calls',
		}),
		dataSource: DataSource.TRACES,
		link:
			'https://signoz.io/docs/alerts-management/trace-based-alerts/?utm_source=product&utm_medium=alert-empty-page#1-alert-when-external-api-latency-p90-is-over-1-second-for-last-5-mins',
	},
	{
		header: t('pages:al_card_timeout_errors_header', {
			defaultValue: 'Alert on high percentage of timeout errors in logs',
		}),
		subheader: t('pages:al_card_timeout_errors_subheader', {
			defaultValue: 'Monitor your logs for errors',
		}),
		dataSource: DataSource.LOGS,
		link:
			'https://signoz.io/docs/alerts-management/log-based-alerts/?utm_source=product&utm_medium=alert-empty-page#1-alert-when-percentage-of-redis-timeout-error-logs-greater-than-7-in-last-5-mins',
	},
	{
		header: t('pages:al_card_error_percentage_header', {
			defaultValue: 'Alert on high error percentage of an endpoint',
		}),
		subheader: t('pages:al_card_error_percentage_subheader', {
			defaultValue: 'Monitor your API endpoint',
		}),
		dataSource: DataSource.METRICS,
		link:
			'https://signoz.io/docs/alerts-management/metrics-based-alerts/?utm_source=product&utm_medium=alert-empty-page#3-alert-when-the-error-percentage-for-an-endpoint-exceeds-5',
	},
];
