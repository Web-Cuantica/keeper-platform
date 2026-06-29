import { useTranslation } from 'react-i18next';
import { Typography } from '@signozhq/ui/typography';

import emptyStateUrl from '@/assets/Icons/emptyState.svg';

import styles from './EntityEmptyState.module.scss';

interface EntityEmptyStateProps {
	hasFilters: boolean;
}

export default function EntityEmptyState({
	hasFilters,
}: EntityEmptyStateProps): JSX.Element {
	const { t } = useTranslation('pages');
	return (
		<div className={styles.container}>
			<div className={styles.content}>
				<img src={emptyStateUrl} alt="empty-state" className={styles.icon} />
				{hasFilters ? (
					<Typography.Text>
						<span className={styles.title}>
							{t('infra_empty_no_results_title', {
								defaultValue: 'This query had no results. ',
							})}
						</span>
						{t('infra_empty_edit_query_retry', {
							defaultValue: 'Edit your query and try again!',
						})}
					</Typography.Text>
				) : (
					<Typography.Text>
						<span className={styles.title}>
							{t('infra_empty_no_data_title', { defaultValue: 'No data yet. ' })}
						</span>
						{t('infra_empty_no_data_message', {
							defaultValue: 'When we receive data, it will show up here.',
						})}
					</Typography.Text>
				)}
			</div>
		</div>
	);
}
