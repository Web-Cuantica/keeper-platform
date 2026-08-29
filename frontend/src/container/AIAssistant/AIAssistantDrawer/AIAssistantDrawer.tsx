import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { Button } from '@signozhq/ui/button';
import { TooltipSimple } from '@signozhq/ui/tooltip';
import { Drawer } from 'antd';
import ROUTES from 'constants/routes';
import { Maximize2, Plus, X } from '@signozhq/icons';
import Noz from 'components/Noz/Noz';

import ConversationView from '../ConversationView';
import { useAIAssistantStore } from '../store/useAIAssistantStore';
import { VariantContext } from '../VariantContext';

export default function AIAssistantDrawer(): JSX.Element {
	const { t } = useTranslation('aiAssistant');
	const history = useHistory();

	const isDrawerOpen = useAIAssistantStore((s) => s.isDrawerOpen);
	const activeConversationId = useAIAssistantStore(
		(s) => s.activeConversationId,
	);
	const closeDrawer = useAIAssistantStore((s) => s.closeDrawer);
	const startNewConversation = useAIAssistantStore(
		(s) => s.startNewConversation,
	);

	const handleExpand = useCallback(() => {
		if (!activeConversationId) {
			return;
		}
		closeDrawer();
		history.push(
			ROUTES.AI_ASSISTANT.replace(':conversationId', activeConversationId),
		);
	}, [activeConversationId, closeDrawer, history]);

	const handleNewConversation = useCallback(() => {
		startNewConversation();
	}, [startNewConversation]);

	return (
		<Drawer
			open={isDrawerOpen}
			onClose={closeDrawer}
			placement="right"
			width={420}
			// Suppress default close button — we render our own header
			closeIcon={null}
			title={
				<div>
					<div className="noz-wave">
						<Noz size={16} />
						<span>{t('assistant_name')}</span>
					</div>

					<div>
						<TooltipSimple title={t('new_conversation')}>
							<Button
								variant="ghost"
								size="icon"
								color="secondary"
								onClick={handleNewConversation}
								aria-label={t('new_conversation')}
							>
								<Plus size={16} />
							</Button>
						</TooltipSimple>

						<TooltipSimple title={t('open_full_screen')}>
							<Button
								variant="ghost"
								size="icon"
								color="secondary"
								onClick={handleExpand}
								disabled={!activeConversationId}
								aria-label={t('open_full_screen')}
							>
								<Maximize2 size={16} />
							</Button>
						</TooltipSimple>

						<TooltipSimple title={t('close')}>
							<Button
								variant="ghost"
								size="icon"
								color="secondary"
								onClick={closeDrawer}
								aria-label={t('close_drawer')}
							>
								<X size={16} />
							</Button>
						</TooltipSimple>
					</div>
				</div>
			}
		>
			<VariantContext.Provider value="panel">
				{activeConversationId ? (
					<ConversationView conversationId={activeConversationId} />
				) : null}
			</VariantContext.Provider>
		</Drawer>
	);
}
