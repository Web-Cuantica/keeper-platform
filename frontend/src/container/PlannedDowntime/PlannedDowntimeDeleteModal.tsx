import { SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'antd';
import { Typography } from '@signozhq/ui/typography';
import { Trash2, X } from '@signozhq/icons';

import './PlannedDowntime.styles.scss';

interface PlannedDowntimeDeleteModalProps {
	isDeleteModalOpen: boolean;
	setIsDeleteModalOpen: (value: SetStateAction<boolean>) => void;
	onDeleteHandler: () => void;
	isDeleteLoading: boolean;
	downtimeSchedule: string;
}

export function PlannedDowntimeDeleteModal(
	props: PlannedDowntimeDeleteModalProps,
): JSX.Element {
	const {
		isDeleteModalOpen,
		setIsDeleteModalOpen,
		isDeleteLoading,
		onDeleteHandler,
		downtimeSchedule,
	} = props;
	const { t } = useTranslation('pages');
	const hideDeleteScheduleModal = (): void => {
		setIsDeleteModalOpen(false);
	};
	return (
		<Modal
			className="delete-schedule-modal"
			title={
				<span className="title">
					{t('al_pd_delete_title', { defaultValue: 'Delete Schedule' })}
				</span>
			}
			open={isDeleteModalOpen}
			closable={false}
			onCancel={hideDeleteScheduleModal}
			footer={[
				<Button
					key="cancel"
					onClick={hideDeleteScheduleModal}
					className="cancel-btn"
					icon={<X size={16} />}
				>
					{t('al_pd_cancel', { defaultValue: 'Cancel' })}
				</Button>,
				<Button
					key="submit"
					icon={<Trash2 size={16} />}
					onClick={onDeleteHandler}
					className="delete-btn"
					disabled={isDeleteLoading}
				>
					{t('al_pd_delete_schedule', { defaultValue: 'Delete Schedule' })}
				</Button>,
			]}
		>
			<Typography.Text className="delete-text">
				{t('al_pd_delete_confirm', {
					defaultValue:
						'Are you sure you want to delete - {{schedule}} schedule? Deleting a schedule is irreversible and cannot be undone.',
					schedule: downtimeSchedule,
				})}
			</Typography.Text>
		</Modal>
	);
}
