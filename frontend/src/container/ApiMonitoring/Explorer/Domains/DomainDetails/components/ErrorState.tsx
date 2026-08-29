import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { Typography } from '@signozhq/ui/typography';
import { RotateCw } from '@signozhq/icons';

import awwSnapUrl from '@/assets/Icons/awwSnap.svg';

function ErrorState({ refetch }: { refetch: () => void }): JSX.Element {
	const { t } = useTranslation('pages');
	return (
		<div className="error-state-container">
			<div className="error-state-content-wrapper">
				<div className="error-state-content">
					<div className="icon">
						<img src={awwSnapUrl} alt="awwSnap" width={32} height={32} />
					</div>
					<div className="error-state-text">
						<Typography.Text>{t('cfg_uhoh_we_ran_into', { defaultValue: "Uh-oh :/ We ran into an error." })}</Typography.Text>
						<Typography.Text color="muted">
							{t('cfg_please_refresh_this_panel', { defaultValue: "Please refresh this panel." })}
						</Typography.Text>
					</div>
				</div>
				<Button
					className="refresh-cta"
					onClick={(): void => refetch()}
					icon={<RotateCw size={16} />}
				>
					{t('cfg_refresh_this_panel', { defaultValue: "Refresh this panel" })}
				</Button>
			</div>
		</div>
	);
}

export default ErrorState;
