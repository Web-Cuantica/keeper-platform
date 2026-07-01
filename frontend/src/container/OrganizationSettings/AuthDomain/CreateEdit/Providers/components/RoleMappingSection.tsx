import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Color, Style } from '@signozhq/design-tokens';
import {
	ChevronDown,
	ChevronRight,
	CircleHelp,
	Plus,
	Trash2,
	TriangleAlert,
} from '@signozhq/icons';
import { Button } from '@signozhq/ui/button';
import { Checkbox } from '@signozhq/ui/checkbox';
import { Input } from '@signozhq/ui/input';
import { Collapse, Form, Select, Tooltip } from 'antd';
import { useCollapseSectionErrors } from 'hooks/useCollapseSectionErrors';

import './RoleMappingSection.styles.scss';

const ROLE_OPTIONS = [
	{ value: 'VIEWER', label: 'VIEWER' },
	{ value: 'EDITOR', label: 'EDITOR' },
	{ value: 'ADMIN', label: 'ADMIN' },
];

interface RoleMappingSectionProps {
	fieldNamePrefix: string[];
	isExpanded?: boolean;
	onExpandChange?: (expanded: boolean) => void;
}

function RoleMappingSection({
	fieldNamePrefix,
	isExpanded,
	onExpandChange,
}: RoleMappingSectionProps): JSX.Element {
	const { t } = useTranslation('pages');
	const form = Form.useFormInstance();
	const useRoleAttribute = Form.useWatch(
		[...fieldNamePrefix, 'useRoleAttribute'],
		form,
	);

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

	const collapseActiveKey = expanded ? ['role-mapping'] : [];
	const { hasErrors, errorMessages } = useCollapseSectionErrors(fieldNamePrefix);

	return (
		<div className="role-mapping-section">
			<Collapse
				bordered={false}
				activeKey={collapseActiveKey}
				onChange={handleCollapseChange}
				className="role-mapping-section__collapse"
				expandIcon={(): null => null}
			>
				<Collapse.Panel
					key="role-mapping"
					header={
						<div
							className="role-mapping-section__collapse-header"
							role="button"
							aria-expanded={expanded}
							aria-controls="role-mapping-content"
						>
							{!expanded ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
							<div className="role-mapping-section__collapse-header-text">
								<h4 className="role-mapping-section__section-title">
									{t('set_auth_role_mapping_title', {
										defaultValue: 'Role Mapping (Advanced)',
									})}
								</h4>
								<p className="role-mapping-section__section-description">
									{t('set_auth_role_mapping_desc', {
										defaultValue:
											'Configure how user roles are determined from your Identity Provider. You can either use a direct role attribute or map IDP groups to SigNoz roles.',
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
					<div id="role-mapping-content" className="role-mapping-section__content">
						<div className="role-mapping-section__field-group">
							<label className="role-mapping-section__label" htmlFor="default-role">
								{t('set_auth_default_role', { defaultValue: 'Default Role' })}
								<Tooltip
									title={t('set_auth_tooltip_default_role', {
										defaultValue:
											'The default role assigned to new SSO users if no other role mapping applies. Default: "VIEWER"',
									})}
								>
									<CircleHelp size={14} color={Style.L3_FOREGROUND} cursor="help" />
								</Tooltip>
							</label>
							<Form.Item
								name={[...fieldNamePrefix, 'defaultRole']}
								className="role-mapping-section__form-item"
								initialValue="VIEWER"
							>
								<Select
									id="default-role"
									options={ROLE_OPTIONS}
									className="role-mapping-section__select"
								/>
							</Form.Item>
						</div>

						<div className="role-mapping-section__checkbox-row">
							<Form.Item
								name={[...fieldNamePrefix, 'useRoleAttribute']}
								valuePropName="value"
								noStyle
							>
								<Checkbox
									id="use-role-attribute"
									onChange={(checked: boolean): void => {
										form.setFieldValue([...fieldNamePrefix, 'useRoleAttribute'], checked);
									}}
								>
									{t('set_auth_use_role_attribute', {
										defaultValue: 'Use Role Attribute Directly',
									})}
								</Checkbox>
							</Form.Item>
							<Tooltip
								title={t('set_auth_tooltip_use_role_attribute', {
									defaultValue:
										'If enabled, the role claim/attribute from the IDP will be used directly instead of group mappings. The role value must match a SigNoz role (VIEWER, EDITOR, or ADMIN).',
								})}
							>
								<CircleHelp size={14} color={Style.L3_FOREGROUND} cursor="help" />
							</Tooltip>
						</div>

						{!useRoleAttribute && (
							<div className="role-mapping-section__group-mappings">
								<div className="role-mapping-section__group-header">
									<span className="role-mapping-section__group-title">
										{t('set_auth_group_to_role_title', {
											defaultValue: 'Group to Role Mappings',
										})}
									</span>
									<p className="role-mapping-section__group-description">
										{t('set_auth_group_to_role_desc', {
											defaultValue:
												'Map IDP group names to SigNoz roles. If a user belongs to multiple groups, the highest privilege role will be assigned.',
										})}
									</p>
								</div>

								<Form.List name={[...fieldNamePrefix, 'groupMappingsList']}>
									{(fields, { add, remove }): JSX.Element => (
										<div className="role-mapping-section__items">
											{fields.map((field) => (
												<div key={field.key} className="role-mapping-section__row">
													<Form.Item
														name={[field.name, 'groupName']}
														className="role-mapping-section__field role-mapping-section__field--group"
														rules={[
															{
																required: true,
																message: t('set_auth_group_name_required', {
																	defaultValue: 'Group name is required',
																}),
															},
														]}
													>
														<Input
															placeholder={t('set_auth_placeholder_idp_group', {
																defaultValue: 'IDP Group Name',
															})}
														/>
													</Form.Item>

													<Form.Item
														name={[field.name, 'role']}
														className="role-mapping-section__field role-mapping-section__field--role"
														rules={[
															{
																required: true,
																message: t('set_auth_role_required', {
																	defaultValue: 'Role is required',
																}),
															},
														]}
														initialValue="VIEWER"
													>
														<Select
															options={ROLE_OPTIONS}
															className="role-mapping-section__select"
														/>
													</Form.Item>

													<Button
														variant="ghost"
														color="secondary"
														className="role-mapping-section__remove-btn"
														onClick={(): void => remove(field.name)}
														aria-label={t('set_auth_remove_mapping_aria', {
															defaultValue: 'Remove mapping',
														})}
													>
														<Trash2 size={12} />
													</Button>
												</div>
											))}

											<Button
												variant="outlined"
												color="secondary"
												onClick={(): void => add({ groupName: '', role: 'VIEWER' })}
												prefix={<Plus size={14} />}
											>
												{t('set_auth_add_group_mapping', {
													defaultValue: 'Add Group Mapping',
												})}
											</Button>
										</div>
									)}
								</Form.List>
							</div>
						)}
					</div>
				</Collapse.Panel>
			</Collapse>
		</div>
	);
}

export default RoleMappingSection;
