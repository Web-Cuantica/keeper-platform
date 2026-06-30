import { ReactNode } from 'react';
import { Badge } from '@signozhq/ui/badge';
import ExpandableValue from 'periscope/components/ExpandableValue';
import { SpanV3 } from 'types/api/trace/getTraceV3';

import styles from './SpanDetailsPanel.module.scss';
import { TraceIdField } from './TraceIdField';

interface HighlightedOption {
	key: string;
	label: string;
	render: (span: SpanV3) => ReactNode | null;
}

// Función traductora tipada (no se importa TFunction para no acoplar a su firma).
type TFunc = (key: string, options?: Record<string, unknown>) => string;

// Fábrica de opciones destacadas: recibe `t` porque el config es a nivel de
// módulo y no puede usar el hook useTranslation directamente.
export function getHighlightedOptions(t: TFunc): HighlightedOption[] {
	return [
		{
			key: 'service',
			label: t('trace_lbl_service', { defaultValue: 'SERVICE' }),
			render: (span): ReactNode | null =>
				span['service.name'] ? (
					<Badge color="vanilla">
						<span className={styles.serviceDot} />
						{span['service.name']}
					</Badge>
				) : null,
		},
		{
			key: 'statusCode',
			label: t('trace_lbl_status_code', { defaultValue: 'STATUS CODE' }),
			render: (span): ReactNode | null =>
				span.status_code_string ? (
					<Badge color="vanilla">{span.status_code_string}</Badge>
				) : null,
		},
		{
			key: 'traceId',
			label: t('trace_lbl_trace_id', { defaultValue: 'TRACE ID' }),
			render: (span): ReactNode | null =>
				span.trace_id ? <TraceIdField span={span} /> : null,
		},
		{
			key: 'spanKind',
			label: t('trace_lbl_span_kind', { defaultValue: 'SPAN KIND' }),
			render: (span): ReactNode | null =>
				span.kind_string ? (
					<Badge color="vanilla">{span.kind_string}</Badge>
				) : null,
		},
		{
			key: 'statusMessage',
			label: t('trace_lbl_status_message', { defaultValue: 'STATUS MESSAGE' }),
			render: (span): ReactNode | null =>
				span.status_message ? (
					<ExpandableValue
						value={span.status_message}
						title={t('trace_status_message_title', {
							defaultValue: 'Status message',
						})}
					>
						<Badge
							color="vanilla"
							textEllipsis="end"
							className={styles.statusMessageBadge}
						>
							{span.status_message}
						</Badge>
					</ExpandableValue>
				) : null,
		},
	];
}
