import { useTranslation } from 'react-i18next';
import { Color } from '@signozhq/design-tokens';
import { useIsDarkMode } from 'hooks/useDarkMode';
import { BellOff, CircleCheck, CircleOff, Flame } from '@signozhq/icons';

import './AlertState.styles.scss';

type AlertStateProps = {
	state: string;
	showLabel?: boolean;
};

export default function AlertState({
	state,
	showLabel,
}: AlertStateProps): JSX.Element {
	let icon;
	let label;
	const isDarkMode = useIsDarkMode();
	const { t } = useTranslation('pages');
	switch (state) {
		case 'nodata':
			icon = (
				<CircleOff
					size={18}
					fill={Color.BG_SIENNA_400}
					color={Color.BG_SIENNA_400}
				/>
			);
			label = (
				<span style={{ color: Color.BG_SIENNA_400 }}>
					{t('al_state_no_data', { defaultValue: 'No Data' })}
				</span>
			);
			break;

		case 'disabled':
			icon = (
				<BellOff
					size={18}
					fill={Color.BG_VANILLA_400}
					color={Color.BG_VANILLA_400}
				/>
			);
			label = (
				<span style={{ color: Color.BG_VANILLA_400 }}>
					{t('al_state_muted', { defaultValue: 'Muted' })}
				</span>
			);
			break;
		case 'firing':
			icon = (
				<Flame size={18} fill={Color.BG_CHERRY_500} color={Color.BG_CHERRY_500} />
			);
			label = (
				<span style={{ color: Color.BG_CHERRY_500 }}>
					{t('al_state_firing', { defaultValue: 'Firing' })}
				</span>
			);
			break;

		case 'normal':
		case 'inactive':
			icon = (
				<CircleCheck
					size={18}
					fill={Color.BG_FOREST_500}
					color={isDarkMode ? Color.BG_INK_400 : Color.BG_VANILLA_100}
				/>
			);
			label = (
				<span style={{ color: Color.BG_FOREST_500 }}>
					{t('al_state_resolved', { defaultValue: 'Resolved' })}
				</span>
			);
			break;

		default:
			icon = null;
	}

	return (
		<div className="alert-state">
			{icon} {showLabel && <div className="alert-state__label">{label}</div>}
		</div>
	);
}

AlertState.defaultProps = {
	showLabel: false,
};
