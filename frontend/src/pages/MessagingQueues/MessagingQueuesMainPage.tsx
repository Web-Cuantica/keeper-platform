import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import RouteTab from 'components/RouteTab';
import { TabRoutes } from 'components/RouteTab/types';
import ROUTES from 'constants/routes';
import history from 'lib/history';
import { ListMinus, Rows3 } from '@signozhq/icons';
import CeleryOverview from 'pages/Celery/CeleryOverview/CeleryOverview';

import CeleryTask from '../Celery/CeleryTask/CeleryTask';
import MessagingQueues from './MessagingQueues';
import MQDetailPage from './MQDetailPage/MQDetailPage';

import './MessagingQueuesMainPage.styles.scss';

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

export const Kafka: TabRoutes = {
	Component: MessagingQueues,
	name: (
		<div className="tab-item">
			<ListMinus size={16} /> Kafka
		</div>
	),
	route: ROUTES.MESSAGING_QUEUES_KAFKA,
	key: ROUTES.MESSAGING_QUEUES_KAFKA,
};

export const KafkaDetail: TabRoutes = {
	Component: MQDetailPage,
	name: (
		<div className="tab-item">
			<ListMinus size={16} /> Kafka
		</div>
	),
	route: ROUTES.MESSAGING_QUEUES_KAFKA_DETAIL,
	key: ROUTES.MESSAGING_QUEUES_KAFKA_DETAIL,
};

export const Celery: TabRoutes = {
	Component: CeleryTask,
	name: (
		<div className="tab-item">
			<Rows3 size={16} /> Celery
		</div>
	),
	route: ROUTES.MESSAGING_QUEUES_CELERY_TASK,
	key: ROUTES.MESSAGING_QUEUES_CELERY_TASK,
};

export const Overview: TabRoutes = {
	Component: CeleryOverview,
	name: (
		<TabName icon={<Rows3 size={16} />} tKey="modtab_overview" fallback="Overview" />
	),
	route: ROUTES.MESSAGING_QUEUES_OVERVIEW,
	key: ROUTES.MESSAGING_QUEUES_OVERVIEW,
};

export default function MessagingQueuesMainPage(): JSX.Element {
	const { pathname } = useLocation();

	const isKafkaDetail = pathname === ROUTES.MESSAGING_QUEUES_KAFKA_DETAIL;

	const routes: TabRoutes[] = [
		Overview,
		isKafkaDetail ? KafkaDetail : Kafka,
		Celery,
	];

	return (
		<div className="messaging-queues-module-container">
			<RouteTab routes={routes} activeKey={pathname} history={history} />
		</div>
	);
}
