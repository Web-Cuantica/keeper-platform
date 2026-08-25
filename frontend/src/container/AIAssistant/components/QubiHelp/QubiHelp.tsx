import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Button } from '@signozhq/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@signozhq/ui/popover';
import { TooltipSimple } from '@signozhq/ui/tooltip';
import { CircleHelp } from '@signozhq/icons';

import logEvent from 'api/common/logEvent';

import { AIAssistantEvents, SuggestedPromptCategory } from '../../events';
import { getAutoContexts } from '../../getAutoContexts';
import { useAIAssistantStore } from '../../store/useAIAssistantStore';
import { useVariant } from '../../VariantContext';

import styles from './QubiHelp.module.scss';

/**
 * Ayuda del asistente: qué sabe hacer Qubi, con un ejemplo real por capacidad.
 *
 * Existe porque la capacidad de un asistente es invisible — el usuario ve una caja de
 * texto y tiene que adivinar qué preguntarle. Cada ejemplo es clicable y se envía como
 * si lo hubiera escrito, CON el contexto de la página en la que está (mismo camino que
 * un mensaje normal), para que "este tablero" signifique el que tiene enfrente.
 *
 * REGLA: aquí solo va lo que Qubi sabe hacer HOY. Una capacidad prometida que falla al
 * primer clic es peor que no anunciarla (es la misma regla de los chips del estado vacío).
 */

/** Cada grupo es una capacidad; `examples` son preguntas que el usuario puede mandar tal cual. */
const HELP_GROUPS = [
	{ id: 'explore', examples: ['ex_slow_endpoints', 'ex_errors', 'ex_service_health'] },
	{ id: 'context', examples: ['ex_this_period', 'ex_this_service'] },
	// Interpretación (Nivel 3a): entró aquí cuando quedó medida y desplegada (v9), no antes.
	// Los ejemplos nombran el servicio a propósito: funcionan desde CUALQUIER página; un
	// deíctico ("esta gráfica") fuera de un tablero obligaría a Qubi a preguntar cuál.
	{ id: 'interpret', examples: ['ex_latency', 'ex_is_normal'] },
	{ id: 'build', examples: ['ex_dashboard', 'ex_alert'] },
] as const;

export default function QubiHelp(): JSX.Element {
	const { t } = useTranslation('aiAssistant');
	const [open, setOpen] = useState(false);
	const location = useLocation();
	const variant = useVariant();
	const sendMessage = useAIAssistantStore((s) => s.sendMessage);

	// El mismo contexto que adjunta un mensaje escrito a mano: en la página dedicada no
	// hay página "de fondo" a la que referirse, así que no se adjunta nada.
	const contexts = useMemo(
		() =>
			variant === 'page'
				? []
				: getAutoContexts(location.pathname, location.search),
		[variant, location.pathname, location.search],
	);

	const handleExample = useCallback(
		(key: string): void => {
			const text = t(key);
			void logEvent(AIAssistantEvents.SuggestedPromptClicked, {
				promptId: key,
				category: SuggestedPromptCategory.EmptyState,
				source: 'help',
			});
			setOpen(false);
			void sendMessage(text, undefined, contexts.length > 0 ? contexts : undefined);
		},
		[t, sendMessage, contexts],
	);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<TooltipSimple title={t('help_title')}>
				<PopoverTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						color="secondary"
						aria-label={t('help_title')}
						data-testid="qubi-help-trigger"
						prefix={<CircleHelp size={14} />}
					/>
				</PopoverTrigger>
			</TooltipSimple>

			<PopoverContent
				className={styles.helpPopover}
				side="bottom"
				align="end"
				sideOffset={8}
			>
				<div className={styles.content} data-testid="qubi-help-content">
					<h4 className={styles.heading}>{t('help_heading')}</h4>
					<p className={styles.subtitle}>{t('help_subtitle')}</p>

					{HELP_GROUPS.map((group) => (
						<div key={group.id} className={styles.group}>
							<div className={styles.groupTitle}>{t(`help_${group.id}_title`)}</div>
							<div className={styles.groupDesc}>{t(`help_${group.id}_desc`)}</div>
							<div className={styles.examples}>
								{group.examples.map((key) => (
									<button
										key={key}
										type="button"
										className={styles.example}
										onClick={(): void => handleExample(key)}
										data-testid={`qubi-help-example-${key}`}
									>
										{t(key)}
									</button>
								))}
							</div>
						</div>
					))}

					<p className={styles.footnote}>{t('help_footnote')}</p>
				</div>
			</PopoverContent>
		</Popover>
	);
}
