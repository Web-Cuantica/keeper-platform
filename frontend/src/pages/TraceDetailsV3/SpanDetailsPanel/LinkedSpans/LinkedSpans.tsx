import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight } from '@signozhq/icons';
import { Badge } from '@signozhq/ui/badge';
import ROUTES from 'constants/routes';
import KeyValueLabel from 'periscope/components/KeyValueLabel';

import styles from './LinkedSpans.module.scss';

interface SpanReference {
	traceId: string;
	spanId: string;
	refType: string;
}

interface LinkedSpansProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	references: any;
}

interface LinkedSpansState {
	linkedSpans: SpanReference[];
	count: number;
	isOpen: boolean;
	toggleOpen: () => void;
}

export function useLinkedSpans(references: any): LinkedSpansState {
	const [isOpen, setIsOpen] = useState(false);

	const linkedSpans: SpanReference[] = useMemo(
		() =>
			(references || []).filter(
				(ref: SpanReference) => ref.refType !== 'CHILD_OF',
			),
		[references],
	);

	const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), []);

	return {
		linkedSpans,
		count: linkedSpans.length,
		isOpen,
		toggleOpen,
	};
}

export function LinkedSpansToggle({
	count,
	isOpen,
	toggleOpen,
}: {
	count: number;
	isOpen: boolean;
	toggleOpen: () => void;
}): JSX.Element {
	const { t } = useTranslation('pages');
	// Plural manejado en el componente: se elige la clave explícita según el conteo.
	// El número se pasa como {{n}} (no como `count`) para no activar la resolución
	// de plurales de i18next, que aquí no aplica.
	let labelKey = 'trace_linked_spans';
	let labelDefault = '{{n}} linked spans';
	if (count === 0) {
		labelKey = 'trace_linked_spans_zero';
		labelDefault = '0 linked spans';
	} else if (count === 1) {
		labelKey = 'trace_linked_spans_singular';
		labelDefault = '{{n}} linked span';
	}
	const label = t(labelKey, { n: count, defaultValue: labelDefault });

	if (count === 0) {
		return <span className={styles.label}>{label}</span>;
	}

	return (
		<button type="button" className={styles.toggle} onClick={toggleOpen}>
			<span className={styles.label}>{label}</span>
			{isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
		</button>
	);
}

export function LinkedSpansPanel({
	linkedSpans,
	isOpen,
}: {
	linkedSpans: SpanReference[];
	isOpen: boolean;
}): JSX.Element | null {
	const { t } = useTranslation('pages');
	const getLink = useCallback(
		(item: SpanReference): string =>
			`${ROUTES.TRACE}/${item.traceId}?spanId=${item.spanId}`,
		[],
	);

	if (!isOpen || linkedSpans.length === 0) {
		return null;
	}

	return (
		<div className={styles.list}>
			{linkedSpans.map((item) => (
				<KeyValueLabel
					key={item.spanId}
					badgeKey={t('trace_linked_span_id', { defaultValue: 'Linked Span ID' })}
					badgeValue={
						<Link to={getLink(item)}>
							<Badge color="vanilla">{item.spanId}</Badge>
						</Link>
					}
					direction="column"
				/>
			))}
		</div>
	);
}

function LinkedSpans({ references }: LinkedSpansProps): JSX.Element {
	const { linkedSpans, count, isOpen, toggleOpen } = useLinkedSpans(references);

	return (
		<div className={styles.root}>
			<LinkedSpansToggle count={count} isOpen={isOpen} toggleOpen={toggleOpen} />
			<LinkedSpansPanel linkedSpans={linkedSpans} isOpen={isOpen} />
		</div>
	);
}

export default LinkedSpans;
