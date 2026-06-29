import { Button } from 'antd';
import { Typography } from '@signozhq/ui/typography';
import Modal from 'components/Modal';
import { useTranslation } from 'react-i18next';

function SkipOnBoardingModal({ onContinueClick }: Props): JSX.Element {
	const { t } = useTranslation('pages');

	return (
		<Modal
			title={t('pages:svc_setup_instrumentation', {
				defaultValue: 'Setup instrumentation',
			})}
			isModalVisible
			closable={false}
			footer={[
				<Button key="submit" type="primary" onClick={onContinueClick}>
					{t('pages:svc_continue_without_instrumentation', {
						defaultValue: 'Continue without instrumentation',
					})}
				</Button>,
			]}
		>
			<>
				<iframe
					width="100%"
					height="265"
					src="https://www.youtube.com/embed/J1Bof55DOb4"
					frameBorder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
					title="youtube_video"
				/>
				<div>
					<Typography>
						{t('pages:svc_no_instrumentation_data', {
							defaultValue: 'No instrumentation data.',
						})}
					</Typography>
					<Typography>
						{t('pages:svc_instrument_app_prefix', {
							defaultValue: 'Please instrument your application as mentioned',
						})}
						&nbsp;
						<a
							href="https://signoz.io/docs/instrumentation/overview"
							target="_blank"
							rel="noreferrer"
						>
							{t('pages:svc_instrument_app_here', { defaultValue: 'here' })}
						</a>
					</Typography>
				</div>
			</>
		</Modal>
	);
}

interface Props {
	onContinueClick: () => void;
}

export default SkipOnBoardingModal;
