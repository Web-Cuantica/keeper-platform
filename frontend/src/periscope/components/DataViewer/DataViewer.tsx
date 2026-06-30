import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCopyToClipboard } from 'react-use';
import { ChevronDown, Copy } from '@signozhq/icons';
import { Button } from '@signozhq/ui/button';
import { DropdownMenuSimple as Dropdown } from '@signozhq/ui/dropdown-menu';
import { toast } from '@signozhq/ui/sonner';
import logEvent from 'api/common/logEvent';
import { JsonView } from 'periscope/components/JsonView';
import { PrettyView } from 'periscope/components/PrettyView';
import { PrettyViewProps } from 'periscope/components/PrettyView';

import './DataViewer.styles.scss';

type ViewMode = 'pretty' | 'json';

const VIEW_MODE_CHANGED_EVENT = 'Data Viewer: View mode changed';

const VIEW_MODE_OPTIONS: { label: string; value: ViewMode }[] = [
	{ label: 'Pretty', value: 'pretty' },
	{ label: 'JSON', value: 'json' },
];

export interface DataViewerProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: Record<string, any>;
	drawerKey?: string;
	prettyViewProps?: Omit<PrettyViewProps, 'data' | 'drawerKey'>;
}

function DataViewer({
	data,
	drawerKey = 'default',
	prettyViewProps,
}: DataViewerProps): JSX.Element {
	const { t } = useTranslation('pages');
	const [viewMode, setViewMode] = useState<ViewMode>('pretty');
	const [, setCopy] = useCopyToClipboard();

	// Traduce la etiqueta visible de cada modo por su valor (JSON se deja igual).
	const viewModeLabels: Record<ViewMode, string> = {
		pretty: t('trace_pretty', { defaultValue: 'Pretty' }),
		json: 'JSON',
	};

	const jsonString = useMemo(() => JSON.stringify(data, null, 2), [data]);

	const handleViewModeChange = (value: string): void => {
		const next = value as ViewMode;
		setViewMode(next);
		try {
			logEvent(VIEW_MODE_CHANGED_EVENT, {
				viewMode: next,
				path: window.location.pathname,
				drawerKey,
			});
		} catch {
			// No op
		}
	};

	const handleCopy = (): void => {
		const text = JSON.stringify(data, null, 2);
		setCopy(text);
		toast.success(
			t('trace_copied_to_clipboard', { defaultValue: 'Copied to clipboard' }),
			{
				position: 'top-right',
			},
		);
	};

	const currentLabel = viewModeLabels[viewMode] ?? viewModeLabels.pretty;

	return (
		<div className="data-viewer">
			<div className="data-viewer__toolbar">
				<Dropdown
					align="start"
					className="data-viewer__mode-dropdown"
					menu={{
						items: [
							{
								type: 'radio-group',
								value: viewMode,
								onChange: handleViewModeChange,
								children: VIEW_MODE_OPTIONS.map((opt) => ({
									type: 'radio',
									key: opt.value,
									value: opt.value,
									label: viewModeLabels[opt.value],
								})),
							},
						],
					}}
				>
					<Button
						variant="outlined"
						size="sm"
						color="secondary"
						className="data-viewer__mode-select"
						suffix={<ChevronDown size={12} />}
					>
						{currentLabel}
					</Button>
				</Dropdown>
				<button
					type="button"
					className="data-viewer__copy-btn"
					onClick={handleCopy}
					aria-label={t('trace_copy_json', { defaultValue: 'Copy JSON' })}
				>
					<Copy size={14} />
				</button>
			</div>

			<div className="data-viewer__content">
				{viewMode === 'pretty' && (
					<PrettyView data={data} drawerKey={drawerKey} {...prettyViewProps} />
				)}
				{viewMode === 'json' && <JsonView data={jsonString} />}
			</div>
		</div>
	);
}

export default DataViewer;
