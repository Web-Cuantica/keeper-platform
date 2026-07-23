import { useTranslation } from 'react-i18next';
import { Typography } from '@signozhq/ui/typography';
import { ConciergeBell, Plus, SquareArrowOutUpRight } from '@signozhq/icons';

import './AlertsSection.styles.scss';

interface AlertsSectionProps {
	onCreateAlertsHandler: () => void;
}

export default function AlertsSection({
	onCreateAlertsHandler,
}: AlertsSectionProps): JSX.Element {
	const { t } = useTranslation('pages');
	return (
		<section className="alerts-section" onClick={onCreateAlertsHandler}>
			<div className="alerts-section__left">
				<ConciergeBell size={14} className="alerts-section__bell-icon" />
				<Typography.Text className="alerts-section__text">{t('qb_alerts', { defaultValue: "Alerts" })}</Typography.Text>
				<SquareArrowOutUpRight size={10} className="info-icon" />
			</div>
			<Plus size={14} className="alerts-section__plus-icon" />
		</section>
	);
}
