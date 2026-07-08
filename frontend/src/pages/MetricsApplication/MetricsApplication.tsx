import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Tabs, TabsProps } from 'antd';
import { QueryParams } from 'constants/query';
import DBCall from 'container/MetricsApplication/Tabs/DBCall';
import External from 'container/MetricsApplication/Tabs/External';
import Overview from 'container/MetricsApplication/Tabs/Overview';
import ResourceAttributesFilter from 'container/ResourceAttributesFilter';
import { useSafeNavigate } from 'hooks/useSafeNavigate';
import useUrlQuery from 'hooks/useUrlQuery';

import ApDexApplication from './ApDex/ApDexApplication';
import {
	MetricsApplicationTab,
	TAB_KEY_VS_I18N_KEY,
	TAB_KEY_VS_LABEL,
} from './types';
import useMetricsApplicationTabKey from './useMetricsApplicationTabKey';

import './MetricsApplication.styles.scss';

function MetricsApplication(): JSX.Element {
	const { t } = useTranslation('pages');
	const { servicename: encodedServiceName } = useParams<{
		servicename: string;
	}>();

	const activeKey = useMetricsApplicationTabKey();

	// Nombre del servicio para el encabezado: el param viene URL-encoded (puede traer
	// caracteres especiales), se decodifica para mostrarlo legible y recordar qué servicio
	// se está viendo (antes la página no tenía ningún título de contexto).
	const serviceName = decodeURIComponent(encodedServiceName ?? '');

	const urlQuery = useUrlQuery();
	const { safeNavigate } = useSafeNavigate();

	const items: TabsProps['items'] = [
		{
			label: t(TAB_KEY_VS_I18N_KEY[MetricsApplicationTab.OVER_METRICS], {
				defaultValue: TAB_KEY_VS_LABEL[MetricsApplicationTab.OVER_METRICS],
			}),
			key: MetricsApplicationTab.OVER_METRICS,
			children: <Overview />,
		},
		{
			label: t(TAB_KEY_VS_I18N_KEY[MetricsApplicationTab.DB_CALL_METRICS], {
				defaultValue: TAB_KEY_VS_LABEL[MetricsApplicationTab.DB_CALL_METRICS],
			}),
			key: MetricsApplicationTab.DB_CALL_METRICS,
			children: <DBCall />,
		},
		{
			label: t(TAB_KEY_VS_I18N_KEY[MetricsApplicationTab.EXTERNAL_METRICS], {
				defaultValue: TAB_KEY_VS_LABEL[MetricsApplicationTab.EXTERNAL_METRICS],
			}),
			key: MetricsApplicationTab.EXTERNAL_METRICS,
			children: <External />,
		},
	];

	const onTabChange = (tab: string): void => {
		urlQuery.set(QueryParams.tab, tab);
		safeNavigate(`/services/${encodedServiceName}?${urlQuery.toString()}`);
	};

	return (
		<div className="metrics-application-container">
			<div className="metrics-application-header">
				<span className="metrics-application-header__eyebrow">
					{t('service', { defaultValue: 'Servicio' })}
				</span>
				<h1 className="metrics-application-header__title" title={serviceName}>
					{serviceName}
				</h1>
			</div>
			<ResourceAttributesFilter />
			<ApDexApplication />
			<Tabs
				items={items}
				activeKey={activeKey}
				className="service-route-tab"
				destroyInactiveTabPane
				onChange={onTabChange}
			/>
		</div>
	);
}

export default MetricsApplication;
