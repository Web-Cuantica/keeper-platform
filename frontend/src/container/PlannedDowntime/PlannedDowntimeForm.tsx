import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Info } from '@signozhq/icons';
import {
	Button,
	DatePicker,
	Flex,
	Form,
	FormInstance,
	Input,
	Modal,
	Select,
	SelectProps,
	Spin,
	Tooltip,
} from 'antd';
import { Typography } from '@signozhq/ui/typography';
import type { DefaultOptionType } from 'antd/es/select';
import { convertToApiError } from 'api/ErrorResponseHandlerForGeneratedAPIs';
import {
	createDowntimeSchedule,
	updateDowntimeScheduleByID,
} from 'api/generated/services/downtimeschedules';
import type {
	AlertmanagertypesPlannedMaintenanceDTO,
	AlertmanagertypesPostablePlannedMaintenanceDTO,
	AlertmanagertypesRecurrenceDTO,
} from 'api/generated/services/sigNoz.schemas';
import { RenderErrorResponseDTO } from 'api/generated/services/sigNoz.schemas';
import { AxiosError } from 'axios';
import { DATE_TIME_FORMATS } from 'constants/dateTimeFormats';
import {
	ModalButtonWrapper,
	ModalTitle,
} from 'container/PipelinePage/PipelineListsView/styles';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useNotifications } from 'hooks/useNotifications';
import { defaultTo, isEmpty } from 'lodash-es';
import { useErrorModal } from 'providers/ErrorModalProvider';
import APIError from 'types/api/error';
import { ALL_TIME_ZONES } from 'utils/timeZoneUtil';

import 'dayjs/locale/en';

import { AlertRuleTags } from './PlannedDowntimeList';
import {
	getAlertOptionsFromIds,
	getDurationInfo,
	getRecurrenceOptionWithSubmenu,
	getRecurrenceWeeklyOptions,
	isScheduleRecurring,
	recurrenceOptions,
} from './PlannedDowntimeutils';

import './PlannedDowntime.styles.scss';
import { RadioGroupItem, RadioGroup } from '@signozhq/ui/radio-group';

dayjs.locale('en');
dayjs.extend(utc);
dayjs.extend(timezone);

const TIME_FORMAT = DATE_TIME_FORMATS.TIME;
const DATE_FORMAT = DATE_TIME_FORMATS.ORDINAL_DATE;
const ORDINAL_FORMAT = DATE_TIME_FORMATS.ORDINAL_ONLY;

const TZ_OPTIONS: DefaultOptionType[] = ALL_TIME_ZONES.map(
	(timezone: string) => ({
		label: timezone,
		value: timezone,
		key: timezone,
	}),
);

type AlertRuleScope = 'all' | 'specific';

interface PlannedDowntimeFormData {
	name: string;
	startTime: dayjs.Dayjs | null;
	endTime: dayjs.Dayjs | null;
	recurrence?: AlertmanagertypesRecurrenceDTO;
	alertRuleScope: AlertRuleScope;
	alertRules: DefaultOptionType[];
	recurrenceSelect?: AlertmanagertypesRecurrenceDTO;
	timezone?: string;
	scope?: string;
}

const customFormat = DATE_TIME_FORMATS.ORDINAL_DATETIME;

interface PlannedDowntimeFormProps {
	initialValues: Partial<AlertmanagertypesPlannedMaintenanceDTO>;
	alertOptions: DefaultOptionType[];
	isError: boolean;
	isLoading: boolean;
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	refetchAllSchedules: () => void;
	isEditMode: boolean;
	form: FormInstance;
}

