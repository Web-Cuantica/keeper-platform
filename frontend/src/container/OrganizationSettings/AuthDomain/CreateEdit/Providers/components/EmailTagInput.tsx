import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, Tooltip } from 'antd';

import './EmailTagInput.styles.scss';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface EmailTagInputProps {
	value?: string[];
	onChange?: (value: string[]) => void;
	placeholder?: string;
}

function EmailTagInput({
	value = [],
	onChange,
	placeholder,
}: EmailTagInputProps): JSX.Element {
	const { t } = useTranslation('pages');
	const [validationError, setValidationError] = useState('');

	const resolvedPlaceholder =
		placeholder ??
		t('set_auth_placeholder_email_tag', {
			defaultValue: 'Type an email and press Enter',
		});

	const handleChange = useCallback(
		(newValues: string[]): void => {
			const addedValues = newValues.filter((v) => !value.includes(v));
			const invalidEmail = addedValues.find((v) => !EMAIL_REGEX.test(v));

			if (invalidEmail) {
				setValidationError(
					t('set_auth_invalid_email', {
						defaultValue: '"{{email}}" is not a valid email',
						email: invalidEmail,
					}),
				);
				return;
			}
			setValidationError('');
			onChange?.(newValues);
		},
		[onChange, value, t],
	);

	return (
		<div className="email-tag-input">
			<Tooltip
				title={validationError}
				open={!!validationError}
				placement="topRight"
			>
				<Select
					mode="tags"
					value={value}
					onChange={handleChange}
					placeholder={resolvedPlaceholder}
					tokenSeparators={[',', ' ']}
					className="email-tag-input__select"
					allowClear
					status={validationError ? 'error' : undefined}
				/>
			</Tooltip>
		</div>
	);
}

export default EmailTagInput;
