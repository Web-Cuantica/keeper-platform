import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@signozhq/ui/button';
import { toast } from '@signozhq/ui/sonner';
import { Tooltip } from 'antd';
import { convertToApiError } from 'api/ErrorResponseHandlerForGeneratedAPIs';
import type { RenderErrorResponseDTO } from 'api/generated/services/sigNoz.schemas';
import { AxiosError } from 'axios';
import { useQueryBuilder } from 'hooks/queryBuilder/useQueryBuilder';
import { useSafeNavigate } from 'hooks/useSafeNavigate';
import { Check, Loader, Send, X } from '@signozhq/icons';
import { useErrorModal } from 'providers/ErrorModalProvider';
import { toPostableRuleDTO } from 'types/api/alerts/convert';
import APIError from 'types/api/error';
import { isModifierKeyPressed } from 'utils/app';

import { useCreateAlertState } from '../context';
import {
	buildCreateThresholdAlertRulePayload,
	validateCreateAlertState,
} from './utils';

import './styles.scss';
import {
	invalidateGetRuleByID,
	invalidateListRules,
} from 'api/generated/services/rules';
import { useQueryClient } from 'react-query';

function Footer(): JSX.Element {
	const { t } = useTranslation('pages');
	const {
		alertType,
		alertState: basicAlertState,
		thresholdState,
		advancedOptions,
		evaluationWindow,
		notificationSettings,
		discardAlertRule,
		createAlertRule,
		isCreatingAlertRule,
		testAlertRule,
		isTestingAlertRule,
		updateAlertRule,
		isUpdatingAlertRule,
		isEditMode,
		ruleId,
	} = useCreateAlertState();
	const { currentQuery } = useQueryBuilder();
	const { safeNavigate } = useSafeNavigate();
	const { showErrorModal } = useErrorModal();

	const handleApiError = useCallback(
		(error: unknown): void => {
			showErrorModal(
				convertToApiError(error as AxiosError<RenderErrorResponseDTO>) as APIError,
			);
		},
		[showErrorModal],
	);

	const handleDiscard = (e: React.MouseEvent): void => {
		discardAlertRule();
		safeNavigate('/alerts', { newTab: isModifierKeyPressed(e) });
	};

	const alertValidationMessage = useMemo(
		() =>
			validateCreateAlertState({
				alertType,
				basicAlertState,
				thresholdState,
				advancedOptions,
				evaluationWindow,
				notificationSettings,
				query: currentQuery,
			}),
		[
			alertType,
			basicAlertState,
			thresholdState,
			advancedOptions,
			evaluationWindow,
			notificationSettings,
			currentQuery,
		],
	);

	const handleTestNotification = useCallback((): void => {
		const payload = buildCreateThresholdAlertRulePayload({
			alertType,
			basicAlertState,
			thresholdState,
			advancedOptions,
			evaluationWindow,
			notificationSettings,
			query: currentQuery,
		});
		testAlertRule(
			{ data: toPostableRuleDTO(payload) },
			{
				onSuccess: (response) => {
					if (response.data?.alertCount === 0) {
						toast.error(
							t('al_v2_toast_no_alerts_found', {
								defaultValue:
									'No alerts found during the evaluation. This happens when rule condition is unsatisfied. You may adjust the rule threshold and retry.',
							}),
						);
						return;
					}
					toast.success(
						t('al_v2_toast_test_sent', {
							defaultValue: 'Test notification sent successfully',
						}),
					);
				},
				onError: handleApiError,
			},
		);
	}, [
		alertType,
		basicAlertState,
		thresholdState,
		advancedOptions,
		evaluationWindow,
		notificationSettings,
		currentQuery,
		testAlertRule,
		handleApiError,
		t,
	]);

	const queryClient = useQueryClient();
	const handleSaveAlert = useCallback((): void => {
		const payload = buildCreateThresholdAlertRulePayload({
			alertType,
			basicAlertState,
			thresholdState,
			advancedOptions,
			evaluationWindow,
			notificationSettings,
			query: currentQuery,
		});
		if (isEditMode) {
			updateAlertRule(
				{
					pathParams: { id: ruleId },
					data: toPostableRuleDTO(payload),
				},
				{
					onSuccess: () => {
						void invalidateGetRuleByID(queryClient, { id: ruleId });
						void invalidateListRules(queryClient);

						toast.success(
							t('al_v2_toast_updated', {
								defaultValue: 'Alert rule updated successfully',
							}),
						);
						safeNavigate('/alerts');
					},
					onError: handleApiError,
				},
			);
		} else {
			createAlertRule(
				{ data: toPostableRuleDTO(payload) },
				{
					onSuccess: () => {
						toast.success(
							t('al_v2_toast_created', {
								defaultValue: 'Alert rule created successfully',
							}),
						);
						safeNavigate('/alerts');
					},
					onError: handleApiError,
				},
			);
		}
	}, [
		alertType,
		basicAlertState,
		thresholdState,
		advancedOptions,
		evaluationWindow,
		notificationSettings,
		currentQuery,
		isEditMode,
		ruleId,
		updateAlertRule,
		createAlertRule,
		safeNavigate,
		handleApiError,
		queryClient,
		t,
	]);

	const disableButtons =
		isCreatingAlertRule || isTestingAlertRule || isUpdatingAlertRule;

	const saveAlertButton = useMemo(() => {
		let button = (
			<Button
				variant="solid"
				color="primary"
				onClick={handleSaveAlert}
				disabled={disableButtons || Boolean(alertValidationMessage)}
			>
				{isCreatingAlertRule || isUpdatingAlertRule ? (
					<Loader data-testid="save-alert-rule-loader-icon" size={14} />
				) : (
					<Check data-testid="save-alert-rule-check-icon" size={14} />
				)}
				{t('al_v2_btn_save_alert_rule', { defaultValue: 'Save Alert Rule' })}
			</Button>
		);
		if (alertValidationMessage) {
			button = (
				<Tooltip title={alertValidationMessage}>
					<span>{button}</span>
				</Tooltip>
			);
		}
		return button;
	}, [
		alertValidationMessage,
		disableButtons,
		handleSaveAlert,
		isCreatingAlertRule,
		isUpdatingAlertRule,
		t,
	]);

	const testAlertButton = useMemo(() => {
		let button = (
			<Button
				variant="solid"
				color="secondary"
				onClick={handleTestNotification}
				disabled={disableButtons || Boolean(alertValidationMessage)}
			>
				{isTestingAlertRule ? (
					<Loader data-testid="test-notification-loader-icon" size={14} />
				) : (
					<Send data-testid="test-notification-send-icon" size={14} />
				)}
				{t('al_v2_btn_test_notification', { defaultValue: 'Test Notification' })}
			</Button>
		);
		if (alertValidationMessage) {
			button = (
				<Tooltip title={alertValidationMessage}>
					<span>{button}</span>
				</Tooltip>
			);
		}
		return button;
	}, [
		alertValidationMessage,
		disableButtons,
		handleTestNotification,
		isTestingAlertRule,
		t,
	]);

	return (
		<div className="create-alert-v2-footer">
			<Button
				variant="solid"
				color="secondary"
				onClick={handleDiscard}
				disabled={disableButtons}
			>
				<X size={14} /> {t('al_v2_btn_discard', { defaultValue: 'Discard' })}
			</Button>
			<div className="button-group">
				{testAlertButton}
				{saveAlertButton}
			</div>
		</div>
	);
}

export default Footer;
