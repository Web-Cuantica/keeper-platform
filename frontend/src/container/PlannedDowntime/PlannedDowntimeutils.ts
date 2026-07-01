import { UseMutateAsyncFunction } from 'react-query';
import type { NotificationInstance } from 'antd/es/notification/interface';
import type { DefaultOptionType } from 'antd/es/select';
import { convertToApiError } from 'api/ErrorResponseHandlerForGeneratedAPIs';
import type {
	DeleteDowntimeScheduleByIDPathParameters,
	RenderErrorResponseDTO,
	AlertmanagertypesPlannedMaintenanceDTO,
	AlertmanagertypesScheduleDTO,
} from 'api/generated/services/sigNoz.schemas';
import type { ErrorType } from 'api/generatedAPIInstance';
import { AxiosError } from 'axios';
import { DATE_TIME_FORMATS } from 'constants/dateTimeFormats';
import dayjs, { Dayjs } from 'dayjs';
import type { TFunction } from 'i18next';
import { isEmpty } from 'lodash-es';
import APIError from 'types/api/error';

type DateTimeString = string | null | undefined;

export const getDuration = (
	startTime: DateTimeString,
	endTime: DateTimeString,
	t?: TFunction,
): string => {
	if (!startTime || !endTime) {
		return t ? t('al_pd_na', { defaultValue: 'N/A' }) : 'N/A';
	}

	const start = dayjs(startTime);
	const end = dayjs(endTime);
	const durationMs = end.diff(start);

	const minutes = Math.floor(durationMs / (1000 * 60));
	const hours = Math.floor(durationMs / (1000 * 60 * 60));

	if (minutes < 60) {
		return t
			? t('al_pd_duration_minutes', {
					defaultValue: '{{count}} min',
					count: minutes,
				})
			: `${minutes} min`;
	}
	return t
		? t('al_pd_duration_hours', {
				defaultValue: '{{count}} hours',
				count: hours,
			})
		: `${hours} hours`;
};

export const formatDateTime = (
	dateTimeString?: string | Dayjs | null,
	timezone?: string,
): string => {
	if (!dateTimeString) {
		return 'N/A';
	}

	let dt = dayjs(dateTimeString);
	if (timezone) {
		dt = dt.tz(timezone);
	}

	return dt.format(DATE_TIME_FORMATS.MONTH_DATETIME);
};

export const getAlertOptionsFromIds = (
	alertIds: string[],
	alertOptions: DefaultOptionType[],
): DefaultOptionType[] =>
	alertOptions.filter(
		(alert) =>
			alert !== undefined &&
			alert.value &&
			alertIds?.includes(alert.value as string),
	);

export const recurrenceInfo = (
	schedule?: AlertmanagertypesScheduleDTO | null,
	t?: TFunction,
): string => {
	const noText = t ? t('al_pd_no', { defaultValue: 'No' }) : 'No';
	if (!schedule) {
		return noText;
	}
	const { startTime, endTime, timezone, recurrence } = schedule;
	if (!recurrence) {
		return noText;
	}

	const { duration, repeatOn, repeatType } = recurrence;

	const formattedStartTime = startTime
		? formatDateTime(startTime, timezone)
		: '';
	const formattedEndTime = endTime
		? `${t ? t('al_pd_to', { defaultValue: 'to' }) : 'to'} ${formatDateTime(
				endTime,
				timezone,
			)}`
		: '';
	const weeklyRepeatString = repeatOn
		? `${t ? t('al_pd_on', { defaultValue: 'on' }) : 'on'} ${repeatOn.join(', ')}`
		: '';
	const durationString = duration
		? `- ${
				t ? t('al_pd_duration_label', { defaultValue: 'Duration' }) : 'Duration'
			}: ${duration}`
		: '';

	return `${
		t ? t('al_pd_repeats', { defaultValue: 'Repeats' }) : 'Repeats'
	} - ${repeatType} ${weeklyRepeatString} ${
		t ? t('al_pd_from', { defaultValue: 'from' }) : 'from'
	} ${formattedStartTime} ${formattedEndTime} ${durationString}`;
};

export const defaultInitialValues: Partial<AlertmanagertypesPlannedMaintenanceDTO> =
	{
		name: '',
		description: '',
		schedule: {
			timezone: '',
			endTime: undefined,
			recurrence: undefined,
			startTime: '',
		},
		alertIds: [],
		createdAt: undefined,
		createdBy: undefined,
	};

type DeleteDowntimeScheduleProps = {
	deleteDowntimeScheduleAsync: UseMutateAsyncFunction<
		void,
		ErrorType<RenderErrorResponseDTO>,
		{ pathParams: DeleteDowntimeScheduleByIDPathParameters }
	>;
	notifications: NotificationInstance;
	showErrorModal: (error: APIError) => void;
	refetchAllSchedules: VoidFunction;
	deleteId?: string;
	hideDeleteDowntimeScheduleModal: () => void;
	clearSearch: () => void;
	t: TFunction;
};

