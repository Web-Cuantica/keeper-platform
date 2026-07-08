import { Link } from 'react-router-dom';
import type { TableColumnsType as ColumnsType } from 'antd';
import { Badge } from '@signozhq/ui/badge';
import { Typography } from '@signozhq/ui/typography';
import { TelemetryFieldKey } from 'api/v5/v5';
import { DATE_TIME_FORMATS } from 'constants/dateTimeFormats';
import ROUTES from 'constants/routes';
import { buildCompositeKey } from 'container/OptionsMenu/utils';
import { getMs } from 'container/Trace/Filters/Panel/PanelBody/Duration/util';
import { formUrlParams } from 'container/TraceDetail/utils';
import { TimestampInput } from 'hooks/useTimezoneFormatter/useTimezoneFormatter';
import { RowData } from 'lib/query/createTableColumnsFromQuery';
import LineClampedText from 'periscope/components/LineClampedText/LineClampedText';
import { ILog } from 'types/api/logs/log';
import { QueryDataV3 } from 'types/api/widgets/getQuery';

export function BlockLink({
	children,
	to,
	openInNewTab,
}: {
	children: React.ReactNode;
	to: string;
	openInNewTab: boolean;
}): any {
	// Display block to make the whole cell clickable
	return (
		<Link
			to={to}
			style={{ display: 'block' }}
			target={openInNewTab ? '_blank' : '_self'}
		>
			{children}
		</Link>
	);
}

export const transformDataWithDate = (
	data: QueryDataV3[],
): Omit<ILog, 'timestamp'>[] =>
	data[0]?.list?.map(({ data, timestamp }) => ({ ...data, date: timestamp })) ||
	[];

export const getTraceLink = (record: RowData): string =>
	`${ROUTES.TRACE}/${record.traceID || record.trace_id}${formUrlParams({
		spanId: record.spanID || record.span_id,
		levelUp: 0,
		levelDown: 0,
	})}`;

// Direcciones permitidas al ordenar desde el header: alterna DESC ↔ ASC (sin estado "sin orden").
const SORT_DIRECTIONS: ('descend' | 'ascend')[] = ['descend', 'ascend'];

// Traduce el orderBy actual ("campo:asc|desc") al sortOrder de antd para ESTA columna
// (para pintar la flecha en el header correcto). El orden real lo hace el backend.
function sortOrderFor(
	field: string,
	orderBy?: string,
): 'ascend' | 'descend' | null {
	if (!orderBy) {
		return null;
	}
	const [col, dir] = orderBy.split(':');
	if (col !== field) {
		return null;
	}
	return dir === 'asc' ? 'ascend' : 'descend';
}

export const getListColumns = (
	selectedColumns: TelemetryFieldKey[],
	formatTimezoneAdjustedTimestamp: (
		input: TimestampInput,
		format?: string,
	) => string | number,
	orderBy?: string,
): ColumnsType<RowData> => {
	const initialColumns: ColumnsType<RowData> = [
		{
			dataIndex: 'date',
			key: 'date',
			title: 'Timestamp',
			width: 145,
			// Orden server-side: () => 0 mantiene el orden del backend (no reordena en cliente).
			sorter: (): number => 0,
			sortOrder: sortOrderFor('timestamp', orderBy),
			sortDirections: SORT_DIRECTIONS,
			render: (value, item): JSX.Element => {
				const date =
					typeof value === 'string'
						? formatTimezoneAdjustedTimestamp(
								value,
								DATE_TIME_FORMATS.ISO_DATETIME_MS,
							)
						: formatTimezoneAdjustedTimestamp(
								value / 1e6,
								DATE_TIME_FORMATS.ISO_DATETIME_MS,
							);
				return (
					<BlockLink to={getTraceLink(item)} openInNewTab={false}>
						<Typography.Text>{date}</Typography.Text>
					</BlockLink>
				);
			},
		},
	];

	const columns: ColumnsType<RowData> =
		selectedColumns.map((props) => {
			const name = props?.name || (props as any)?.key;
			const fieldContext = props?.fieldContext || (props as any)?.type;
			return {
				title: name,
				dataIndex: name,
				key: buildCompositeKey(name, fieldContext),
				// Orden server-side por este campo (mismo columnName que usa el dropdown Order by).
				sorter: (): number => 0,
				sortOrder: sortOrderFor(name, orderBy),
				sortDirections: SORT_DIRECTIONS,
				width: 145,
				render: (value, item): JSX.Element => {
					if (value === '') {
						return (
							<BlockLink to={getTraceLink(item)} openInNewTab={false}>
								<Typography data-testid={name}>N/A</Typography>
							</BlockLink>
						);
					}

					if (
						name === 'httpMethod' ||
						name === 'responseStatusCode' ||
						name === 'response_status_code' ||
						name === 'http_method'
					) {
						return (
							<BlockLink to={getTraceLink(item)} openInNewTab={false}>
								<Badge data-testid={name} color="sakura" variant="outline">
									{value}
								</Badge>
							</BlockLink>
						);
					}

					if (name === 'durationNano' || name === 'duration_nano') {
						return (
							<BlockLink to={getTraceLink(item)} openInNewTab={false}>
								<Typography data-testid={name}>{getMs(value)}ms</Typography>
							</BlockLink>
						);
					}

					return (
						<BlockLink to={getTraceLink(item)} openInNewTab={false}>
							<Typography data-testid={name}>
								<LineClampedText text={value} lines={3} />
							</Typography>
						</BlockLink>
					);
				},
				responsive: ['md'],
			};
		}) || [];

	return [...initialColumns, ...columns];
};
