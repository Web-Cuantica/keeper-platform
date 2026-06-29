import { useTranslation } from 'react-i18next';
import { Typography } from '@signozhq/ui/typography';
import eyesEmojiUrl from 'assets/Images/eyesEmoji.svg';

import styles from './QueryCancelledPlaceholder.module.scss';

interface QueryCancelledPlaceholderProps {
	subText?: string;
}

function QueryCancelledPlaceholder({
	subText,
}: QueryCancelledPlaceholderProps): JSX.Element {
	const { t } = useTranslation('pages');
	return (
		<div className={styles.placeholder}>
			<img className={styles.emoji} src={eyesEmojiUrl} alt="eyes emoji" />
			<Typography className={styles.text}>
				{t('explorer_query_cancelled', { defaultValue: 'Query cancelled.' })}
				<span className={styles.subText}>
					{' '}
					{subText ||
						t('explorer_query_cancelled_subtext', {
							defaultValue: 'Click "Run Query" to load data.',
						})}
				</span>
			</Typography>
		</div>
	);
}

QueryCancelledPlaceholder.defaultProps = {
	subText: undefined,
};

export default QueryCancelledPlaceholder;
