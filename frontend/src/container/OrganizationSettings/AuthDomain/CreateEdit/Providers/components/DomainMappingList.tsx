import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from '@signozhq/icons';
import { Button } from '@signozhq/ui/button';
import { Input } from '@signozhq/ui/input';
import { Form } from 'antd';
import { TFunction } from 'i18next';

import './DomainMappingList.styles.scss';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createValidateEmail = (t: TFunction) => (
	_: unknown,
	value: string,
): Promise<void> => {
	if (!value) {
		return Promise.reject(
			new Error(
				t('pages:set_auth_admin_email_required', {
					defaultValue: 'Admin email is required',
				}),
			),
		);
	}
	if (!EMAIL_REGEX.test(value)) {
		return Promise.reject(
			new Error(
				t('pages:set_auth_valid_email_required', {
					defaultValue: 'Please enter a valid email',
				}),
			),
		);
	}
	return Promise.resolve();
};

interface DomainMappingListProps {
	fieldNamePrefix: string[];
}

function DomainMappingList({
	fieldNamePrefix,
}: DomainMappingListProps): JSX.Element {
	const { t } = useTranslation('pages');
	const validateEmail = createValidateEmail(t);
	return (
		<div className="domain-mapping-list">
			<div className="domain-mapping-list__header">
				<span className="domain-mapping-list__title">
					{t('set_auth_domain_admin_mapping_title', {
						defaultValue: 'Domain to Admin Email Mapping',
					})}
				</span>
				<p className="domain-mapping-list__description">
					{t('set_auth_domain_admin_mapping_desc', {
						defaultValue:
							'Map workspace domains to admin emails for service account impersonation. Use "*" as a wildcard for any domain.',
					})}
				</p>
			</div>

			<Form.List name={fieldNamePrefix}>
				{(fields, { add, remove }): JSX.Element => (
					<div className="domain-mapping-list__items">
						{fields.map((field) => (
							<div key={field.key} className="domain-mapping-list__row">
								<Form.Item
									name={[field.name, 'domain']}
									className="domain-mapping-list__field"
									rules={[
										{
											required: true,
											message: t('set_auth_domain_required', {
												defaultValue: 'Domain is required',
											}),
										},
									]}
								>
									<Input
										placeholder={t('set_auth_placeholder_domain_example', {
											defaultValue: 'Domain (e.g., example.com or *)',
										})}
									/>
								</Form.Item>

								<Form.Item
									name={[field.name, 'adminEmail']}
									className="domain-mapping-list__field"
									rules={[{ validator: validateEmail }]}
								>
									<Input
										placeholder={t('set_auth_placeholder_admin_email', {
											defaultValue: 'Admin Email',
										})}
									/>
								</Form.Item>

								<Button
									variant="ghost"
									color="secondary"
									className="domain-mapping-list__remove-btn"
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
							onClick={(): void => add({ domain: '', adminEmail: '' })}
							prefix={<Plus size={14} />}
						>
							{t('set_auth_add_domain_mapping', {
								defaultValue: 'Add Domain Mapping',
							})}
						</Button>
					</div>
				)}
			</Form.List>
		</div>
	);
}

export default DomainMappingList;
