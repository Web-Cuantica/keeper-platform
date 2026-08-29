import { useTranslation } from 'react-i18next';
import { Dispatch, SetStateAction } from 'react';
import { Link } from '@signozhq/icons';
import { ContextLinksData, Widgets } from 'types/api/dashboard/getAll';

import SettingsSection from '../../components/SettingsSection/SettingsSection';
import ContextLinks from '../../ContextLinks';

import './ContextLinksSection.styles.scss';

interface ContextLinksSectionProps {
	contextLinks: ContextLinksData;
	setContextLinks: Dispatch<SetStateAction<ContextLinksData>>;
	selectedWidget?: Widgets;
}

export default function ContextLinksSection({
	contextLinks,
	setContextLinks,
	selectedWidget,
}: ContextLinksSectionProps): JSX.Element {
	const { t } = useTranslation('pages');
	return (
		<SettingsSection
			title={t('qb_context_links', { defaultValue: "Context Links" })}
			icon={<Link size={14} />}
			defaultOpen={!!contextLinks.linksData.length}
		>
			<div className="context-links-section">
				<ContextLinks
					contextLinks={contextLinks}
					setContextLinks={setContextLinks}
					selectedWidget={selectedWidget}
				/>
			</div>
		</SettingsSection>
	);
}
