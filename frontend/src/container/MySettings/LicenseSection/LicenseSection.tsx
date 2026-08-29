import { useTranslation } from 'react-i18next';
import { useCopyToClipboard } from 'react-use';
import { Button } from '@signozhq/ui/button';
import { Typography } from '@signozhq/ui/typography';
import { useNotifications } from 'hooks/useNotifications';
import { Copy } from '@signozhq/icons';
import { useAppContext } from 'providers/App/App';
import { getMaskedKey } from 'utils/maskedKey';

import './LicenseSection.styles.scss';

function LicenseSection(): JSX.Element | null {
	const { t } = useTranslation('pages');
	const { activeLicense } = useAppContext();
	const { notifications } = useNotifications();
	const [, handleCopyToClipboard] = useCopyToClipboard();

	const handleCopyKey = (text: string): void => {
		handleCopyToClipboard(text);
		notifications.success({
			message: 'Copied to clipboard',
		});
	};

	if (!activeLicense?.key) {
		return <></>;
	}

	return (
		<div className="license-section">
			<div className="license-section-header">
				<div className="license-section-title">{t('cfg_license', { defaultValue: "License" })}</div>
			</div>

			<div className="license-section-content">
				<div className="license-section-content-item">
					<div className="license-section-content-item-title-action">
						<span>{t('cfg_license_key', { defaultValue: "License key" })}</span>
						<span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
							<Typography.Text code>{getMaskedKey(activeLicense.key)}</Typography.Text>
							<Button
								variant="link"
								color="none"
								aria-label={t('cfg_copy_license_key', { defaultValue: "Copy license key" })}
								data-testid="license-key-copy-btn"
								onClick={(): void => handleCopyKey(activeLicense.key)}
							>
								<Copy size={14} />
							</Button>
						</span>
					</div>

					<div className="license-section-content-item-description">
						{t('cfg_your_signoz_license_key', { defaultValue: "Your SigNoz license key." })}
					</div>
				</div>
			</div>
		</div>
	);
}

export default LicenseSection;
