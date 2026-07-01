import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Style } from '@signozhq/design-tokens';
import { CircleHelp } from '@signozhq/icons';
import { Callout } from '@signozhq/ui/callout';
import { Checkbox } from '@signozhq/ui/checkbox';
import { Input } from '@signozhq/ui/input';
import { Form, Tooltip } from 'antd';

import ClaimMappingSection from './components/ClaimMappingSection';
import RoleMappingSection from './components/RoleMappingSection';

import './Providers.styles.scss';

type ExpandedSection = 'claim-mapping' | 'role-mapping' | null;

function ConfigureOIDCAuthnProvider({
	isCreate,
}: {
	isCreate: boolean;
}): JSX.Element {
	const { t } = useTranslation('pages');
	const form = Form.useFormInstance();

	const [expandedSection, setExpandedSection] = useState<ExpandedSection>(null);

	const handleClaimMappingChange = useCallback((expanded: boolean): void => {
		setExpandedSection(expanded ? 'claim-mapping' : null);
	}, []);

	const handleRoleMappingChange = useCallback((expanded: boolean): void => {
		setExpandedSection(expanded ? 'role-mapping' : null);
	}, []);

	return (
		<div className="authn-provider">
			<section className="authn-provider__header">
				<h3 className="authn-provider__title">
					{t('set_auth_oidc_edit_title', {
						defaultValue: 'Edit OIDC Authentication',
					})}
				</h3>
				<p className="authn-provider__description">
					{t('set_auth_oidc_edit_desc_prefix', {
						defaultValue:
							'Configure OpenID Connect Single Sign-On with your Identity Provider. Read the',
					})}{' '}
					<a
						href="https://signoz.io/docs/userguide/sso-authentication"
						target="_blank"
						rel="noreferrer"
					>
						{t('set_auth_docs_link', { defaultValue: 'docs' })}
					</a>{' '}
					{t('set_auth_for_more_info', { defaultValue: 'for more information.' })}
				</p>
			</section>

			<div className="authn-provider__columns">
				{/* Left Column - Core OIDC Settings */}
				<div className="authn-provider__left">
					<div className="authn-provider__field-group">
						<label className="authn-provider__label" htmlFor="oidc-domain">
							{t('set_auth_field_domain', { defaultValue: 'Domain' })}
							<Tooltip
								title={t('set_auth_tooltip_domain', {
									defaultValue:
										'The email domain for users who should use SSO (e.g., `example.com` for users with `@example.com` emails)',
								})}
							>
								<CircleHelp size={14} color={Style.L3_FOREGROUND} cursor="help" />
							</Tooltip>
						</label>
						<Form.Item
							name="name"
							className="authn-provider__form-item"
							rules={[
								{
									required: true,
									message: t('set_auth_domain_required', {
										defaultValue: 'Domain is required',
									}),
									whitespace: true,
								},
							]}
						>
							<Input id="oidc-domain" disabled={!isCreate} />
						</Form.Item>
					</div>

					<div className="authn-provider__field-group">
						<label className="authn-provider__label" htmlFor="oidc-issuer">
							{t('set_auth_field_issuer_url', { defaultValue: 'Issuer URL' })}
							<Tooltip
								title={t('set_auth_tooltip_issuer_url', {
									defaultValue:
										'The URL identifier for the OIDC provider. For example: "https://accounts.google.com" or "https://login.salesforce.com".',
								})}
							>
								<CircleHelp size={14} color={Style.L3_FOREGROUND} cursor="help" />
							</Tooltip>
						</label>
						<Form.Item
							name={['oidcConfig', 'issuer']}
							className="authn-provider__form-item"
							rules={[
								{
									required: true,
									message: t('set_auth_issuer_url_required', {
										defaultValue: 'Issuer URL is required',
									}),
									whitespace: true,
								},
							]}
						>
							<Input id="oidc-issuer" />
						</Form.Item>
					</div>

					<div className="authn-provider__field-group">
						<label className="authn-provider__label" htmlFor="oidc-issuer-alias">
							{t('set_auth_field_issuer_alias', { defaultValue: 'Issuer Alias' })}
							<Tooltip
								title={t('set_auth_tooltip_issuer_alias', {
									defaultValue:
										'Optional: Override the issuer URL from .well-known/openid-configuration for providers like Azure or Oracle IDCS.',
								})}
							>
								<CircleHelp size={14} color={Style.L3_FOREGROUND} cursor="help" />
							</Tooltip>
						</label>
						<Form.Item
							name={['oidcConfig', 'issuerAlias']}
							className="authn-provider__form-item"
						>
							<Input id="oidc-issuer-alias" />
						</Form.Item>
					</div>

					<div className="authn-provider__field-group">
						<label className="authn-provider__label" htmlFor="oidc-client-id">
							{t('set_auth_field_client_id', { defaultValue: 'Client ID' })}
							<Tooltip
								title={t('set_auth_tooltip_oidc_client_id', {
									defaultValue: "The application's client ID from your OIDC provider.",
								})}
							>
								<CircleHelp size={14} color={Style.L3_FOREGROUND} cursor="help" />
							</Tooltip>
						</label>
						<Form.Item
							name={['oidcConfig', 'clientId']}
							className="authn-provider__form-item"
							rules={[
								{
									required: true,
									message: t('set_auth_client_id_required', {
										defaultValue: 'Client ID is required',
									}),
									whitespace: true,
								},
							]}
						>
							<Input id="oidc-client-id" />
						</Form.Item>
					</div>

					<div className="authn-provider__field-group">
						<label className="authn-provider__label" htmlFor="oidc-client-secret">
							{t('set_auth_field_client_secret', { defaultValue: 'Client Secret' })}
							<Tooltip
								title={t('set_auth_tooltip_oidc_client_secret', {
									defaultValue: "The application's client secret from your OIDC provider.",
								})}
							>
								<CircleHelp size={14} color={Style.L3_FOREGROUND} cursor="help" />
							</Tooltip>
						</label>
						<Form.Item
							name={['oidcConfig', 'clientSecret']}
							className="authn-provider__form-item"
							rules={[
								{
									required: true,
									message: t('set_auth_client_secret_required', {
										defaultValue: 'Client Secret is required',
									}),
									whitespace: true,
								},
							]}
						>
							<Input id="oidc-client-secret" />
						</Form.Item>
					</div>

					<div className="authn-provider__checkbox-row">
						<Form.Item
							name={['oidcConfig', 'insecureSkipEmailVerified']}
							valuePropName="value"
							noStyle
						>
							<Checkbox
								id="oidc-skip-email-verification"
								onChange={(checked: boolean): void => {
									form.setFieldValue(
										['oidcConfig', 'insecureSkipEmailVerified'],
										checked,
									);
								}}
							>
								{t('set_auth_skip_email_verification', {
									defaultValue: 'Skip Email Verification',
								})}
							</Checkbox>
						</Form.Item>
						<Tooltip
							title={t('set_auth_tooltip_skip_email_verification', {
								defaultValue: 'Whether to skip email verification. Defaults to "false"',
							})}
						>
							<CircleHelp size={14} color={Style.L3_FOREGROUND} cursor="help" />
						</Tooltip>
					</div>

					<div className="authn-provider__checkbox-row">
						<Form.Item
							name={['oidcConfig', 'getUserInfo']}
							valuePropName="value"
							noStyle
						>
							<Checkbox
								id="oidc-get-user-info"
								onChange={(checked: boolean): void => {
									form.setFieldValue(['oidcConfig', 'getUserInfo'], checked);
								}}
							>
								{t('set_auth_get_user_info', { defaultValue: 'Get User Info' })}
							</Checkbox>
						</Form.Item>
						<Tooltip
							title={t('set_auth_tooltip_get_user_info', {
								defaultValue:
									'Use the userinfo endpoint to get additional claims. Useful when providers return thin ID tokens.',
							})}
						>
							<CircleHelp size={14} color={Style.L3_FOREGROUND} cursor="help" />
						</Tooltip>
					</div>
					<div className="authn-provider__callout-wrapper">
						<Callout type="warning" size="small" showIcon className="callout">
							{t('set_auth_oidc_callout', {
								defaultValue:
									"OIDC won't be enabled unless you enter all the attributes above",
							})}
						</Callout>
					</div>
				</div>

				{/* Right Column - Advanced Settings */}
				<div className="authn-provider__right">
					<ClaimMappingSection
						fieldNamePrefix={['oidcConfig', 'claimMapping']}
						isExpanded={expandedSection === 'claim-mapping'}
						onExpandChange={handleClaimMappingChange}
					/>

					<RoleMappingSection
						fieldNamePrefix={['roleMapping']}
						isExpanded={expandedSection === 'role-mapping'}
						onExpandChange={handleRoleMappingChange}
					/>
				</div>
			</div>
		</div>
	);
}

export default ConfigureOIDCAuthnProvider;
