import { useCallback, useEffect, useMemo, useState } from 'react';
import cx from 'classnames';
import { useCopyToClipboard } from 'react-use';
import { Button } from '@signozhq/ui/button';
import { DialogWrapper } from '@signozhq/ui/dialog';
import { TooltipSimple } from '@signozhq/ui/tooltip';
import { DATE_TIME_FORMATS } from 'constants/dateTimeFormats';
import { Check, Copy, RefreshCw, ThumbsDown, ThumbsUp } from '@signozhq/icons';
import { useTimezone } from 'providers/Timezone';

import logEvent from 'api/common/logEvent';
import type { FeedbackCategory } from 'api/ai-assistant/chat';

import { FeedbackRatingDTO } from 'api/ai-assistant/sigNozAIAssistantAPI.schemas';
import { AIAssistantEvents } from '../../events';
import { useAIAssistantAnalyticsContext } from '../../hooks/useAIAssistantAnalyticsContext';
import { useAIAssistantStore } from '../../store/useAIAssistantStore';
import { FeedbackRating, Message } from '../../types';

import styles from './MessageFeedback.module.scss';

const FEEDBACK_ANALYTICS_RATING = {
	[FeedbackRatingDTO.positive]: 'up',
	[FeedbackRatingDTO.negative]: 'down',
} as const;

const VOTE_LABEL = {
	[FeedbackRatingDTO.positive]: {
		tooltip: 'Good response',
		ariaLabel: 'Good response',
	},
	[FeedbackRatingDTO.negative]: {
		tooltip: 'Bad response',
		ariaLabel: 'Bad response',
	},
} as const;

const NEGATIVE_FEEDBACK_CATEGORIES: Array<{
	value: FeedbackCategory;
	label: string;
}> = [
	{ value: 'incorrect', label: 'Respuesta incorrecta' },
	{ value: 'insufficient_context', label: 'Faltó contexto o datos' },
	{ value: 'wrong_tool', label: 'Herramienta equivocada' },
	{ value: 'slow', label: 'Fue lento' },
	{ value: 'other', label: 'Otro motivo' },
];

interface MessageFeedbackProps {
	message: Message;
	onRegenerate?: () => void;
	isLastAssistant?: boolean;
}

function formatRelativeTime(timestamp: number): string {
	const diffMs = Date.now() - timestamp;
	const diffSec = Math.floor(diffMs / 1000);

	if (diffSec < 10) {
		return 'just now';
	}
	if (diffSec < 60) {
		return `${diffSec}s ago`;
	}

	const diffMin = Math.floor(diffSec / 60);
	if (diffMin < 60) {
		return `${diffMin} min${diffMin === 1 ? '' : 's'} ago`;
	}

	const diffHr = Math.floor(diffMin / 60);
	if (diffHr < 24) {
		return `${diffHr} hr${diffHr === 1 ? '' : 's'} ago`;
	}

	const diffDay = Math.floor(diffHr / 24);
	return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
}

