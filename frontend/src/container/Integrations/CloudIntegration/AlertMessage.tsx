import { useTranslation } from 'react-i18next';
import { Callout } from '@signozhq/ui/callout';
import { Spin } from 'antd';
import { LoaderCircle } from '@signozhq/icons';

import { ModalStateEnum } from '../HeroSection/types';

function AlertMessage({
	modalState,
}: {
	modalState: ModalStateEnum;
}): JSX.Element | null {
	const { t } = useTranslation('pages');
	switch (modalState) {
		case ModalStateEnum.WAITING:
			return (
				<Callout
					title={
						<div className="cloud-account-setup-form__alert-message">
							<Spin
								indicator={
									<LoaderCircle
										size={14}
										className="anticon anticon-loading anticon-spin ant-spin-dot"
									/>
								}
							/>
							{t('intg_waiting_connection_prefix', {
								defaultValue: 'Waiting for connection, retrying in',
							})}{' '}
							<span className="retry-time">10</span>{' '}
							{t('intg_secs_suffix', { defaultValue: 'secs...' })}
						</div>
					}
					type="info"
					showIcon={false}
				/>
			);
		case ModalStateEnum.ERROR:
			return (
				<Callout
					title={
						<div className="cloud-account-setup-form__alert-message">
							{t('intg_aws_connection_error', {
								defaultValue: `We couldn't establish a connection to your AWS account. Please try again`,
							})}
						</div>
					}
					type="error"
				/>
			);
		default:
			return null;
	}
}

export default AlertMessage;