export function PlannedDowntimeForm(
	props: PlannedDowntimeFormProps,
): JSX.Element {
	const {
		initialValues,
		alertOptions,
		isError,
		isLoading,
		isOpen,
		setIsOpen,
		refetchAllSchedules,
		isEditMode,
		form,
	} = props;

	const { t } = useTranslation('pages');
	const recurrenceOptionWithSubmenu = useMemo(
		() => getRecurrenceOptionWithSubmenu(t),
		[t],
	);
	const recurrenceWeeklyOptions = useMemo(() => getRecurrenceWeeklyOptions(t), [
		t,
	]);

	const [selectedTags, setSelectedTags] = React.useState<DefaultOptionType[]>(
		[],
	);
	const alertRuleFormName = 'alertRules';
	const [saveLoading, setSaveLoading] = useState(false);
	const [durationUnit, setDurationUnit] = useState<string>(
		getDurationInfo(initialValues.schedule?.recurrence?.duration)?.unit || 'm',
	);

	const [formData, setFormData] = useState<Partial<PlannedDowntimeFormData>>({
		timezone: initialValues.schedule?.timezone,
	});

	const [recurrenceType, setRecurrenceType] = useState<string>(
		initialValues.schedule?.recurrence?.repeatType ||
			recurrenceOptions.doesNotRepeat.value,
	);

	const [alertRuleScope, setAlertRuleScope] = useState<AlertRuleScope>(
		initialValues.id && (initialValues.alertIds || []).length === 0
			? 'all'
			: 'specific',
	);

	const { notifications } = useNotifications();
	const { showErrorModal } = useErrorModal();

	const requiredFieldRule = [{ required: true }];

	const datePickerFooter = (mode: any): any =>
		mode === 'time' ? (
			<span style={{ color: 'gray' }}>
				{t('al_pd_please_select_time', { defaultValue: 'Please select the time' })}
			</span>
		) : null;

	const saveHandler = useCallback(
		async (values: PlannedDowntimeFormData) => {
			const { startTime, timezone } = values;
			if (!startTime || !timezone) {
				// unreachable: required fields should always be present on submitting.
				return;
			}
			const data: AlertmanagertypesPostablePlannedMaintenanceDTO = {
				alertIds:
					values.alertRuleScope === 'all'
						? []
						: (values.alertRules
								.map((alert) => alert.value)
								.filter((alert) => alert !== undefined) as string[]),
				name: values.name,
				scope: values.scope,
				schedule: {
					startTime: startTime.format(),
					endTime: values.endTime?.format(),
					timezone,
					recurrence: values.recurrence,
				},
			};

			setSaveLoading(true);
			try {
				if (isEditMode && initialValues.id) {
					await updateDowntimeScheduleByID({ id: initialValues.id }, data);
				} else {
					await createDowntimeSchedule(data);
				}
				setIsOpen(false);
				notifications.success({
					message: t('al_pd_success', { defaultValue: 'Success' }),
					description: isEditMode
						? t('al_pd_schedule_updated', {
								defaultValue: 'Schedule updated successfully',
							})
						: t('al_pd_schedule_created', {
								defaultValue: 'Schedule created successfully',
							}),
				});
				refetchAllSchedules();
			} catch (e: unknown) {
				showErrorModal(
					convertToApiError(e as AxiosError<RenderErrorResponseDTO>) as APIError,
				);
			}
			setSaveLoading(false);
		},
		[
			initialValues.id,
			isEditMode,
			notifications,
			refetchAllSchedules,
			setIsOpen,
			showErrorModal,
			t,
		],
	);
	const onFinish = async (values: PlannedDowntimeFormData): Promise<void> => {
		const rec = values.recurrence;
		const recurrence =
			rec && rec.repeatType !== recurrenceOptions.doesNotRepeat.value
				? {
						duration: `${rec.duration}${durationUnit}`,
						repeatOn: rec.repeatOn,
						repeatType: rec.repeatType,
					}
				: undefined;

		await saveHandler({ ...values, recurrence });
	};

	const handleFormData = (data: Partial<PlannedDowntimeFormData>): void => {
		const { startTime, endTime, timezone } = data;
		const update: Partial<PlannedDowntimeFormData> = {};

		// If the set timezone doesn't match, update it.
		if (
			startTime &&
			timezone &&
			startTime.format() !== startTime.tz(timezone, true).format()
		) {
			update.startTime = startTime.tz(timezone, true);
		}
		if (
			endTime &&
			timezone &&
			endTime.format() !== endTime.tz(timezone, true).format()
		) {
			update.endTime = endTime.tz(timezone, true);
		}

		if (!isEmpty(update)) {
			data = { ...data, ...update };
			form.setFieldsValue({ ...update });
		}

		setFormData(data);
	};

	const handleOk = async (): Promise<void> => {
		await form.validateFields().catch(() => {
			// antd renders inline field-level errors; nothing more to do here.
		});
	};

	const handleCancel = (): void => setIsOpen(false);

	const handleAlertRulesChange: SelectProps['onChange'] = (_value, options) => {
		form.setFieldValue(alertRuleFormName, options);
		setSelectedTags(Array.isArray(options) ? options : [options]);
	};

	const noTagRenderer: SelectProps['tagRender'] = () => <></>;

	const handleClose = (removedTag: DefaultOptionType['value']): void => {
		if (!removedTag) {
			return;
		}
		const newTags = selectedTags.filter((tag) => tag.value !== removedTag);
		form.setFieldValue(alertRuleFormName, newTags);
		setSelectedTags(newTags);
	};

	const formattedInitialValues = useMemo((): PlannedDowntimeFormData => {
		const { schedule } = initialValues;
		const initialAlertIds = initialValues.alertIds || [];

		return {
			name: defaultTo(initialValues.name, ''),
			alertRuleScope:
				isEditMode && initialAlertIds.length === 0 ? 'all' : 'specific',
			alertRules: getAlertOptionsFromIds(initialAlertIds, alertOptions),
			startTime: schedule?.startTime
				? dayjs(schedule.startTime).tz(schedule.timezone)
				: null,
			endTime: schedule?.endTime
				? dayjs(schedule.endTime).tz(schedule.timezone)
				: null,
			recurrence: {
				...schedule?.recurrence,
				repeatType: !isScheduleRecurring(schedule)
					? recurrenceOptions.doesNotRepeat.value
					: schedule?.recurrence?.repeatType,
				duration: getDurationInfo(schedule?.recurrence?.duration)?.value ?? '',
			} as AlertmanagertypesRecurrenceDTO,
			timezone: schedule?.timezone as string,
			scope: initialValues.scope || '',
		};
	}, [initialValues, isEditMode, alertOptions]);

	useEffect(() => {
		setSelectedTags(formattedInitialValues.alertRules);
		setAlertRuleScope(formattedInitialValues.alertRuleScope);
		form.setFieldsValue({ ...formattedInitialValues });
	}, [form, formattedInitialValues, initialValues]);

	const startTimeText = useMemo((): string => {
		const startTime = formData.startTime;
		if (!startTime) {
			return '';
		}

		const daysOfWeek = formData.recurrence?.repeatOn;

		const formattedStartTime = startTime.format(TIME_FORMAT);
		const formattedStartDate = startTime.format(DATE_FORMAT);
		const ordinalFormat = startTime.format(ORDINAL_FORMAT);

		const formattedDaysOfWeek = daysOfWeek?.join(', ');
		switch (recurrenceType) {
			case 'daily':
				return t('al_pd_scheduled_daily', {
					defaultValue:
						'Scheduled from {{date}}, daily starting at {{time}}.',
					date: formattedStartDate,
					time: formattedStartTime,
				});
			case 'monthly':
				return t('al_pd_scheduled_monthly', {
					defaultValue:
						'Scheduled from {{date}}, monthly on the {{ordinal}} starting at {{time}}.',
					date: formattedStartDate,
					ordinal: ordinalFormat,
					time: formattedStartTime,
				});
			case 'weekly':
				return t('al_pd_scheduled_weekly', {
					defaultValue:
						'Scheduled from {{date}}, weekly {{days}} starting at {{time}}',
					date: formattedStartDate,
					days: formattedDaysOfWeek ? `on [${formattedDaysOfWeek}]` : '',
					time: formattedStartTime,
				});
			default:
				return t('al_pd_scheduled_once', {
					defaultValue: 'Scheduled for {{date}} starting at {{time}}.',
					date: formattedStartDate,
					time: formattedStartTime,
				});
		}
	}, [formData, recurrenceType, t]);

	const endTimeText = useMemo((): string => {
		const endTime = formData.endTime;
		if (!endTime) {
			return '';
		}

		const formattedEndTime = endTime.format(TIME_FORMAT);
		const formattedEndDate = endTime.format(DATE_FORMAT);
		return t('al_pd_scheduled_end', {
			defaultValue:
				'Scheduled to end maintenance on {{date}} at {{time}}.',
			date: formattedEndDate,
			time: formattedEndTime,
		});
	}, [formData, t]);

	return (
		<Modal
			title={
				<ModalTitle level={4}>
					{isEditMode
						? t('al_pd_edit_planned_downtime', {
								defaultValue: 'Edit planned downtime',
							})
						: t('al_pd_new_planned_downtime', {
								defaultValue: 'New planned downtime',
							})}
				</ModalTitle>
			}
			centered
			open={isOpen}
			className="createDowntimeModal"
			onCancel={handleCancel}
			footer={null}
		>
			<Form<PlannedDowntimeFormData>
				name={isEditMode ? 'edit-form' : 'create-form'}
				form={form}
				layout="vertical"
				className="createForm"
				onFinish={onFinish}
				onValuesChange={(): void => {
					setRecurrenceType(form.getFieldValue('recurrence')?.repeatType as string);
					setAlertRuleScope(form.getFieldValue('alertRuleScope') as AlertRuleScope);
					handleFormData(form.getFieldsValue());
				}}
				autoComplete="off"
			>
				<Form.Item
					label={t('al_pd_field_name', { defaultValue: 'Name' })}
					name="name"
					rules={requiredFieldRule}
				>
					<Input
						placeholder={t('al_pd_name_placeholder', {
							defaultValue: 'e.g. Upgrade downtime',
						})}
					/>
				</Form.Item>
				<Form.Item
					label={t('al_pd_field_starts_from', { defaultValue: 'Starts from' })}
					name="startTime"
					rules={requiredFieldRule}
					className={!isEmpty(startTimeText) ? 'formItemWithBullet' : ''}
				>
					<DatePicker
						format={(date) => date.format(customFormat)}
						showTime
						renderExtraFooter={datePickerFooter}
						showNow={false}
						popupClassName="datePicker"
					/>
				</Form.Item>
				{!isEmpty(startTimeText) && (
					<div className="scheduleTimeInfoText">{startTimeText}</div>
				)}
				<Form.Item
					label={t('al_pd_field_repeats_every', { defaultValue: 'Repeats every' })}
					name={['recurrence', 'repeatType']}
					rules={requiredFieldRule}
				>
					<Select
						placeholder={t('al_pd_select_option_placeholder', {
							defaultValue: 'Select option...',
						})}
						options={recurrenceOptionWithSubmenu}
					/>
				</Form.Item>
				{recurrenceType === recurrenceOptions.weekly.value && (
					<Form.Item
						label={t('al_pd_field_weekly_occurrence', {
							defaultValue: 'Weekly occurernce',
						})}
						name={['recurrence', 'repeatOn']}
						rules={requiredFieldRule}
					>
						<Select
							placeholder={t('al_pd_select_option_placeholder', {
								defaultValue: 'Select option...',
							})}
							mode="multiple"
							options={Object.values(recurrenceWeeklyOptions)}
						/>
					</Form.Item>
				)}
				{recurrenceType &&
					recurrenceType !== recurrenceOptions.doesNotRepeat.value && (
						<Form.Item
							label={t('al_pd_field_duration', { defaultValue: 'Duration' })}
							name={['recurrence', 'duration']}
							rules={requiredFieldRule}
						>
							<Input
								addonAfter={
									<Select
										defaultValue="m"
										value={durationUnit}
										onChange={(value): void => setDurationUnit(value)}
									>
										<Select.Option value="m">
											{t('al_pd_unit_mins', { defaultValue: 'Mins' })}
										</Select.Option>
										<Select.Option value="h">
											{t('al_pd_unit_hours', { defaultValue: 'Hours' })}
										</Select.Option>
									</Select>
								}
								className="duration-input"
								type="number"
								placeholder={t('al_pd_duration_placeholder', {
									defaultValue: 'Enter duration',
								})}
								min={1}
								onWheel={(e): void => e.currentTarget.blur()}
							/>
						</Form.Item>
					)}
				<Form.Item
					label={t('al_pd_field_timezone', { defaultValue: 'Timezone' })}
					name="timezone"
					rules={requiredFieldRule}
				>
					<Select
						options={TZ_OPTIONS}
						placeholder={t('al_pd_timezone_placeholder', {
							defaultValue: 'Select timezone',
						})}
						showSearch
					/>
				</Form.Item>
				<Form.Item
					label={t('al_pd_field_ends_on', { defaultValue: 'Ends on' })}
					name="endTime"
					required={recurrenceType === recurrenceOptions.doesNotRepeat.value}
					rules={[
						{
							required: recurrenceType === recurrenceOptions.doesNotRepeat.value,
						},
					]}
					className={!isEmpty(endTimeText) ? 'formItemWithBullet' : ''}
				>
					<DatePicker
						format={(date) => date.format(customFormat)}
						showTime
						showNow={false}
						renderExtraFooter={datePickerFooter}
						popupClassName="datePicker"
					/>
				</Form.Item>
				{!isEmpty(endTimeText) && (
					<div className="scheduleTimeInfoText">{endTimeText}</div>
				)}
				<div>
					<Typography style={{ marginBottom: 8 }}>
						{t('al_pd_silence_alerts', { defaultValue: 'Silence Alerts' })}
					</Typography>
					<Form.Item
						name="alertRuleScope"
						initialValue="specific"
						className="alert-rule-scope"
					>
						<RadioGroup className="silence-alerts-radio-group">
							<RadioGroupItem value="all">
								{t('al_pd_all_alert_rules', { defaultValue: 'All alert rules' })}
							</RadioGroupItem>
							<RadioGroupItem value="specific">
								{t('al_pd_specific_alert_rules', {
									defaultValue: 'Specific alert rules',
								})}
							</RadioGroupItem>
						</RadioGroup>
					</Form.Item>
					{alertRuleScope === 'specific' && (
						<>
							<Form.Item noStyle shouldUpdate>
								<AlertRuleTags
									closable
									selectedTags={selectedTags}
									handleClose={handleClose}
								/>
							</Form.Item>
							<Form.Item
								name={alertRuleFormName}
								rules={[
									{
										validator: async (
											_rule,
											value: DefaultOptionType[] | undefined,
										): Promise<void> => {
											if (!value || value.length === 0) {
												throw new Error(
													t('al_pd_select_alert_validation', {
														defaultValue:
															'Select at least one alert rule, or choose "All alert rules" to silence everything.',
													}),
												);
											}
										},
									},
								]}
							>
								<Select
									placeholder={t('al_pd_search_alert_rules_placeholder', {
										defaultValue: 'Search for alert rules or groups...',
									})}
									mode="multiple"
									status={isError ? 'error' : undefined}
									loading={isLoading}
									tagRender={noTagRenderer}
									onChange={handleAlertRulesChange}
									showSearch
									options={alertOptions}
									filterOption={(input, option): boolean =>
										(option?.label as string)
											?.toLowerCase()
											?.includes(input.toLowerCase())
									}
									notFoundContent={
										isLoading ? (
											<span>
												<Spin size="small" />{' '}
												{t('al_pd_loading', { defaultValue: 'Loading...' })}
											</span>
										) : (
											<span>
												{t('al_pd_no_alert_available', {
													defaultValue: 'No alert available.',
												})}
											</span>
										)
									}
								>
									{alertOptions?.map((option) => (
										<Select.Option key={option.value} value={option.value}>
											{option.label}
										</Select.Option>
									))}
								</Select>
							</Form.Item>
						</>
					)}
				</div>
				<Form.Item
					label={
						<span>
							{t('al_pd_field_scope', { defaultValue: 'Scope' })}
							&nbsp;
							<Tooltip
								mouseLeaveDelay={0.3}
								title={
									<span>
										{t('al_pd_scope_tooltip', {
											defaultValue: 'Scope the planned downtime by alert labels.',
										})}{' '}
										<a
											href="https://signoz.io/docs/alerts-management/planned-maintenance/#scoping-with-label-expressions"
											target="_blank"
											rel="noopener noreferrer"
										>
											{t('al_pd_learn_more', { defaultValue: 'Learn more' })}
										</a>
									</span>
								}
							>
								<Info size={13} />
							</Tooltip>
						</span>
					}
					name="scope"
				>
					<Input.TextArea
						placeholder={t('al_pd_scope_placeholder', {
							defaultValue: 'e.g. env = "prod" AND region = "us-east-1"',
						})}
						autoSize={{ minRows: 2, maxRows: 4 }}
					/>
				</Form.Item>
				<Form.Item style={{ marginBottom: 0 }}>
					<ModalButtonWrapper>
						<Button
							key="submit"
							type="primary"
							htmlType="submit"
							onClick={handleOk}
							loading={saveLoading || isLoading}
							className="downtime-schedule-btn"
						>
							<Flex align="center" gap={4}>
								<Check size={16} />
								{isEditMode
									? t('al_pd_update_downtime_schedule', {
											defaultValue: 'Update downtime schedule',
										})
									: t('al_pd_add_downtime_schedule', {
											defaultValue: 'Add downtime schedule',
										})}
							</Flex>
						</Button>
					</ModalButtonWrapper>
				</Form.Item>
			</Form>
		</Modal>
	);
}
