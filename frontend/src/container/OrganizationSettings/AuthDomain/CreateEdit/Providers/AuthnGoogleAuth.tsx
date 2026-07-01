import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Color, Style } from '@signozhq/design-tokens';
import {
	ChevronDown,
	ChevronRight,
	CircleHelp,
	TriangleAlert,
} from '@signozhq/icons';
import { Callout } from '@signozhq/ui/callout';
import { Checkbox } from '@signozhq/ui/checkbox';
import { Input } from '@signozhq/ui/input';
import { Collapse, Form, Input as AntdInput, Tooltip } from 'antd';
import { useCollapseSectionErrors } from 'hooks/useCollapseSectionErrors';

import DomainMappingList from './components/DomainMappingList';
import EmailTagInput from './components/EmailTagInput';
import RoleMappingSection from './components/RoleMappingSection';

import './Providers.styles.scss';

type ExpandedSection = 'workspace-groups' | 'role-mapping' | null;

function ConfigureGoogleAuthAuthnProvider({
	isCreate,
}: {
	isCreate: boolean;
}): JSX.Element {
	const { t } = useTranslation('pages');
	const form = Form.useFormInstance();
	const fetchGroups = Form.useWatch(['googleAuthConfig', 'fetchGroups'], form);

	const [expandedSection, setExpandedSection] = useState<ExpandedSection>(null);

	const handleWorkspaceGroupsChange = useCallback(
		(keys: string | string[]): void => {
			const isExpanding = Array.isArray(keys) ? keys.length > 0 : !!keys;
			setExpandedSection(isExpanding ? 'workspace-groups' : null);
		},
		[],
	);

	const handleRoleMappingChange = useCallback((expanded: boolean): void => {
		setExpandedSection(expanded ? 'role-mapping' : null);
	}, []);

	const {
		hasErrors: hasWorkspaceGroupsErrors,
		errorMessages: workspaceGroupsErrorMessages,
	} = useCollapseSectionErrors(
		['googleAuthConfig'],
		[
			['googleAuthConfig', 'fetchGroups'],
			['googleAuthConfig', 'serviceAccountJson'],
			['googleAuthConfig', 'domainToAdminEmailList'],
			['googleAuthConfig', 'fetchTransitiveGroupMembership'],
			['googleAuthConfig', 'allowedGroups'],
		],
	);

	return (
		<div className="authn-provider">
			<section className="authn-provider__header">
				<h3 className="authn-provider__title">
					{t('set_auth_google_edit_title', {
						defaultValue: 'Edit Google Authentication',
					})}
				</h3>
				<p className="authn-provider__description">
					{t('set_auth_google_edit_desc_prefix', {
						defaultValue:
							'Enter OAuth 2.0 credentials obtained from the Google API Console below. Read the',
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
				{/* Left Column - Core OAuth Settings */}
				<div className="authn-provider__left">
					<div className="authn-provider__field-group">
						<label className="authn-provider__label" htmlFor="google-domain">
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
							<Input id="google-domain" disabled={!isCreate} />
						</Form.Item>
					</div>

					<div className="authn-provider__field-group">
						<label className="authn-provider__label" htmlFor="google-client-id">
							{t('set_auth_field_client_id', { defaultValue: 'Client ID' })}
							<Tooltip
								title={t('set_auth_tooltip_client_id', {
									defaultValue:
										"ClientID is the application's ID. For example, 292085223830.apps.googleusercontent.com.",
								})}
							>
								<CircleHelp size={14} color={Style.L3_FOREGROUND} cursor="help" />
							</Tooltip>
						</label>
						<Form.Item
							name={['googleAuthConfig', 'clientId']}
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
							<Input id="google-client-id" />
						</Form.Item>
					</div>

					<div className="authn-provider__field-group">
						<label className="authn-provider__label" htmlFor="google-client-secret">
							{t('set_auth_field_client_secret', { defaultValue: 'Client Secret' })}
							<Tooltip
								title={t('set_auth_tooltip_client_secret', {
									defaultValue: "It is the application's secret.",
								})}
							>
								<CircleHelp size={14} color={Style.L3_FOREGROUND} cursor="help" />
							</Tooltip>
						</label>
						<Form.Item
							name={['googleAuthConfig', 'clientSecret']}
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
							<Input id="google-client-secret" />
						</Form.Item>
					</div>

					<div className="authn-provider__checkbox-row">
						<Form.Item
							name={['googleAuthConfig', 'insecureSkipEmailVerified']}
							valuePropName="value"
							noStyle
						>
							<Checkbox
								id="google-skip-email-verification"
								onChange={(checked: boolean): void => {
									form.setFieldValue(
										['googleAuthConfig', 'insecureSkipEmailVerified'],
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

					<div className="authn-provider__callout-wrapper">
						<Callout type="warning" size="small" showIcon className="callout">
							{t('set_auth_google_callout', {
								defaultValue:
									"Google OAuth2 won't be enabled unless you enter all the attributes above",
							})}
						</Callout>
					</div>
				</div>

				{/* Right Column - Google Workspace Groups (Advanced) */}
				<div className="authn-provider__right">
					<Collapse
						bordered={false}
						activeKey={
							expandedSection === 'workspace-groups' ? ['workspace-groups'] : []
						}
						onChange={handleWorkspaceGroupsChange}
						className="authn-provider__collapse"
						expandIcon={(): null => null}
					>
						<Collapse.Panel
							key="workspace-groups"
							header={
								<div className="authn-provider__collapse-header">
									{expandedSection !== 'workspace-groups' ? (
										<ChevronRight size={16} />
									) : (
										<ChevronDown size={16} />
									)}
									<div className="authn-provider__collapse-header-text">
										<h4 className="authn-provider__section-title">
											{t('set_auth_google_groups_title', {
												defaultValue: 'Google Workspace Groups (Advanced)',
											})}
										</h4>
										<p className="authn-provider__section-description">
											{t('set_auth_google_groups_desc', {
												defaultValue:
													'Enable group fetching to retrieve user groups from Google Workspace. Requires a Service Account with domain-wide delegation.',
											})}
										</p>
									</div>
									{expandedSection !== 'workspace-groups' &&
										hasWorkspaceGroupsErrors && (
											<Tooltip
												title={
													<div>
														{workspaceGroupsErrorMessages.map((msg) => (
															<div key={msg}>{msg}</div>
														))}
													</div>
												}
											>
												<TriangleAlert size={16} color={Color.BG_CHERRY_500} />
											</Tooltip>
										)}
								</div>
							}
						>
							<div className="authn-provider__group-content">
								<div className="authn-provider__checkbox-row">
									<Form.Item
										name={['googleAuthConfig', 'fetchGroups']}
										valuePropName="value"
										noStyle
									>
										<Checkbox
											id="google-fetch-groups"
											onChange={(checked: boolean): void => {
												form.setFieldValue(['googleAuthConfig', 'fetchGroups'], checked);
											}}
										>
											{t('set_auth_fetch_groups', { defaultValue: 'Fetch Groups' })}
										</Checkbox>
									</Form.Item>
									<Tooltip
										title={t('set_auth_tooltip_fetch_groups', {
											defaultValue:
												'Enable fetching Google Workspace groups for the user. Requires service account configuration.',
										})}
									>
										<CircleHelp size={14} color={Style.L3_FOREGROUND} cursor="help" />
									</Tooltip>
								</div>

								{fetchGroups && (
									<div className="authn-provider__group-fields">
										<div className="authn-provider__field-group">
											<label
												className="authn-provider__label"
												htmlFor="google-service-account-json"
											>
												{t('set_auth_service_account_json', {
													defaultValue: 'Service Account JSON',
												})}
												<Tooltip
													title={t('set_auth_tooltip_service_account_json', {
														defaultValue:
															'The JSON content of the Google Service Account credentials file. Required for group fetching.',
													})}
												>
													<CircleHelp size={14} color={Style.L3_FOREGROUND} cursor="help" />
												</Tooltip>
											</label>
											<Form.Item
												name={['googleAuthConfig', 'serviceAccountJson']}
												className="authn-provider__form-item"
											>
												<AntdInput.TextArea
													id="google-service-account-json"
													rows={3}
													placeholder={t('set_auth_placeholder_service_account_json', {
														defaultValue: 'Paste service account JSON',
													})}
													className="authn-provider__textarea"
												/>
											</Form.Item>
										</div>

										<DomainMappingList
											fieldNamePrefix={['googleAuthConfig', 'domainToAdminEmailList']}
										/>

										<div className="authn-provider__checkbox-row">
											<Form.Item
												name={['googleAuthConfig', 'fetchTransitiveGroupMembership']}
												valuePropName="value"
												noStyle
											>
												<Checkbox
													id="google-transitive-membership"
													onChange={(checked: boolean): void => {
														form.setFieldValue(
															['googleAuthConfig', 'fetchTransitiveGroupMembership'],
															checked,
														);
													}}
												>
													{t('set_auth_fetch_transitive', {
														defaultValue: 'Fetch Transitive Group Membership',
													})}
												</Checkbox>
											</Form.Item>
											<Tooltip
												title={t('set_auth_tooltip_fetch_transitive', {
													defaultValue:
														'If enabled, recursively fetch groups that contain other groups (transitive membership).',
												})}
											>
												<CircleHelp size={14} color={Style.L3_FOREGROUND} cursor="help" />
											</Tooltip>
										</div>

										<div className="authn-provider__field-group">
											<label
												className="authn-provider__label"
												htmlFor="google-allowed-groups"
											>
												{t('set_auth_allowed_groups', { defaultValue: 'Allowed Groups' })}
												<Tooltip
													title={t('set_auth_tooltip_allowed_groups', {
														defaultValue:
															'Optional list of allowed groups. If configured, only users belonging to one of these groups will be allowed to login.',
													})}
												>
													<CircleHelp size={14} color={Style.L3_FOREGROUND} cursor="help" />
												</Tooltip>
											</label>
											<Form.Item
												name={['googleAuthConfig', 'allowedGroups']}
												className="authn-provider__form-item"
											>
												<EmailTagInput
													placeholder={t('set_auth_placeholder_group_email', {
														defaultValue: 'Type a group email and press Enter',
													})}
												/>
											</Form.Item>
										</div>
									</div>
								)}
							</div>
						</Collapse.Panel>
					</Collapse>

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

export default ConfigureGoogleAuthAuthnProvider;
