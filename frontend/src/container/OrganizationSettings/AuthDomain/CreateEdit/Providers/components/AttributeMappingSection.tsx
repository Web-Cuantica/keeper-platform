import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Color, Style } from '@signozhq/design-tokens';
import {
	ChevronDown,
	ChevronRight,
	CircleHelp,
	TriangleAlert,
} from '@signozhq/icons';
import { Input } from '@signozhq/ui/input';
import { Collapse, Form, Tooltip } from 'antd';
import { useCollapseSectionErrors } from 'hooks/useCollapseSectionErrors';

import './AttributeMappingSection.styles.scss';

interface AttributeMappingSectionProps {
	fieldNamePrefix: string[];
	isExpanded?: boolean;
	onExpandChange?: (expanded: boolean) => void;
}

function AttributeMappingSection({
	fieldNamePrefix,
	isExpanded,
	onExpandChange,
}: AttributeMappingSectionProps): JSX.Element {
	const { t } = useTranslation('pages');
	// Support both controlled and uncontrolled modes
	const [internalExpanded, setInternalExpanded] = useState(false);
	const isControlled = isExpanded !== undefined;
	const expanded = isControlled ? isExpanded : internalExpanded;

	const handleCollapseChange = useCallback(
		(keys: string | string[]): void => {
			const newExpanded = Array.isArray(keys) ? keys.length > 0 : !!keys;
			if (isControlled && onExpandChange) {
				onExpandChange(newExpanded);
			} else {
				setInternalExpanded(newExpanded);
			}
		},
		[isControlled, onExpandChange],
	);

	const collapseActiveKey = expanded ? ['attribute-mapping'] : [];
	const { hasErrors, errorMessages } = useCollapseSectionErrors(fieldNamePrefix);

	return (
		<div className="attribute-mapping-section">
			<Collapse
				bordered={false}
				activeKey={collapseActiveKey}
				onChange={handleCollapseChange}
				className="attribute-mapping-section__collapse"
				expandIcon={(): null => null}
			>
				<Collapse.Panel
					key="attribute-mapping"
					header={
						<div
							className="attribute-mapping-section__collapse-header"
							role="button"
							aria-expanded={expanded}
							aria-controls="attribute-mapping-content"
						>
							{!expanded ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
							<div className="attribute-mapping-section__collapse-header-text">
								<h4 className="attribute-mapping-section__section-title">
									{t('set_auth_attribute_mapping_title', {
										defaultValue: 'Attribute Mapping (Advanced)',
									})}
								</h4>
								<p className="attribute-mapping-section__section-description">
									{t('set_auth_attribute_mapping_desc', {
										defaultValue:
											'Configure how SAML assertion attributes from your Identity Provider map to SigNoz user attributes. Leave empty to use default values.',
									})}
								</p>
							</div>
							{!expanded && hasErrors && (
								<Tooltip
									title={
										<>
											{errorMessages.map((msg) => (
												<div key={msg}>{msg}</div>
											))}
										</>
									}
								>
									<TriangleAlert size={16} color={Color.BG_CHERRY_500} />
								</Tooltip>
							)}
						</div>
					}
				>
					<div
						id="attribute-mapping-content"
						className="attribute-mapping-section__content"
					>
						<div className="attribute-mapping-section__field-group">
							<label
								className="attribute-mapping-section__label"
								htmlFor="email-attribute"
							>
								{t('set_auth_email_attribute', { defaultValue: 'Email Attribute' })}
								<Tooltip
									title={t('set_auth_tooltip_email_attribute', {
										defaultValue:
											"The SAML attribute key that contains the user's email. Default: 'email'",
									})}
								>
									<CircleHelp size={14} color={Style.L3_FOREGROUND} cursor="help" />
								</Tooltip>
							</label>
							<Form.Item
								name={[...fieldNamePrefix, 'email']}
								className="attribute-mapping-section__form-item"
							>
								<Input
									id="email-attribute"
									placeholder={t('set_auth_placeholder_email', { defaultValue: 'Email' })}
								/>
							</Form.Item>
						</div>

						{/* Name Attribute */}
						<div className="attribute-mapping-section__field-group">
							<label
								className="attribute-mapping-section__label"
								htmlFor="name-attribute"
							>
								{t('set_auth_name_attribute', { defaultValue: 'Name Attribute' })}
								<Tooltip
									title={t('set_auth_tooltip_name_attribute', {
										defaultValue:
											"The SAML attribute key that contains the user's display name. Default: 'name'",
									})}
								>
									<CircleHelp size={14} color={Style.L3_FOREGROUND} cursor="help" />
								</Tooltip>
							</label>
							<Form.Item
								name={[...fieldNamePrefix, 'name']}
								className="attribute-mapping-section__form-item"
							>
								<Input
									id="name-attribute"
									placeholder={t('set_auth_placeholder_name', { defaultValue: 'Name' })}
								/>
							</Form.Item>
						</div>

						{/* Groups Attribute */}
						<div className="attribute-mapping-section__field-group">
							<label
								className="attribute-mapping-section__label"
								htmlFor="groups-attribute"
							>
								{t('set_auth_groups_attribute', { defaultValue: 'Groups Attribute' })}
								<Tooltip
									title={t('set_auth_tooltip_groups_attribute', {
										defaultValue:
											"The SAML attribute key that contains the user's group memberships. Used for role mapping. Default: 'groups'",
									})}
								>
									<CircleHelp size={14} color={Style.L3_FOREGROUND} cursor="help" />
								</Tooltip>
							</label>
							<Form.Item
								name={[...fieldNamePrefix, 'groups']}
								className="attribute-mapping-section__form-item"
							>
								<Input
									id="groups-attribute"
									placeholder={t('set_auth_placeholder_groups', { defaultValue: 'Groups' })}
								/>
							</Form.Item>
						</div>

						{/* Role Attribute */}
						<div className="attribute-mapping-section__field-group">
							<label
								className="attribute-mapping-section__label"
								htmlFor="role-attribute"
							>
								{t('set_auth_role_attribute', { defaultValue: 'Role Attribute' })}
								<Tooltip
									title={t('set_auth_tooltip_role_attribute', {
										defaultValue:
											"The SAML attribute key that contains the user's role directly from the IDP. Default: 'role'",
									})}
								>
									<CircleHelp size={14} color={Style.L3_FOREGROUND} cursor="help" />
								</Tooltip>
							</label>
							<Form.Item
								name={[...fieldNamePrefix, 'role']}
								className="attribute-mapping-section__form-item"
							>
								<Input
									id="role-attribute"
									placeholder={t('set_auth_placeholder_role', { defaultValue: 'Role' })}
								/>
							</Form.Item>
						</div>
					</div>
				</Collapse.Panel>
			</Collapse>
		</div>
	);
}

export default AttributeMappingSection;
