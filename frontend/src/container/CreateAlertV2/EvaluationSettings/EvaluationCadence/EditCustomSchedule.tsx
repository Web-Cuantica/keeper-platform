import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { Typography } from '@signozhq/ui/typography';
import { useCreateAlertState } from 'container/CreateAlertV2/context';
import { INITIAL_ADVANCED_OPTIONS_STATE } from 'container/CreateAlertV2/context/constants';
import { IEditCustomScheduleProps } from 'container/CreateAlertV2/EvaluationSettings/types';
import { Calendar1, Pencil, Trash } from '@signozhq/icons';

function EditCustomSchedule({
	setIsEvaluationCadenceDetailsVisible,
	setIsPreviewVisible,
}: IEditCustomScheduleProps): JSX.Element {
	const { t } = useTranslation('pages');
	const { advancedOptions, setAdvancedOptions } = useCreateAlertState();

	const displayText = useMemo(() => {
		if (advancedOptions.evaluationCadence.mode === 'custom') {
			return (
				<Typography.Text>
					<Typography.Text>
						{t('al_v2_schedule_every', { defaultValue: 'Every' })}
					</Typography.Text>
					<Typography.Text className="highlight">
						{advancedOptions.evaluationCadence.custom.repeatEvery
							.charAt(0)
							.toUpperCase() +
							advancedOptions.evaluationCadence.custom.repeatEvery.slice(1)}
					</Typography.Text>
					{advancedOptions.evaluationCadence.custom.repeatEvery !== 'day' && (
						<>
							<Typography.Text>
								{t('al_v2_schedule_on', { defaultValue: 'on' })}
							</Typography.Text>
							<Typography.Text className="highlight">
								{advancedOptions.evaluationCadence.custom.occurence
									.map(
										(occurence) => occurence.charAt(0).toUpperCase() + occurence.slice(1),
									)
									.join(', ')}
							</Typography.Text>
						</>
					)}
					<Typography.Text>
						{t('al_v2_schedule_at', { defaultValue: 'at' })}
					</Typography.Text>
					<Typography.Text className="highlight">
						{advancedOptions.evaluationCadence.custom.startAt}
					</Typography.Text>
				</Typography.Text>
			);
		}
		return (
			<Typography.Text>
				<Typography.Text>
					{t('al_v2_schedule_starting_on', { defaultValue: 'Starting on' })}
				</Typography.Text>
				<Typography.Text className="highlight">
					{advancedOptions.evaluationCadence.rrule.date?.format('DD/MM/YYYY')}
				</Typography.Text>
				<Typography.Text>
					{t('al_v2_schedule_at', { defaultValue: 'at' })}
				</Typography.Text>
				<Typography.Text className="highlight">
					{advancedOptions.evaluationCadence.rrule.startAt}
				</Typography.Text>
			</Typography.Text>
		);
	}, [advancedOptions.evaluationCadence, t]);

	const handleEdit = (): void => {
		setIsEvaluationCadenceDetailsVisible(true);
	};

	const handlePreview = (): void => {
		setIsPreviewVisible(true);
	};

	const handleDiscard = (): void => {
		setIsEvaluationCadenceDetailsVisible(false);
		setAdvancedOptions({
			type: 'SET_EVALUATION_CADENCE',
			payload: INITIAL_ADVANCED_OPTIONS_STATE.evaluationCadence,
		});
		setAdvancedOptions({
			type: 'SET_EVALUATION_CADENCE_MODE',
			payload: 'default',
		});
	};

	return (
		<div className="edit-custom-schedule">
			{displayText}
			<div className="button-row">
				<Button.Group>
					<Button type="default" onClick={handleEdit}>
						<Pencil size={12} />
						<Typography.Text>
							{t('al_v2_edit_custom_schedule', {
								defaultValue: 'Edit custom schedule',
							})}
						</Typography.Text>
					</Button>
					<Button type="default" onClick={handlePreview}>
						<Calendar1 size={12} />
						<Typography.Text>
							{t('al_v2_preview', { defaultValue: 'Preview' })}
						</Typography.Text>
					</Button>
					<Button
						data-testid="discard-button"
						type="default"
						onClick={handleDiscard}
					>
						<Trash size={12} />
					</Button>
				</Button.Group>
			</div>
		</div>
	);
}

export default EditCustomSchedule;
