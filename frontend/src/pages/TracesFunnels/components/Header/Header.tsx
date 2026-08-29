import { useTranslation } from 'react-i18next';

function Header(): JSX.Element {
	const { t } = useTranslation('pages');

	return (
		<div className="traces-funnels-header">
			<div className="traces-funnels-header-title">
				{t('funnel_title', { defaultValue: 'Funnels' })}
			</div>
			<div className="traces-funnels-header-subtitle">
				{t('funnel_subtitle', {
					defaultValue: 'Create and manage tracing funnels.',
				})}
			</div>
		</div>
	);
}

export default Header;
