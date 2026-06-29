import { useTranslation } from 'react-i18next';
import { TabRoutes } from 'components/RouteTab/types';
import ROUTES from 'constants/routes';
import { Compass, TowerControl, Workflow } from '@signozhq/icons';
import LogsExplorer from 'pages/LogsExplorer';
import Pipelines from 'pages/Pipelines';
import SaveView from 'pages/SaveView';

// Etiqueta de pestaña traducible: los `name` se definen a nivel de módulo, así que
// este componente permite usar i18n en tiempo de render.
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

export const logsExplorer: TabRoutes = {
	Component: (): JSX.Element => <LogsExplorer />,
	name: (
		<TabName
			icon={<Compass size={16} />}
			tKey="modtab_explorer"
			fallback="Explorer"
		/>
	),
	route: ROUTES.LOGS,
	key: ROUTES.LOGS,
};

export const logsPipelines: TabRoutes = {
	Component: (): JSX.Element => <Pipelines />,
	name: (
		<TabName
			icon={<Workflow size={16} />}
			tKey="modtab_pipelines"
			fallback="Pipelines"
		/>
	),
	route: ROUTES.LOGS_PIPELINES,
	key: ROUTES.LOGS_PIPELINES,
};

export const logSaveView: TabRoutes = {
	Component: SaveView,
	name: (
		<TabName
			icon={<TowerControl size={16} />}
			tKey="modtab_views"
			fallback="Views"
		/>
	),
	route: ROUTES.LOGS_SAVE_VIEWS,
	key: ROUTES.LOGS_SAVE_VIEWS,
};
