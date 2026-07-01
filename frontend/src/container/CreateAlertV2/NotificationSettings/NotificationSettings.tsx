import { useTranslation } from 'react-i18next';
import { Input } from '@signozhq/ui/input';
import { Select } from 'antd';
import { Typography } from '@signozhq/ui/typography';

import { useCreateAlertState } from '../context';
import {
	RE_NOTIFICATION_CONDITION_OPTIONS,
	RE_NOTIFICATION_TIME_UNIT_OPTIONS,
} from '../context/constants';
import AdvancedOptionItem from '../EvaluationSettings/AdvancedOptionItem';
import Stepper from '../Stepper';
import MultipleNotifications from './MultipleNotifications';
import NotificationMessage from './NotificationMessage';

import './styles.scss';

function NotificationSettings(): JSX.Element {
	const { t } = useTranslation('pages');
	const { notificationSettings, setNotificationSettings } =
		useCreateAlertState();

	const repeatNotificationsInput = (
		<div className="repeat-notifications-input">
			<Typography.Text>
				{t('al_v2_renotify_every', { defaultValue: 'Every' })}
			</Typography.Text>
			<Input
				value={notificationSettings.reNotification.value}
				placeholder={t('al_v2_enter_time_interval', {
					defaultValue: 'Enter time interval...',
				})}
				disabled={!notificationSettings.reNotification.enabled}
				type="number"
				onChange={(e): void => {
					setNotificationSettings({
						type: 'SET_RE_NOTIFICATION',
						payload: {
							enabled: notificationSettings.reNotification.enabled,
							value: parseInt(e.target.value, 10),
							unit: notificationSettings.reNotification.unit,
							conditions: notificationSettings.reNotification.conditions,
						},
					});
				}}
				data-testid="repeat-notifications-time-input"
			/>
			<Select
				value={notificationSettings.reNotification.unit || null}
				placeholder={t('al_v2_select_unit', { defaultValue: 'Select unit' })}
				disabled={!notificationSettings.reNotification.enabled}
				options={RE_NOTIFICATION_TIME_UNIT_OPTIONS}
				onChange={(value): void => {
					setNotificationSettings({
						type: 'SET_RE_NOTIFICATION',
						payload: {
							enabled: notificationSettings.reNotification.enabled,
							value: notificationSettings.reNotification.value,
							unit: value,
							conditions: notificationSettings.reNotification.conditions,
						},
					});
				}}
				data-testid="repeat-notifications-unit-select"
			/>
			<Typography.Text>
				{t('al_v2_renotify_while', { defaultValue: 'while' })}
			</Typography.Text>
			<Select
				mode="multiple"
				value={notificationSettings.reNotification.conditions || null}
				placeholder={t('al_v2_select_conditions', {
					defaultValue: 'Select conditions',
				})}
				disabled={!notificationSettings.reNotification.enabled}
				options={RE_NOTIFICATION_CONDITION_OPTIONS}
				onChange={(value): void => {
					setNotificationSettings({
						type: 'SET_RE_NOTIFICATION',
						payload: {
							enabled: notificationSettings.reNotification.enabled,
							value: notificationSettings.reNotification.value,
							unit: notificationSettings.reNotification.unit,
							conditions: value,
						},
					});
				}}
				data-testid="repeat-notifications-conditions-select"
			/>
		</div>
	);

	return (
		<div className="notification-settings-container">
			<Stepper
				stepNumber={3}
				label={t('al_v2_step_notification', {
					defaultValue: 'Notification settings',
				})}
			/>
			<NotificationMessage />
			<div className="notification-settings-content">
				<MultipleNotifications />
				<AdvancedOptionItem
					title={t('al_v2_repeat_notifications', {
						defaultValue: 'Repeat notifications',
					})}
					description={t('al_v2_repeat_notifications_desc', {
						defaultValue:
							'Send periodic notifications while the alert condition remains active.',
					})}
					tooltipText={t('al_v2_repeat_notifications_tooltip', {
						defaultValue:
							"Continue sending periodic notifications while the alert condition persists. Useful for ensuring critical alerts aren't missed during long-running incidents. Configure how often to repeat and under what conditions.",
					})}
					input={repeatNotificationsInput}
					onToggle={(): void => {
						setNotificationSettings({
							type: 'SET_RE_NOTIFICATION',
							payload: {
								...notificationSettings.reNotification,
								enabled: !notificationSettings.reNotification.enabled,
							},
						});
					}}
					defaultShowInput={notificationSettings.reNotification.enabled}
					data-testid="repeat-notifications-container"
				/>
			</div>
		</div>
	);
}

export default NotificationSettings;
