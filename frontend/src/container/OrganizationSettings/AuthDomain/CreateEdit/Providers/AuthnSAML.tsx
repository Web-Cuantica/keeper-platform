import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Style } from '@signozhq/design-tokens';
import { CircleHelp } from '@signozhq/icons';
import { Callout } from '@signozhq/ui/callout';
import { Checkbox } from '@signozhq/ui/checkbox';
import { Input } from '@signozhq/ui/input';
import { Form, Input as AntdInput, Tooltip } from 'antd';

import AttributeMappingSection from './components/AttributeMappingSection';
import RoleMappingSection from './components/RoleMappingSection';

import './Providers.styles.scss';

type ExpandedSection = 'attribute-mapping' | 'role-mapping' | null;

function ConfigureSAMLAuthnProvider({
	isCreate,
}: {
	isCreate: boolean;
}): JSX.Element {
	const { t } = useTranslation('pages');
	const form = Form.useFormInstance();

	const [expandedSection, setExpandedSection] = useState<ExpandedSection>(null);

	const handleAttributeMappingChange = useCallback((expanded: boolean): void => {
		setExpandedSection(expanded ? 'attribute-mapping' : null);
	}, []);

	const handleRoleMappingChange = useCallback((expanded: boolean): void => {
		setExpandedSection(expanded ? 'role-mapping' : null);
	}, []);

	return (
		<div className="authn-provider">
			<section className="authn-provider__header">
				<h3 className="authn-provider__title">
					{t('set_auth_saml_edit_title', {
						defaultValue: 'Edit SAML Authentication',
					})}
				</h3>
				<p className="authn-provider__description">
					{t('set_auth_saml_edit_desc_prefix', {
						defaultValue:
							'Configure SAML 2.0 Single Sign-On with your Identity Provider. Read the',
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
				{/* Left Column - Core SAML Settings */}
				<div className="authn-provider__left">
					<div className="authn-provider__field-group">
						<label className="authn-provider__label" htmlFor="saml-domain">
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
							<Input id="saml-domain" disabled={!isCreate} />
						</Form.Item>
					</div>

					<div className="authn-provider__field-group">
						<label className="authn-provider__label" htmlFor="saml-acs-url">
							{t('set_auth_field_saml_acs_url', { defaultValue: 'SAML ACS URL' })}
							<Tooltip
								title={t('set_auth_tooltip_saml_acs_url', {
									defaultValue:
										'The SSO endpoint of the SAML identity provider. It can typically be found in the SingleSignOnService element in the SAML metadata of the identity provider.',
								})}
							>
								<CircleHelp size={14} color={Style.L3_FOREGROUND} cursor="help" />
							</Tooltip>
						</label>
						<Form.Item
							name={['samlConfig', 'samlIdp']}
							className="authn-provider__form-item"
							rules={[
								{
									required: true,
									message: t('set_auth_saml_acs_url_required', {
										defaultValue: 'SAML ACS URL is required',
									}),
									whitespace: true,
								},
							]}
						>
							<Input id="saml-acs-url" />
						</Form.Item>
					</div>

					<div className="authn-provider__field-group">
						<label className="authn-provider__label" htmlFor="saml-entity-id">
							{t('set_auth_field_saml_entity_id', { defaultValue: 'SAML Entity ID' })}
							<Tooltip
								title={t('set_auth_tooltip_saml_entity_id', {
									defaultValue:
										'The entityID of the SAML identity provider. It can typically be found in the EntityID attribute of the EntityDescriptor element in the SAML metadata.',
								})}
							>
								<CircleHelp size={14} color={Style.L3_FOREGROUND} cursor="help" />
							</Tooltip>
						</label>
						<Form.Item
							name={['samlConfig', 'samlEntity']}
							className="authn-provider__form-item"
							rules={[
								{
									required: true,
									message: t('set_auth_saml_entity_id_required', {
										defaultValue: 'SAML Entity ID is required',
									}),
									whitespace: true,
								},
							]}
						>
							<Input id="saml-entity-id" />
						</Form.Item>
					</div>

					<div className="authn-provider__field-group">
						<label className="authn-provider__label" htmlFor="saml-certificate">
							{t('set_auth_field_saml_cert', {
								defaultValue: 'SAML X.509 Certificate',
							})}
							<Tooltip
								title={t('set_auth_tooltip_saml_cert', {
									defaultValue:
										'The certificate of the SAML identity provider. It can typically be found in the X509Certificate element in the SAML metadata.',
								})}
							>
								<CircleHelp size={14} color={Style.L3_FOREGROUND} cursor="help" />
							</Tooltip>
						</label>
						<Form.Item
							name={['samlConfig', 'samlCert']}
							className="authn-provider__form-item"
							rules={[
								{
									required: true,
									message: t('set_auth_saml_cert_required', {
										defaultValue: 'SAML Certificate is required',
									}),
									whitespace: true,
								},
							]}
						>
							<AntdInput.TextArea
								id="saml-certificate"
								rows={3}
								placeholder={t('set_auth_placeholder_saml_cert', {
									defaultValue: 'Paste X.509 certificate',
								})}
								className="authn-provider__textarea"
							/>
						</Form.Item>
					</div>

					<div className="authn-provider__checkbox-row">
						<Form.Item
							name={['samlConfig', 'insecureSkipAuthNRequestsSigned']}
							valuePropName="value"
							noStyle
						>
							<Checkbox
								id="saml-skip-signing"
								onChange={(checked: boolean): void => {
									form.setFieldValue(
										['samlConfig', 'insecureSkipAuthNRequestsSigned'],
										checked,
									);
								}}
							>
								{t('set_auth_skip_signing', {
									defaultValue: 'Skip Signing AuthN Requests',
								})}
							</Checkbox>
						</Form.Item>
						<Tooltip
							title={t('set_auth_tooltip_skip_signing', {
								defaultValue:
									'Whether to skip signing the SAML requests. For providers like JumpCloud, this should be enabled.',
							})}
						>
							<CircleHelp size={14} color={Style.L3_FOREGROUND} cursor="help" />
						</Tooltip>
					</div>

					<div className="authn-provider__callout-wrapper">
						<Callout type="warning" size="small" showIcon className="callout">
							{t('set_auth_saml_callout', {
								defaultValue:
									"SAML won't be enabled unless you enter all the attributes above",
							})}
						</Callout>
					</div>
				</div>

				{/* Right Column - Advanced Settings */}
				<div className="authn-provider__right">
					<AttributeMappingSection
						fieldNamePrefix={['samlConfig', 'attributeMapping']}
						isExpanded={expandedSection === 'attribute-mapping'}
						onExpandChange={handleAttributeMappingChange}
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

export default ConfigureSAMLAuthnProvider;
