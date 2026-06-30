import { useTranslation } from 'react-i18next';
import { TabRoutes } from 'components/RouteTab/types';
import ROUTES from 'constants/routes';
import BreakDownPage from 'container/MeterExplorer/Breakdown/BreakDown';
import ExplorerPage from 'container/MeterExplorer/Explorer';
import { Compass, TowerControl } from '@signozhq/icons';
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

export const Explorer: TabRoutes = {
	Component: (): JSX.Element => <ExplorerPage />,
	name: (
		<TabName icon={<Compass size={16} />} tKey="modtab_explorer" fallback="Explorer" />
	),
	route: ROUTES.METER_EXPLORER,
	key: ROUTES.METER_EXPLORER,
};

export const Views: TabRoutes = {
	Component: SaveView,
	name: (
		<TabName icon={<TowerControl size={16} />} tKey="modtab_views" fallback="Views" />
	),
	route: ROUTES.METER_EXPLORER_VIEWS,
	key: ROUTES.METER_EXPLORER_VIEWS,
};

export const Meter: TabRoutes = {
	Component: BreakDownPage,
	name: (
		<TabName icon={<TowerControl size={16} />} tKey="modtab_meter" fallback="Meter" />
	),
	route: ROUTES.METER,
	key: ROUTES.METER,
};
