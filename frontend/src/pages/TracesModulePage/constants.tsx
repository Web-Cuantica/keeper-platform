import { matchPath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TabRoutes } from 'components/RouteTab/types';
import ROUTES from 'constants/routes';
import { Compass, Cone, TowerControl } from '@signozhq/icons';
import SaveView from 'pages/SaveView';
import TracesExplorer from 'pages/TracesExplorer';
import TracesFunnelDetails from 'pages/TracesFunnelDetails';
import TracesFunnels from 'pages/TracesFunnels';

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

export const tracesExplorer: TabRoutes = {
	Component: (): JSX.Element => <TracesExplorer />,
	name: (
		<TabName
			icon={<Compass size={16} />}
			tKey="modtab_explorer"
			fallback="Explorer"
		/>
	),
	route: ROUTES.TRACES_EXPLORER,
	key: ROUTES.TRACES_EXPLORER,
};

export const tracesFunnel = (pathname: string): TabRoutes => ({
	Component: (): JSX.Element => {
		const isFunnelDetails = matchPath(pathname, ROUTES.TRACES_FUNNELS_DETAIL);

		return isFunnelDetails ? <TracesFunnelDetails /> : <TracesFunnels />;
	},
	name: (
		<TabName
			icon={<Cone className="funnel-icon" size={16} />}
			tKey="modtab_funnels"
			fallback="Funnels"
		/>
	),
	route: ROUTES.TRACES_FUNNELS,
	key: ROUTES.TRACES_FUNNELS,
});

export const tracesSaveView: TabRoutes = {
	Component: SaveView,
	name: (
		<TabName
			icon={<TowerControl size={16} />}
			tKey="modtab_views"
			fallback="Views"
		/>
	),
	route: ROUTES.TRACES_SAVE_VIEWS,
	key: ROUTES.TRACES_SAVE_VIEWS,
};
