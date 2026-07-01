import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import LearnMore from 'components/LearnMore/LearnMore';
import { MCP_USE_CASES_URL } from '../clients';

import './UseCasesCard.styles.scss';

interface UseCasesCardProps {
	onDocsLinkClick: (target: string) => void;
}

function UseCasesCard({ onDocsLinkClick }: UseCasesCardProps): JSX.Element {
	const { t } = useTranslation('pages');
	const handleClick = useCallback(
		() => onDocsLinkClick('use-cases'),
		[onDocsLinkClick],
	);

	return (
		<section className="mcp-use-cases-card">
			<h3 className="mcp-use-cases-card__title">
				{t('intg_mcp_use_cases_title', { defaultValue: 'What you can do with it' })}
			</h3>
			<ul className="mcp-use-cases-card__list">
				<li>
					{t('intg_mcp_use_case_1', {
						defaultValue: 'Ask your AI assistant to investigate a spiking error rate.',
					})}
				</li>
				<li>
					{t('intg_mcp_use_case_2', {
						defaultValue: 'Debug a slow service by walking through recent traces.',
					})}
				</li>
				<li>
					{t('intg_mcp_use_case_3', {
						defaultValue: 'Summarize an alert and suggest likely root causes.',
					})}
				</li>
				<li>
					{t('intg_mcp_use_case_4', {
						defaultValue:
							'Generate dashboards or queries from a natural-language description.',
					})}
				</li>
			</ul>
			<LearnMore
				text={t('intg_mcp_see_more_use_cases', {
					defaultValue: 'See more use cases',
				})}
				url={MCP_USE_CASES_URL}
				onClick={handleClick}
			/>
		</section>
	);
}

export default UseCasesCard;
