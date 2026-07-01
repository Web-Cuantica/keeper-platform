import { useTranslation } from 'react-i18next';
import KeyValueLabel from 'periscope/components/KeyValueLabel';
import SeeMore from 'periscope/components/SeeMore';

import './AlertLabels.styles.scss';

export type AlertLabelsProps = {
	labels: Record<string, any>;
	initialCount?: number;
};

function AlertLabels({
	labels,
	initialCount = 2,
}: AlertLabelsProps): JSX.Element {
	const { t } = useTranslation('pages');
	return (
		<div className="alert-labels">
			<SeeMore
				initialCount={initialCount}
				moreLabel={t('al_more', { defaultValue: 'More' })}
			>
				{Object.entries(labels).map(([key, value]) => (
					<KeyValueLabel key={`label-${key}`} badgeKey={key} badgeValue={value} />
				))}
			</SeeMore>
		</div>
	);
}

AlertLabels.defaultProps = {
	initialCount: 2,
};

export default AlertLabels;
