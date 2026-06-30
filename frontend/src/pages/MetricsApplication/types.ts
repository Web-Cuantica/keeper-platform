import { UseMutateAsyncFunction } from 'react-query';
import type { NotificationInstance } from 'antd/es/notification/interface';
import {
	ApDexPayloadAndSettingsProps,
	SetApDexPayloadProps,
} from 'types/api/metrics/getApDex';

export enum MetricsApplicationTab {
	OVER_METRICS = 'OVER_METRICS',
	DB_CALL_METRICS = 'DB_CALL_METRICS',
	EXTERNAL_METRICS = 'EXTERNAL_METRICS',
}

export const TAB_KEY_VS_LABEL = {
	[MetricsApplicationTab.OVER_METRICS]: 'Overview',
	[MetricsApplicationTab.DB_CALL_METRICS]: 'DB Call Metrics',
	[MetricsApplicationTab.EXTERNAL_METRICS]: 'External Metrics',
};

// Mapa de cada pestaña a su clave de i18n (namespace 'pages').
// Las CLAVES del enum no cambian; solo se traduce la etiqueta mostrada en render.
export const TAB_KEY_VS_I18N_KEY: Record<MetricsApplicationTab, string> = {
	[MetricsApplicationTab.OVER_METRICS]: 'svc_tab_overview',
	[MetricsApplicationTab.DB_CALL_METRICS]: 'svc_tab_db_call_metrics',
	[MetricsApplicationTab.EXTERNAL_METRICS]: 'svc_tab_external_metrics',
};

export interface OnSaveApDexSettingsProps {
	thresholdValue: number;
	servicename: string;
	notifications: NotificationInstance;
	refetchGetApDexSetting?: VoidFunction;
	mutateAsync: UseMutateAsyncFunction<
		SetApDexPayloadProps,
		Error,
		ApDexPayloadAndSettingsProps
	>;
	handlePopOverClose: VoidFunction;
}
