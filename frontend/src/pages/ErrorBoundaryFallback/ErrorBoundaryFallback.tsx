import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import ROUTES from 'constants/routes';
import { handleContactSupport } from 'container/Integrations/utils';
import { useGetTenantLicense } from 'hooks/useGetTenantLicense';
import { Home, LifeBuoy } from '@signozhq/icons';
import { withBasePath } from 'utils/basePath';

import cloudUrl from '@/assets/Images/cloud.svg';

import './ErrorBoundaryFallback.styles.scss';

function ErrorBoundaryFallback(): JSX.Element {
	const { t } = useTranslation('pages');
	const handleReload = (): void => {
		// Hard reload resets Sentry.ErrorBoundary state; withBasePath preserves any /signoz/ prefix.
		window.location.href = withBasePath(ROUTES.HOME);
	};

	const { isCloudUser: isCloudUserVal } = useGetTenantLicense();

	const handleSupport = useCallback(() => {
		handleContactSupport(isCloudUserVal);
	}, [isCloudUserVal]);

	return (
		<div className="error-boundary-fallback-container">
			<div className="error-boundary-fallback-content">
				<div className="error-icon">
					<img src={cloudUrl} alt="error-cloud-icon" />
				</div>
				<div className="title">
					{t('cmp_error_boundary_title', {
						defaultValue: 'Something went wrong :/',
					})}
				</div>

				<div className="description">
					{t('cmp_error_boundary_description', {
						defaultValue:
							'Our team is getting on top to resolve this. Please reach out to support if the issue persists.',
					})}
				</div>

				<div className="actions">
					<Button
						type="primary"
						onClick={handleReload}
						icon={<Home size={16} />}
						className="periscope-btn primary"
					>
						{t('cmp_error_boundary_go_home', { defaultValue: 'Go to Home' })}
					</Button>

					<Button
						className="periscope-btn secondary"
						type="default"
						onClick={handleSupport}
						icon={<LifeBuoy size={16} />}
					>
						{t('cmp_error_boundary_contact_support', {
							defaultValue: 'Contact Support',
						})}
					</Button>
				</div>
			</div>
		</div>
	);
}

export default ErrorBoundaryFallback;
