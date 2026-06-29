import { useTranslation } from 'react-i18next';
import { TabRoutes } from 'components/RouteTab/types';
import ROUTES from 'constants/routes';
import ExplorerPage from 'container/MetricsExplorer/Explorer';
import SummaryPage from 'container/MetricsExplorer/Summary';
import { BarChart, Compass, TowerControl } from '@signozhq/icons';
import SaveView from 'pages/SaveView';

// Etiqueta de pestaña traducible (los `name` son nodos a nivel de módulo).
function TabName({
	icon,
	tKey,
	fallback,
}: {
	icon: JSX.Element;
	tKey: string;
	fallback: string;
}): JSX.Element {
	const { t } = useTranslation('pages');
	return (
		<div className="tab-item">
			{icon} {t(tKey, { defaultValue: fallback })}
		</div>
	);
}

export const Summary: TabRoutes = {
	Component: SummaryPage,
	name: (
		<TabName icon={<BarChart size={16} />} tKey="modtab_summary" fallback="Summary" />
	),
	route: ROUTES.METRICS_EXPLORER,
	key: ROUTES.METRICS_EXPLORER,
};

export const Explorer: TabRoutes = {
	Component: (): JSX.Element => <ExplorerPage />,
	name: (
		<TabName
			icon={<Compass size={16} />}
			tKey="modtab_explorer"
			fallback="Explorer"
		/>
	),
	route: ROUTES.METRICS_EXPLORER_EXPLORER,
	key: ROUTES.METRICS_EXPLORER_EXPLORER,
};

export const Views: TabRoutes = {
	Component: SaveView,
	name: (
		<TabName
			icon={<TowerControl size={16} />}
			tKey="modtab_views"
			fallback="Views"
		/>
	),
	route: ROUTES.METRICS_EXPLORER_VIEWS,
	key: ROUTES.METRICS_EXPLORER_VIEWS,
};
