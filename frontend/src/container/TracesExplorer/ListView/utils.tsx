import { Link } from 'react-router-dom';
import { Button, Dropdown } from 'antd';
import type { MenuProps, TableColumnsType as ColumnsType } from 'antd';
import {
	ArrowDownToDot,
	ArrowUpFromDot,
	Copy,
	Ellipsis,
	RefreshCw,
} from '@signozhq/icons';
import { useCopyToClipboard } from 'react-use';
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

// Encabezados legibles para las columnas conocidas del explorador de trazas.
const COLUMN_LABELS: Record<string, string> = {
	duration_nano: 'Duración',
	durationNano: 'Duración',
	'service.name': 'Servicio',
	serviceName: 'Servicio',
	http_method: 'Método',
	httpMethod: 'Método',
	response_status_code: 'Código',
	responseStatusCode: 'Código',
	name: 'Operación',
};

// Formatea una duración en ms de forma legible:
//   <1s → "185.4ms"; ≥1s → "2s 200ms"; ≥1min → "1m 5s".
function formatDurationMs(ms: number): string {
	if (!Number.isFinite(ms) || ms < 0) {
		return `${ms}ms`;
	}
	if (ms < 1000) {
		return `${Number(ms.toFixed(2))}ms`;
	}
	const total = Math.round(ms);
	const minutes = Math.floor(total / 60000);
	const seconds = Math.floor((total % 60000) / 1000);
	const millis = total % 1000;
	if (minutes > 0) {
		return `${minutes}m ${seconds}s`;
	}
	return `${seconds}s ${millis}ms`;
}

// Acción del menú kebab de la celda: filtrar (=), excluir (!=) o reemplazar todo el filtro.
export type CellFilterAction = 'filter' | 'exclude' | 'replace';

// Handler que aplica la acción al query del explorer (lo implementa el ListView con
// currentQuery + redirectWithQueryBuilderData; ver applyFilter del detalle de logs).
export type CellFilterFn = (
	fieldKey: string,
	value: unknown,
	action: CellFilterAction,
) => void;

// Columnas donde tiene sentido filtrar por valor exacto (NO duración ni timestamp,
// que son rangos). Se aceptan los nombres snake_case (V5) y camelCase (V4).
const FILTERABLE_COLUMNS = new Set<string>([
	'service.name',
	'serviceName',
	'name',
	'http_method',
	'httpMethod',
	'response_status_code',
	'responseStatusCode',
]);

// Menú kebab por celda (estilo DataDog): copiar / filtrar / excluir / reemplazar, para
// no tener que escribir a mano `service.name = '...'`. Reusa el mecanismo probado del
// detalle de logs. Se monta como hermano del enlace de la celda (no dentro) para que el
// clic en el kebab no navegue a la traza.
function CellActions({
	fieldKey,
	value,
	onFilter,
}: {
	fieldKey: string;
	value: unknown;
	onFilter: CellFilterFn;
}): JSX.Element {
	const [, setCopy] = useCopyToClipboard();

	const items: MenuProps['items'] = [
		{ key: 'copy', icon: <Copy size={14} />, label: 'Copiar valor' },
		{ type: 'divider' },
		{
			key: 'filter',
			icon: <ArrowDownToDot size={14} style={{ transform: 'rotate(90deg)' }} />,
			label: `Filtrar por ${fieldKey}`,
		},
		{
			key: 'exclude',
			icon: <ArrowUpFromDot size={14} style={{ transform: 'rotate(90deg)' }} />,
			label: `Excluir ${fieldKey}`,
		},
		{
			key: 'replace',
			icon: <RefreshCw size={14} />,
			label: 'Reemplazar filtro con este valor',
		},
	];

	// onClick a nivel de menú (el onClick por-item del Dropdown de antd no siempre dispara).
	const onClick: NonNullable<MenuProps['onClick']> = ({ key, domEvent }): void => {
		domEvent.stopPropagation();
		if (key === 'copy') {
			setCopy(String(value ?? ''));
			return;
		}
		onFilter(fieldKey, value, key as CellFilterAction);
	};

	return (
		<Dropdown
			menu={{ items, onClick }}
			trigger={['click']}
			placement="bottomRight"
		>
			<Button
				type="text"
				size="small"
				className="trace-cell-kebab"
				icon={<Ellipsis size={14} />}
				onClick={(e): void => {
					// Evita navegar a la traza (la celda es un enlace) al abrir el menú.
					e.preventDefault();
					e.stopPropagation();
				}}
			/>
		</Dropdown>
	);
}

export const getListColumns = (
	selectedColumns: TelemetryFieldKey[],
	formatTimezoneAdjustedTimestamp: (
		input: TimestampInput,
		format?: string,
	) => string | number,
	orderBy?: string,
	onFilter?: CellFilterFn,
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
				title: COLUMN_LABELS[name] ?? name,
				dataIndex: name,
				key: buildCompositeKey(name, fieldContext),
				// Orden server-side por este campo (mismo columnName que usa el dropdown Order by).
				sorter: (): number => 0,
				sortOrder: sortOrderFor(name, orderBy),
				sortDirections: SORT_DIRECTIONS,
				width: 145,
				render: (value, item): JSX.Element => {
					const traceLink = getTraceLink(item);

					let content: JSX.Element;
					if (value === '') {
						content = (
							<BlockLink to={traceLink} openInNewTab={false}>
								<Typography data-testid={name}>N/A</Typography>
							</BlockLink>
						);
					} else if (
						name === 'httpMethod' ||
						name === 'responseStatusCode' ||
						name === 'response_status_code' ||
						name === 'http_method'
					) {
						content = (
							<BlockLink to={traceLink} openInNewTab={false}>
								<Badge data-testid={name} color="sakura" variant="outline">
									{value}
								</Badge>
							</BlockLink>
						);
					} else if (name === 'durationNano' || name === 'duration_nano') {
						content = (
							<BlockLink to={traceLink} openInNewTab={false}>
								<Typography data-testid={name}>
									{formatDurationMs(Number(getMs(value)))}
								</Typography>
							</BlockLink>
						);
					} else {
						content = (
							<BlockLink to={traceLink} openInNewTab={false}>
								<Typography data-testid={name}>
									<LineClampedText text={value} lines={3} />
								</Typography>
							</BlockLink>
						);
					}

					// Kebab de filtro solo en columnas filtrables con valor no vacio.
					if (!onFilter || value === '' || !FILTERABLE_COLUMNS.has(name)) {
						return content;
					}
					return (
						<div className="trace-list-cell">
							{content}
							<CellActions fieldKey={name} value={value} onFilter={onFilter} />
						</div>
					);
				},
				responsive: ['md'],
			};
		}) || [];

	return [...initialColumns, ...columns];
};