export const deleteDowntimeHandler = ({
	deleteDowntimeScheduleAsync,
	refetchAllSchedules,
	deleteId,
	hideDeleteDowntimeScheduleModal,
	clearSearch,
	notifications,
	showErrorModal,
	t,
}: DeleteDowntimeScheduleProps): void => {
	if (!deleteId) {
		console.error('Unable to delete, please provide correct deleteId');
		notifications.error({
			message: t('al_pd_something_went_wrong', {
				defaultValue: 'Something went wrong',
			}),
		});
	} else {
		deleteDowntimeScheduleAsync(
			{ pathParams: { id: String(deleteId) } },
			{
				onSuccess: () => {
					hideDeleteDowntimeScheduleModal();
					clearSearch();
					notifications.success({
						message: t('al_pd_delete_success', {
							defaultValue: 'Downtime schedule Deleted Successfully',
						}),
					});
					refetchAllSchedules();
				},
				onError: (err) => {
					showErrorModal(
						convertToApiError(err as AxiosError<RenderErrorResponseDTO>) as APIError,
					);
				},
			},
		);
	}
};

export const recurrenceOptions = {
	doesNotRepeat: {
		label: 'Does not repeat',
		value: 'does-not-repeat',
	},
	daily: { label: 'Daily', value: 'daily' },
	weekly: { label: 'Weekly', value: 'weekly' },
	monthly: { label: 'Monthly', value: 'monthly' },
};

// Opciones de recurrencia con labels traducidos (values intactos para comparaciones)
export const getRecurrenceOptions = (
	t: TFunction,
): typeof recurrenceOptions => ({
	doesNotRepeat: {
		label: t('al_pd_recurrence_does_not_repeat', {
			defaultValue: 'Does not repeat',
		}),
		value: 'does-not-repeat',
	},
	daily: {
		label: t('al_pd_recurrence_daily', { defaultValue: 'Daily' }),
		value: 'daily',
	},
	weekly: {
		label: t('al_pd_recurrence_weekly', { defaultValue: 'Weekly' }),
		value: 'weekly',
	},
	monthly: {
		label: t('al_pd_recurrence_monthly', { defaultValue: 'Monthly' }),
		value: 'monthly',
	},
});

export const recurrenceWeeklyOptions = {
	monday: { label: 'Monday', value: 'monday' },
	tuesday: { label: 'Tuesday', value: 'tuesday' },
	wednesday: { label: 'Wednesday', value: 'wednesday' },
	thursday: { label: 'Thursday', value: 'thursday' },
	friday: { label: 'Friday', value: 'friday' },
	saturday: { label: 'Saturday', value: 'saturday' },
	sunday: { label: 'Sunday', value: 'sunday' },
};

// Días de la semana con labels traducidos (values intactos)
export const getRecurrenceWeeklyOptions = (
	t: TFunction,
): typeof recurrenceWeeklyOptions => ({
	monday: {
		label: t('al_pd_weekday_monday', { defaultValue: 'Monday' }),
		value: 'monday',
	},
	tuesday: {
		label: t('al_pd_weekday_tuesday', { defaultValue: 'Tuesday' }),
		value: 'tuesday',
	},
	wednesday: {
		label: t('al_pd_weekday_wednesday', { defaultValue: 'Wednesday' }),
		value: 'wednesday',
	},
	thursday: {
		label: t('al_pd_weekday_thursday', { defaultValue: 'Thursday' }),
		value: 'thursday',
	},
	friday: {
		label: t('al_pd_weekday_friday', { defaultValue: 'Friday' }),
		value: 'friday',
	},
	saturday: {
		label: t('al_pd_weekday_saturday', { defaultValue: 'Saturday' }),
		value: 'saturday',
	},
	sunday: {
		label: t('al_pd_weekday_sunday', { defaultValue: 'Sunday' }),
		value: 'sunday',
	},
});
interface DurationInfo {
	value: number;
	unit: string;
}

export function getDurationInfo(
	durationString: string | undefined | null,
): DurationInfo | null {
	if (!durationString) {
		return null;
	}

	// Regular expressions to extract hours, minutes
	const hoursRegex = /(\d+)h/;
	const minutesRegex = /(\d+)m/;

	// Extract hours, minutes from the duration string
	const hoursMatch = durationString.match(hoursRegex);
	const minutesMatch = durationString.match(minutesRegex);

	// Convert extracted values to integers, defaulting to 0 if not found
	const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
	const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

	// If there are no minutes and only hours, return the hours
	if (hours > 0 && minutes === 0) {
		return { value: hours, unit: 'h' };
	}

	// Otherwise, calculate the total duration in minutes
	const totalMinutes = hours * 60 + minutes;
	return { value: totalMinutes, unit: 'm' };
}

export interface Option {
	label: string;
	value: string;
}

export const recurrenceOptionWithSubmenu: Option[] = [
	recurrenceOptions.doesNotRepeat,
	recurrenceOptions.daily,
	recurrenceOptions.weekly,
	recurrenceOptions.monthly,
];

// Opciones del select de recurrencia con labels traducidos
export const getRecurrenceOptionWithSubmenu = (t: TFunction): Option[] => {
	const options = getRecurrenceOptions(t);
	return [
		options.doesNotRepeat,
		options.daily,
		options.weekly,
		options.monthly,
	];
};

export const isScheduleRecurring = (
	schedule?: AlertmanagertypesPlannedMaintenanceDTO['schedule'] | null,
): boolean => (schedule ? !isEmpty(schedule?.recurrence) : false);