export default function MessageFeedback({
	message,
	onRegenerate,
	isLastAssistant = false,
}: MessageFeedbackProps): JSX.Element {
	const [copied, setCopied] = useState(false);
	const [, copyToClipboard] = useCopyToClipboard();
	const submitMessageFeedback = useAIAssistantStore(
		(s) => s.submitMessageFeedback,
	);
	const { threadId } = useAIAssistantAnalyticsContext();

	const { formatTimezoneAdjustedTimestamp } = useTimezone();

	// Estado local del voto, inicializado desde la calificación persistida.
	const [vote, setVote] = useState<FeedbackRating | null>(
		message.feedbackRating ?? null,
	);

	// El voto negativo se clasifica sin pedir texto libre para que la señal sea analizable y no
	// recopile datos sensibles de forma innecesaria.
	const [isNegativeDialogOpen, setIsNegativeDialogOpen] = useState(false);
	const [negativeCategory, setNegativeCategory] =
		useState<FeedbackCategory | null>(null);
	const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

	const [relativeTime, setRelativeTime] = useState(() =>
		formatRelativeTime(message.createdAt),
	);

	const absoluteTime = useMemo(
		() =>
			formatTimezoneAdjustedTimestamp(
				message.createdAt,
				DATE_TIME_FORMATS.DD_MMM_YYYY_HH_MM_SS,
			),
		[message.createdAt, formatTimezoneAdjustedTimestamp],
	);

	// Tick relative time every 30 s
	useEffect(() => {
		const id = setInterval(() => {
			setRelativeTime(formatRelativeTime(message.createdAt));
		}, 30_000);
		return (): void => clearInterval(id);
	}, [message.createdAt]);

	const handleCopy = useCallback((): void => {
		void logEvent(AIAssistantEvents.MessageCopied, {
			role: message.role,
			messageId: message.id,
			hadToolCalls: Boolean(message.blocks?.some((b) => b.type === 'tool_call')),
		});
		copyToClipboard(message.content);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	}, [
		copyToClipboard,
		message.content,
		message.id,
		message.role,
		message.blocks,
	]);

	const submitVote = useCallback(
		async (
			rating: FeedbackRating,
			category?: FeedbackCategory,
		): Promise<boolean> => {
			setIsSubmittingFeedback(true);
			try {
				const accepted = await submitMessageFeedback(message.id, rating, category);
				if (!accepted) {
					return false;
				}
				setVote(rating);
				void logEvent(AIAssistantEvents.FeedbackSubmitted, {
					messageId: message.id,
					threadId,
					rating: FEEDBACK_ANALYTICS_RATING[rating],
					category: category ?? null,
				});
				return true;
			} finally {
				setIsSubmittingFeedback(false);
			}
		},
		[message.id, submitMessageFeedback, threadId],
	);

	const handleVote = useCallback(
		(rating: FeedbackRating): void => {
			if (vote === rating || isSubmittingFeedback) {
				return;
			}
			if (rating === FeedbackRatingDTO.negative) {
				setNegativeCategory(null);
				setIsNegativeDialogOpen(true);
				return;
			}
			void submitVote(rating);
		},
		[vote, isSubmittingFeedback, submitVote],
	);

	const handleSubmitNegative = useCallback(async (): Promise<void> => {
		if (!negativeCategory) {
			return;
		}
		const accepted = await submitVote(
			FeedbackRatingDTO.negative,
			negativeCategory,
		);
		if (accepted) {
			setIsNegativeDialogOpen(false);
		}
	}, [negativeCategory, submitVote]);

	return (
		<>
			<div className={cx(styles.feedback, { [styles.visible]: isLastAssistant })}>
				<div className={styles.actions}>
					<TooltipSimple title={copied ? 'Copied!' : 'Copy'}>
						<Button
							className={styles.btn}
							size="icon"
							variant="ghost"
							onClick={handleCopy}
							color="secondary"
							aria-label={copied ? 'Copied' : 'Copy message'}
						>
							{copied ? <Check size={12} /> : <Copy size={12} />}
						</Button>
					</TooltipSimple>

					<TooltipSimple title={VOTE_LABEL[FeedbackRatingDTO.positive].tooltip}>
						<Button
							className={cx(styles.btn, {
								[styles.votedUp]: vote === FeedbackRatingDTO.positive,
							})}
							size="icon"
							variant="ghost"
							color="secondary"
							onClick={(): void => handleVote(FeedbackRatingDTO.positive)}
							aria-label={VOTE_LABEL[FeedbackRatingDTO.positive].ariaLabel}
							aria-pressed={vote === FeedbackRatingDTO.positive}
							disabled={isSubmittingFeedback}
						>
							<ThumbsUp size={12} />
						</Button>
					</TooltipSimple>

					<TooltipSimple title={VOTE_LABEL[FeedbackRatingDTO.negative].tooltip}>
						<Button
							className={cx(styles.btn, {
								[styles.votedDown]: vote === FeedbackRatingDTO.negative,
							})}
							size="icon"
							variant="ghost"
							color="secondary"
							onClick={(): void => handleVote(FeedbackRatingDTO.negative)}
							aria-label={VOTE_LABEL[FeedbackRatingDTO.negative].ariaLabel}
							aria-pressed={vote === FeedbackRatingDTO.negative}
							disabled={isSubmittingFeedback}
						>
							<ThumbsDown size={12} />
						</Button>
					</TooltipSimple>

					{onRegenerate && (
						<TooltipSimple title="Regenerate">
							<Button
								className={styles.btn}
								size="icon"
								variant="ghost"
								color="secondary"
								onClick={onRegenerate}
								aria-label="Regenerate response"
							>
								<RefreshCw size={12} />
							</Button>
						</TooltipSimple>
					)}
				</div>

				<span className={styles.time}>
					{relativeTime} · {absoluteTime}
				</span>
			</div>

			<DialogWrapper
				open={isNegativeDialogOpen}
				onOpenChange={setIsNegativeDialogOpen}
				title="¿Qué salió mal?"
				subTitle="Elige el motivo principal. No recopilamos comentarios libres en esta etapa."
				width="base"
				footer={
					<div className={styles.feedbackDialogFooter}>
						<Button
							variant="solid"
							color="secondary"
							onClick={(): void => setIsNegativeDialogOpen(false)}
						>
							Cancelar
						</Button>
						<Button
							variant="solid"
							color="primary"
							onClick={(): void => void handleSubmitNegative()}
							disabled={!negativeCategory || isSubmittingFeedback}
						>
							Enviar feedback
						</Button>
					</div>
				}
			>
				<div
					className={styles.feedbackCategories}
					role="group"
					aria-label="Motivo del feedback negativo"
				>
					{NEGATIVE_FEEDBACK_CATEGORIES.map((category) => (
						<Button
							key={category.value}
							variant={negativeCategory === category.value ? 'solid' : 'outlined'}
							color={negativeCategory === category.value ? 'primary' : 'secondary'}
							onClick={(): void => setNegativeCategory(category.value)}
							aria-pressed={negativeCategory === category.value}
							disabled={isSubmittingFeedback}
						>
							{category.label}
						</Button>
					))}
				</div>
			</DialogWrapper>
		</>
	);
}
