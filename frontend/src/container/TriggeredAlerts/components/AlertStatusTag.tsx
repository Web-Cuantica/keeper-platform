import { useTranslation } from 'react-i18next';
import { Badge } from '@signozhq/ui/badge';

interface AlertStatusTagProps {
	state: string;
	testId?: string;
}

function AlertStatusTag({ state, testId }: AlertStatusTagProps): JSX.Element {
	const { t } = useTranslation('pages');
	switch (state) {
		case 'unprocessed':
			return (
				<Badge color="success" variant="outline" testId={testId}>
					{t('al_status_unprocessed', { defaultValue: 'Unprocessed' })}
				</Badge>
			);
		case 'active':
			return (
				<Badge color="error" variant="outline" testId={testId}>
					{t('al_status_firing', { defaultValue: 'Firing' })}
				</Badge>
			);
		case 'suppressed':
			return (
				<Badge color="error" variant="outline" testId={testId}>
					{t('al_status_suppressed', { defaultValue: 'Suppressed' })}
				</Badge>
			);
		default:
			return (
				<Badge color="secondary" variant="outline" testId={testId}>
					{t('al_status_unknown', { defaultValue: 'Unknown' })}
				</Badge>
			);
	}
}

export default AlertStatusTag;
