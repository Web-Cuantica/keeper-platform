import { useTranslation } from 'react-i18next';
import { Skeleton } from 'antd';
import { Badge } from '@signozhq/ui/badge';
import { Button } from '@signozhq/ui/button';
import { Info, KeyRound } from '@signozhq/icons';
import CopyIconButton from '../CopyIconButton';

import './AuthCard.styles.scss';

interface AuthCardProps {
	isAdmin: boolean;
	instanceUrl: string;
	isLoadingInstanceUrl?: boolean;
	onCopyInstanceUrl: () => void;
	onCreateServiceAccount: () => void;
}

function AuthCard({
	isAdmin,
	instanceUrl,
	isLoadingInstanceUrl = false,
	onCopyInstanceUrl,
	onCreateServiceAccount,
}: AuthCardProps): JSX.Element {
	const { t } = useTranslation('pages');
	return (
		<section className="mcp-auth-card">
			<h3 className="mcp-auth-card__title">
				<Badge color="secondary" variant="default">
					2
				</Badge>
				{t('intg_mcp_authenticate_title', {
					defaultValue: 'Authenticate from your client',
				})}
			</h3>
			<p className="mcp-auth-card__description">
				{t('intg_mcp_authenticate_desc', {
					defaultValue:
						'On first connect, your client opens a SigNoz authorization page asking for two values:',
				})}
			</p>

			<div className="mcp-auth-card__field">
				<span className="mcp-auth-card__field-label">
					{t('intg_mcp_instance_url_label', { defaultValue: 'SigNoz Instance URL' })}
				</span>
				{isLoadingInstanceUrl ? (
					<Skeleton.Input active size="small" />
				) : (
					<div className="mcp-auth-card__endpoint-value">
						<span data-testid="mcp-instance-url">{instanceUrl}</span>
						<CopyIconButton
							ariaLabel={t('intg_mcp_copy_instance_url_aria', {
								defaultValue: 'Copy SigNoz instance URL',
							})}
							onCopy={onCopyInstanceUrl}
							disabled={isLoadingInstanceUrl}
						/>
					</div>
				)}
			</div>

			<div className="mcp-auth-card__field">
				<span className="mcp-auth-card__field-label">
					{t('intg_mcp_api_key_label', { defaultValue: 'API Key' })}
				</span>
				{isAdmin ? (
					<div className="mcp-auth-card__cta-row">
						<Button
							variant="solid"
							color="primary"
							prefix={<KeyRound size={14} />}
							onClick={onCreateServiceAccount}
						>
							{t('intg_mcp_create_service_account', {
								defaultValue: 'Create service account',
							})}
						</Button>
						<span className="mcp-auth-card__helper-text">
							{t('intg_mcp_create_sa_helper', {
								defaultValue:
									'Create a service account, then add a new key inside it - paste that key into the API Key field.',
							})}
						</span>
					</div>
				) : (
					<div className="mcp-auth-card__info-banner">
						<Info size={14} />
						<span className="mcp-auth-card__helper-text">
							{t('intg_mcp_admin_only_helper', {
								defaultValue:
									'Only admins can create API keys. Ask your workspace admin for a key with read access, then paste it into the API Key field.',
							})}
						</span>
					</div>
				)}
			</div>
		</section>
	);
}

export default AuthCard;
