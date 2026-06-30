import { ORG_PREFERENCES } from 'constants/orgPreferences';
import ROUTES from 'constants/routes';

import circusTentUrl from '@/assets/Icons/circus-tent.svg';
import eightBallUrl from '@/assets/Icons/eight-ball.svg';

import { ChecklistItem } from './HomeChecklist/HomeChecklist';

const ITEM_ICONS = [circusTentUrl, eightBallUrl];

export function getItemIcon(id: string): string {
	if (!id) {
		return ITEM_ICONS[0];
	}
	return ITEM_ICONS[id.charCodeAt(id.length - 1) % ITEM_ICONS.length];
}

export const checkListStepToPreferenceKeyMap = {
	WILL_DO_LATER: ORG_PREFERENCES.WELCOME_CHECKLIST_DO_LATER,
	SEND_LOGS: ORG_PREFERENCES.WELCOME_CHECKLIST_SEND_LOGS_SKIPPED,
	SEND_TRACES: ORG_PREFERENCES.WELCOME_CHECKLIST_SEND_TRACES_SKIPPED,
	SEND_METRICS: ORG_PREFERENCES.WELCOME_CHECKLIST_SEND_METRICS_SKIPPED,
	SETUP_DASHBOARDS: ORG_PREFERENCES.WELCOME_CHECKLIST_SETUP_DASHBOARDS_SKIPPED,
	SETUP_ALERTS: ORG_PREFERENCES.WELCOME_CHECKLIST_SETUP_ALERTS_SKIPPED,
	SETUP_SAVED_VIEWS: ORG_PREFERENCES.WELCOME_CHECKLIST_SETUP_SAVED_VIEW_SKIPPED,
	SETUP_WORKSPACE: ORG_PREFERENCES.WELCOME_CHECKLIST_SETUP_WORKSPACE_SKIPPED,
	ADD_DATA_SOURCE: ORG_PREFERENCES.WELCOME_CHECKLIST_ADD_DATA_SOURCE_SKIPPED,
};

export const DOCS_LINKS = {
	ADD_DATA_SOURCE: 'https://signoz.io/docs/instrumentation/overview/',
	SEND_LOGS: 'https://signoz.io/docs/userguide/logs/',
	SEND_TRACES: 'https://signoz.io/docs/userguide/traces/',
	SEND_METRICS: 'https://signoz.io/docs/metrics-management/metrics-explorer/',
	SETUP_ALERTS: 'https://signoz.io/docs/userguide/alerts-management/',
	SETUP_SAVED_VIEWS:
		'https://signoz.io/docs/product-features/saved-view/#step-2-save-your-view',
	SETUP_DASHBOARDS: 'https://signoz.io/docs/userguide/manage-dashboards/',
};

// Función de traducción tipada localmente para no importar TFunction
type TFunc = (key: string, options?: Record<string, unknown>) => string;

// Genera la lista de pasos del onboarding ("Construye tu base de observabilidad")
// traducida con el namespace "home". Recibe `t` desde el componente que la renderiza.
export function getDefaultChecklistItems(t: TFunc): ChecklistItem[] {
	return [
		{
			id: 'SETUP_WORKSPACE',
			title: t('steps_item_setup_workspace', {
				defaultValue: 'Set up your workspace',
			}),
			description: '',
			completed: true,
			isSkipped: false,
			isSkippable: false,
			skippedPreferenceKey: checkListStepToPreferenceKeyMap.SETUP_WORKSPACE,
		},
		{
			id: 'ADD_DATA_SOURCE',
			title: t('steps_item_add_data_source', {
				defaultValue: 'Add your first data source',
			}),
			description: '',
			completed: false,
			isSkipped: false,
			skippedPreferenceKey: checkListStepToPreferenceKeyMap.ADD_DATA_SOURCE,
			toRoute: ROUTES.GET_STARTED_WITH_CLOUD,
			docsLink: DOCS_LINKS.ADD_DATA_SOURCE,
			isSkippable: false,
		},
		{
			id: 'SEND_LOGS',
			title: t('steps_item_send_logs', { defaultValue: 'Send your logs' }),
			description: t('steps_item_send_logs_desc', {
				defaultValue:
					'Send your logs to Keeper to get more visibility into how your resources interact.',
			}),
			completed: false,
			isSkipped: false,
			isSkippable: true,
			skippedPreferenceKey: checkListStepToPreferenceKeyMap.SEND_LOGS,
			toRoute: ROUTES.GET_STARTED_WITH_CLOUD,
			docsLink: DOCS_LINKS.SEND_LOGS,
		},
		{
			id: 'SEND_TRACES',
			title: t('steps_item_send_traces', { defaultValue: 'Send your traces' }),
			description: t('steps_item_send_traces_desc', {
				defaultValue:
					'Send your traces to Keeper to get more visibility into how your resources interact.',
			}),
			completed: false,
			isSkipped: false,
			isSkippable: true,
			skippedPreferenceKey: checkListStepToPreferenceKeyMap.SEND_TRACES,
			toRoute: ROUTES.GET_STARTED_WITH_CLOUD,
			docsLink: DOCS_LINKS.SEND_TRACES,
		},
		{
			id: 'SEND_METRICS',
			title: t('steps_item_send_metrics', { defaultValue: 'Send your metrics' }),
			description: t('steps_item_send_metrics_desc', {
				defaultValue:
					'Send your metrics to Keeper to get more visibility into how your resources interact.',
			}),
			completed: false,
			isSkipped: false,
			isSkippable: true,
			skippedPreferenceKey: checkListStepToPreferenceKeyMap.SEND_METRICS,
			toRoute: ROUTES.GET_STARTED_WITH_CLOUD,
			docsLink: DOCS_LINKS.SEND_METRICS,
		},
		{
			id: 'SETUP_ALERTS',
			title: t('steps_item_setup_alerts', { defaultValue: 'Setup Alerts' }),
			description: t('steps_item_setup_alerts_desc', {
				defaultValue:
					'Setup alerts to get notified when your resources are not performing as expected.',
			}),
			completed: false,
			isSkipped: false,
			isSkippable: true,
			skippedPreferenceKey: checkListStepToPreferenceKeyMap.SETUP_ALERTS,
			toRoute: ROUTES.ALERTS_NEW,
			docsLink: DOCS_LINKS.SETUP_ALERTS,
		},
		{
			id: 'SETUP_SAVED_VIEWS',
			title: t('steps_item_setup_saved_views', {
				defaultValue: 'Setup Saved Views',
			}),
			description: t('steps_item_setup_saved_views_desc', {
				defaultValue:
					'Save your views to get a quick overview of your data and share it with your team.',
			}),
			completed: false,
			isSkipped: false,
			isSkippable: true,
			skippedPreferenceKey: checkListStepToPreferenceKeyMap.SETUP_SAVED_VIEWS,
			toRoute: ROUTES.LOGS_EXPLORER,
			docsLink: DOCS_LINKS.SETUP_SAVED_VIEWS,
		},
		{
			id: 'SETUP_DASHBOARDS',
			title: t('steps_item_setup_dashboards', {
				defaultValue: 'Setup Dashboards',
			}),
			description: t('steps_item_setup_dashboards_desc', {
				defaultValue:
					'Create dashboards to visualize your data and share it with your team.',
			}),
			completed: false,
			isSkipped: false,
			isSkippable: true,
			skippedPreferenceKey: checkListStepToPreferenceKeyMap.SETUP_DASHBOARDS,
			toRoute: ROUTES.ALL_DASHBOARD,
			docsLink: DOCS_LINKS.SETUP_DASHBOARDS,
		},
	];
}
