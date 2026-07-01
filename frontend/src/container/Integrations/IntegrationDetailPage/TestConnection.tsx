import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import cx from 'classnames';

import './IntegrationDetailPage.styles.scss';

export enum ConnectionStates {
	Connected = 'connected',
	TestingConnection = 'testingConnection',
	NoDataSinceLong = 'noDataSinceLong',
	NotInstalled = 'notInstalled',
}

const getConnectionStatesLabelMap = (
	t: TFunction,
): Record<ConnectionStates, string> => ({
	[ConnectionStates.Connected]: t('intg_conn_working', {
		defaultValue: 'This integration is working properly',
	}),
	[ConnectionStates.TestingConnection]: t('intg_conn_listening', {
		defaultValue: 'Listening for data...',
	}),
	[ConnectionStates.NoDataSinceLong]: t('intg_conn_no_data', {
		defaultValue: 'This integration has not received data in a while :/',
	}),
	[ConnectionStates.NotInstalled]: '',
});

interface TestConnectionProps {
	connectionState: ConnectionStates;
}

function TestConnection(props: TestConnectionProps): JSX.Element {
	const { t } = useTranslation('pages');
	const { connectionState } = props;
	const connectionStatesLabelMap = getConnectionStatesLabelMap(t);
	return (
		<div className={cx('connection-container', connectionState)}>
			<ul className="connection-text">
				<li>{connectionStatesLabelMap[connectionState]}</li>
			</ul>
		</div>
	);
}

export default TestConnection;
