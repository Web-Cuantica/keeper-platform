import { useTranslation } from 'react-i18next';
import type { Control, UseFormRegister } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Button } from '@signozhq/ui/button';
import { Input } from '@signozhq/ui/input';
import { ToggleGroupSimple } from '@signozhq/ui/toggle-group';
import { DatePicker } from 'antd';
import AuthZTooltip from 'components/AuthZTooltip/AuthZTooltip';
import {
	APIKeyCreatePermission,
	buildSAAttachPermission,
} from 'hooks/useAuthZ/permissions/service-account.permissions';
import { popupContainer } from 'utils/selectPopupContainer';

import { disabledDate } from '../utils';
import type { FormValues } from './types';
import { ExpiryMode, FORM_ID } from './types';

export interface KeyFormPhaseProps {
	register: UseFormRegister<FormValues>;
	control: Control<FormValues>;
	expiryMode: ExpiryMode;
	isSubmitting: boolean;
	isValid: boolean;
	onSubmit: () => void;
	onClose: () => void;
	accountId?: string;
}

function KeyFormPhase({
	register,
	control,
	expiryMode,
	isSubmitting,
	isValid,
	onSubmit,
	onClose,
	accountId,
}: KeyFormPhaseProps): JSX.Element {
	const { t } = useTranslation('pages');
	return (
		<>
			<form id={FORM_ID} className="add-key-modal__form" onSubmit={onSubmit}>
				<div className="add-key-modal__field">
					<label className="add-key-modal__label" htmlFor="key-name">
						{t('onb_name', { defaultValue: "Name" })}<span style={{ color: 'var(--destructive)' }}>*</span>
					</label>
					<Input
						id="key-name"
						placeholder={t('onb_enter_key_name_eg', { defaultValue: "Enter key name e.g.: Service Owner" })}
						className="add-key-modal__input"
						{...register('keyName', {
							required: true,
							validate: (v) => !!v.trim(),
						})}
					/>
				</div>

				<div className="add-key-modal__field">
					<span className="add-key-modal__label">{t('onb_expiration', { defaultValue: "Expiration" })}</span>
					<Controller
						name="expiryMode"
						control={control}
						render={({ field }): JSX.Element => (
							<ToggleGroupSimple
								type="single"
								value={field.value}
								onChange={(val: string): void => {
									if (val) {
										field.onChange(val);
									}
								}}
								size="sm"
								className="add-key-modal__expiry-toggle"
								items={[
									{ value: ExpiryMode.NONE, label: 'No Expiration' },
									{ value: ExpiryMode.DATE, label: 'Set Expiration Date' },
								]}
							/>
						)}
					/>
				</div>

				{expiryMode === ExpiryMode.DATE && (
					<div className="add-key-modal__field">
						<label className="add-key-modal__label" htmlFor="expiry-date">
							{t('onb_expiration_date', { defaultValue: "Expiration Date" })}
						</label>
						<div className="add-key-modal__datepicker">
							<Controller
								name="expiryDate"
								control={control}
								render={({ field }): JSX.Element => (
									<DatePicker
										id="expiry-date"
										value={field.value}
										onChange={field.onChange}
										popupClassName="add-key-modal-datepicker-popup"
										getPopupContainer={popupContainer}
										disabledDate={disabledDate}
									/>
								)}
							/>
						</div>
					</div>
				)}
			</form>

			<div className="add-key-modal__footer">
				<div className="add-key-modal__footer-right">
					<Button variant="solid" color="secondary" onClick={onClose}>
						{t('onb_cancel', { defaultValue: "Cancel" })}
					</Button>
					<AuthZTooltip
						checks={[
							APIKeyCreatePermission,
							buildSAAttachPermission(accountId ?? ''),
						]}
						enabled={!!accountId}
					>
						<Button
							type="submit"
							form={FORM_ID}
							variant="solid"
							color="primary"
							loading={isSubmitting}
							disabled={!isValid}
						>
							{t('onb_create_key', { defaultValue: "Create Key" })}
						</Button>
					</AuthZTooltip>
				</div>
			</div>
		</>
	);
}

export default KeyFormPhase;
