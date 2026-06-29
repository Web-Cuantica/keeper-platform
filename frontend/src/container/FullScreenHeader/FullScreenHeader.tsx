import history from 'lib/history';

import signozBrandLogoUrl from '@/assets/Logos/cuantica-icon.png';

import './FullScreenHeader.styles.scss';

export default function FullScreenHeader({
	overrideRoute,
}: {
	overrideRoute?: string;
}): React.ReactElement {
	const handleLogoClick = (): void => {
		history.push(overrideRoute || '/');
	};
	return (
		<div className="full-screen-header-container">
			<div className="brand-logo" onClick={handleLogoClick}>
				<img src={signozBrandLogoUrl} alt="Keeper" />

				<div className="brand-logo-name">Keeper</div>
			</div>
		</div>
	);
}

FullScreenHeader.defaultProps = {
	overrideRoute: '/',
};
