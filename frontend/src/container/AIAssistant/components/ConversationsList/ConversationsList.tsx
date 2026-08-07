import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import cx from 'classnames';
import { Button } from '@signozhq/ui/button';
import { Input } from '@signozhq/ui/input';
import { TooltipSimple } from '@signozhq/ui/tooltip';
import { Plus, Search } from '@signozhq/icons';

import logEvent from 'api/common/logEvent';

import { AIAssistantEvents } from '../../events';
import { useAIAssistantStore } from '../../store/useAIAssistantStore';
import { Conversation } from '../../types';
import { useVariant } from '../../VariantContext';
import ConversationItem from '../ConversationItem';

import styles from './ConversationsList.module.scss';

interface ConversationsListProps {
	/** Called when a conversation is selected — lets the parent navigate if needed */
	onSelect?: (id: string) => void;
	onNewConversation?: () => void;
	showAddNewConversation?: boolean;
}

function groupByDate(
	conversations: Conversation[],
): { label: string; items: Conversation[] }[] {
	const now = Date.now();
	const DAY = 86_400_000;

	// Las claves son de traducción, no textos: esta función no es un hook y no
	// puede llamar a `useTranslation`. El rótulo se resuelve al renderizar.
	const groups: Record<string, Conversation[]> = {
		group_today: [],
		group_yesterday: [],
		group_last_7_days: [],
		group_last_30_days: [],
		group_older: [],
	};

	for (const conv of conversations) {
		const age = now - (conv.updatedAt ?? conv.createdAt);
		if (age < DAY) {
			groups.group_today.push(conv);
		} else if (age < 2 * DAY) {
			groups.group_yesterday.push(conv);
		} else if (age < 7 * DAY) {
			groups.group_last_7_days.push(conv);
		} else if (age < 30 * DAY) {
			groups.group_last_30_days.push(conv);
		} else {
			groups.group_older.push(conv);
		}
	}

	return Object.entries(groups)
		.filter(([, items]) => items.length > 0)
		.map(([label, items]) => ({ label, items }));
}

/**
 * Three-dot loading indicator. Sits inside the sidebar header so the
 * conversation list is never bumped down by a skeleton row when threads
 * load — visible signal of in-flight work without any layout shift.
 */
function HeaderLoadingDots(): JSX.Element {
	const { t } = useTranslation('aiAssistant');
	return (
		<span className={styles.loadingDots} role="status" aria-label={t('loading')}>
			<span className={styles.loadingDot} />
			<span className={styles.loadingDot} />
			<span className={styles.loadingDot} />
		</span>
	);
}

