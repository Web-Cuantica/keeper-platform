import { memo, MouseEventHandler } from 'react';
import { Copy, Expand, Link, TextSelect } from '@signozhq/icons';
import { Button, Tooltip } from 'antd';

import './LogLinesActionButtons.styles.scss';

export interface LogLinesActionButtonsProps {
	handleShowContext: MouseEventHandler<HTMLElement>;
	onLogCopy: MouseEventHandler<HTMLElement>;
	/**
	 * Abre el panel de detalle. Se ofrece también aquí —además de al pulsar el
	 * registro— porque esa forma de abrirlo no se descubre sola: quien no la
	 * conoce no sabe que el detalle existe.
	 */
	onViewDetails?: MouseEventHandler<HTMLElement>;
	/** Copia el log completo como JSON, sin tener que abrir el detalle antes. */
	onCopyJSON?: MouseEventHandler<HTMLElement>;
	customClassName?: string;
}

function LogLinesActionButtons({
	handleShowContext,
	onLogCopy,
	onViewDetails,
	onCopyJSON,
	customClassName = '',
}: LogLinesActionButtonsProps): JSX.Element {
	return (
		<div className={`log-line-action-buttons ${customClassName}`}>
			{onViewDetails && (
				<Tooltip title="Ver detalles">
					<Button
						size="small"
						icon={<Expand size={14} />}
						className="view-details-btn"
						onClick={onViewDetails}
						data-testid="log-view-details-btn"
						aria-label="Ver detalles"
					/>
				</Tooltip>
			)}
			{onCopyJSON && (
				<Tooltip title="Copiar JSON">
					<Button
						size="small"
						icon={<Copy size={14} />}
						className="copy-json-btn"
						onClick={onCopyJSON}
						data-testid="log-copy-json-btn"
						aria-label="Copiar JSON"
					/>
				</Tooltip>
			)}
			<Tooltip title="Ver en contexto">
				<Button
					size="small"
					icon={<TextSelect size={14} />}
					className="show-context-btn"
					onClick={handleShowContext}
					data-testid="log-show-context-btn"
					aria-label="Ver en contexto"
				/>
			</Tooltip>
			<Tooltip title="Copiar enlace">
				<Button
					size="small"
					icon={<Link size={14} />}
					onClick={onLogCopy}
					className="copy-log-btn"
					data-testid="log-copy-link-btn"
					aria-label="Copiar enlace"
				/>
			</Tooltip>
		</div>
	);
}

LogLinesActionButtons.defaultProps = {
	customClassName: '',
	onViewDetails: undefined,
	onCopyJSON: undefined,
};

export default memo(LogLinesActionButtons);
