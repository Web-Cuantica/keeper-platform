import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CircleCheck, Plus, RefreshCw } from '@signozhq/icons';
import { Button } from '@signozhq/ui/button';
import ROUTES from 'constants/routes';
import { useSafeNavigate } from 'hooks/useSafeNavigate';
import { isModifierKeyPressed } from 'utils/app';

import styles from './EmptyStates.module.scss';

interface EmptyStateProps {
	onRefresh?: () => void;
}

export function EmptyState({ onRefresh }: EmptyStateProps): JSX.Element {
	const { t } = useTranslation('pages');
	const { safeNavigate } = useSafeNavigate();

	const handleCreateAlert = useCallback(
		(e: React.MouseEvent): void => {
			safeNavigate(ROUTES.ALERTS_NEW, { newTab: isModifierKeyPressed(e) });
		},
		[safeNavigate],
	);

	return (
		<div className={styles.emptyState}>
			<CircleCheck className={styles.emptyStateIcon} size={16} />
			<div className={styles.emptyStateTitle}>
				{t('al_empty_no_alerts_firing', { defaultValue: 'No alerts firing' })}
			</div>
			<div className={styles.emptyStateSubtitle}>
				{t('al_empty_all_systems_healthy', {
					defaultValue:
						'All systems are healthy. No alerts are currently triggered.',
				})}
			</div>
			<div className={styles.emptyStateActions}>
				<Button
					variant="solid"
					color="primary"
					prefix={<Plus size={14} />}
					onClick={handleCreateAlert}
					testId="triggered-alerts-empty-create-button"
				>
					{t('al_create_alert_rule', { defaultValue: 'Create Alert Rule' })}
				</Button>
				{onRefresh && (
					<Button
						variant="outlined"
						color="secondary"
						prefix={<RefreshCw size={14} />}
						onClick={onRefresh}
						testId="triggered-alerts-empty-refresh-button"
					>
						{t('al_refresh', { defaultValue: 'Refresh' })}
					</Button>
				)}
			</div>
		</div>
	);
}
