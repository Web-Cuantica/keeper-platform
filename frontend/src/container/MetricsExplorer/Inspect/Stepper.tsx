import { Color } from '@signozhq/design-tokens';
import { Button } from 'antd';
import { Typography } from '@signozhq/ui/typography';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { RefreshCcw, SquareArrowOutUpRight } from '@signozhq/icons';

import { SPACE_AGGREGATION_LINK, TEMPORAL_AGGREGATION_LINK } from './constants';
import { InspectionStep, StepperProps } from './types';

import '../../Home/HomeChecklist/HomeChecklist.styles.scss';

function Stepper({
	inspectionStep,
	resetInspection,
}: StepperProps): JSX.Element {
	const { t } = useTranslation('pages');
	return (
		<div className="home-checklist-container">
			<div className="home-checklist-title">
				<Typography.Text>
					{t('metrics_inspector_welcome', {
						defaultValue: '👋 Hello, welcome to the Metrics Inspector',
					})}
				</Typography.Text>
				<Typography.Text>
					{t('metrics_inspector_get_started', {
						defaultValue: 'Let’s get you started...',
					})}
				</Typography.Text>
			</div>
			<div className="completed-checklist-container whats-next-checklist-container">
				<div
					className={classNames({
						'completed-checklist-item':
							inspectionStep > InspectionStep.TIME_AGGREGATION,
						'whats-next-checklist-item':
							inspectionStep <= InspectionStep.TIME_AGGREGATION,
					})}
				>
					<div
						className={classNames({
							'completed-checklist-item-title':
								inspectionStep > InspectionStep.TIME_AGGREGATION,
							'whats-next-checklist-item-title':
								inspectionStep <= InspectionStep.TIME_AGGREGATION,
						})}
					>
						{t('metrics_inspector_step_temporal_prefix', {
							defaultValue: 'First, align the data by selecting a ',
						})}{' '}
						<Typography.Link href={TEMPORAL_AGGREGATION_LINK} target="_blank">
							{t('metrics_inspector_temporal_aggregation', {
								defaultValue: 'Temporal Aggregation',
							})}{' '}
							<SquareArrowOutUpRight color={Color.BG_ROBIN_500} size={10} />
						</Typography.Link>
					</div>
				</div>

				<div
					className={classNames({
						'completed-checklist-item':
							inspectionStep > InspectionStep.SPACE_AGGREGATION,
						'whats-next-checklist-item':
							inspectionStep <= InspectionStep.SPACE_AGGREGATION,
					})}
				>
					<div
						className={classNames({
							'completed-checklist-item-title':
								inspectionStep > InspectionStep.SPACE_AGGREGATION,
							'whats-next-checklist-item-title':
								inspectionStep <= InspectionStep.SPACE_AGGREGATION,
						})}
					>
						{t('metrics_inspector_step_spatial_prefix', {
							defaultValue: 'Add a ',
						})}{' '}
						<Typography.Link href={SPACE_AGGREGATION_LINK} target="_blank">
							{t('metrics_inspector_spatial_aggregation', {
								defaultValue: 'Spatial Aggregation',
							})}{' '}
							<SquareArrowOutUpRight color={Color.BG_ROBIN_500} size={10} />
						</Typography.Link>
					</div>
				</div>
			</div>

			<div className="completed-message-container">
				{inspectionStep === InspectionStep.COMPLETED && (
					<>
						<Typography.Text>
							{t('metrics_inspector_completed', {
								defaultValue:
									'🎉 Ta-da! You have completed your metric query tutorial.',
							})}
						</Typography.Text>
						<Typography.Text>
							{t('metrics_inspector_completed_hint', {
								defaultValue:
									'You can inspect a new metric or reset the query builder.',
							})}
						</Typography.Text>
						<Button icon={<RefreshCcw size={12} />} onClick={resetInspection}>
							{t('metrics_inspector_reset_query', { defaultValue: 'Reset query' })}
						</Button>
					</>
				)}
			</div>
		</div>
	);
}

export default Stepper;