export default function ConversationsList({
	onSelect,
	onNewConversation,
	showAddNewConversation = false,
}: ConversationsListProps): JSX.Element {
	const { t } = useTranslation('aiAssistant');
	const variant = useVariant();
	const conversations = useAIAssistantStore((s) => s.conversations);
	const activeConversationId = useAIAssistantStore(
		(s) => s.activeConversationId,
	);
	const isLoadingThreads = useAIAssistantStore((s) => s.isLoadingThreads);
	const setActiveConversation = useAIAssistantStore(
		(s) => s.setActiveConversation,
	);
	const loadThread = useAIAssistantStore((s) => s.loadThread);
	const fetchThreads = useAIAssistantStore((s) => s.fetchThreads);
	const archiveConversation = useAIAssistantStore((s) => s.archiveConversation);
	const restoreConversation = useAIAssistantStore((s) => s.restoreConversation);
	const renameConversation = useAIAssistantStore((s) => s.renameConversation);

	const [searchQuery, setSearchQuery] = useState('');

	// Fetch threads from backend on mount
	useEffect(() => {
		void fetchThreads();
	}, [fetchThreads]);

	// Case-insensitive substring match against the conversation title.
	// Untitled conversations match the placeholder so users searching for
	// "nueva" can still find them.
	const trimmedQuery = searchQuery.trim().toLowerCase();
	// `t` puede devolver undefined segun los tipos de i18next; el `?? ''` evita
	// que una clave ausente se convierta en el texto "undefined" y haga que las
	// conversaciones sin titulo aparezcan al buscar esa palabra.
	const untitledLabel = t('new_conversation') ?? '';
	const matchesQuery = (c: Conversation): boolean => {
		if (!trimmedQuery) {
			return true;
		}
		const title = (c.title ?? untitledLabel).toLowerCase();
		return title.includes(trimmedQuery);
	};

	const sortedActive = useMemo(
		() =>
			Object.values(conversations)
				.filter((c) => !c.archived && matchesQuery(c))
				.sort(
					(a, b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt),
				),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[conversations, trimmedQuery],
	);

	const sortedArchived = useMemo(
		() =>
			Object.values(conversations)
				.filter((c) => Boolean(c.archived) && c.threadId && matchesQuery(c))
				.sort(
					(a, b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt),
				),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[conversations, trimmedQuery],
	);

	const groups = useMemo(() => groupByDate(sortedActive), [sortedActive]);

	const hasAnySidebarRows = groups.length > 0 || sortedArchived.length > 0;
	const isSearching = trimmedQuery.length > 0;

	const handleSelect = (id: string): void => {
		const conv = conversations[id];
		// Skip re-selecting the currently active thread — Notion-style click on
		// the highlighted row in the history list shouldn't inflate the funnel.
		const isReselectingActive = id === activeConversationId;
		if (conv?.threadId && !isReselectingActive) {
			void logEvent(AIAssistantEvents.ThreadOpenedFromHistory, {
				threadId: conv.threadId,
				threadAgeDays: Math.floor(
					(Date.now() - conv.createdAt) / (24 * 60 * 60 * 1000),
				),
			});
		}
		if (conv?.threadId) {
			// Always load from backend — refreshes messages and reconnects
			// to active execution if the thread is still busy.
			void loadThread(conv.threadId);
		} else {
			// Local-only conversation (no backend thread yet)
			setActiveConversation(id);
		}
		onSelect?.(id);
	};

	const variantClass =
		variant === 'page' ? styles.variantPage : styles.variantPanel;

	return (
		<div className={cx(styles.conversationsList, variantClass)}>
			<div className={styles.header}>
				<span className={styles.heading}>{t('conversations')}</span>
				{isLoadingThreads && <HeaderLoadingDots />}

				{!isLoadingThreads && showAddNewConversation && (
					<TooltipSimple title={t('new_conversation')}>
						<Button
							variant="solid"
							size="sm"
							color="secondary"
							onClick={onNewConversation}
							aria-label={t('new_conversation')}
						>
							<Plus size={12} />
						</Button>
					</TooltipSimple>
				)}
			</div>

			<div className={styles.searchBar}>
				<Input
					type="text"
					value={searchQuery}
					onChange={(e): void => setSearchQuery(e.target.value)}
					placeholder={t('search_conversations')}
					prefix={<Search size={12} />}
					className={styles.search}
				/>
			</div>

			<div className={styles.list} aria-busy={isLoadingThreads}>
				{isLoadingThreads && (
					<span className={styles.srOnly} role="status">
						Loading conversations
					</span>
				)}

				{!isLoadingThreads && !hasAnySidebarRows && (
					<p className={styles.empty}>
						{isSearching ? 'No matching conversations.' : 'No conversations yet.'}
					</p>
				)}

				{groups.map(({ label, items }) => (
					<div key={label} className={styles.group}>
						<span className={styles.groupLabel}>{t(label)}</span>
						{items.map((conv) => (
							<ConversationItem
								key={conv.id}
								conversation={conv}
								isActive={conv.id === activeConversationId}
								onSelect={handleSelect}
								onRename={renameConversation}
								onArchive={archiveConversation}
								onRestore={restoreConversation}
							/>
						))}
					</div>
				))}

				{sortedArchived.length > 0 && (
					<div className={cx(styles.group, styles.archived)}>
						<span className={styles.groupLabel}>{t('archived_conversations')}</span>
						{sortedArchived.map((conv) => (
							<ConversationItem
								key={conv.id}
								conversation={conv}
								isActive={conv.id === activeConversationId}
								onSelect={handleSelect}
								onRename={renameConversation}
								onArchive={archiveConversation}
								onRestore={restoreConversation}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
