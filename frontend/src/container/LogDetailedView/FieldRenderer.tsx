import { TooltipSimple } from '@signozhq/ui/tooltip';
import { Typography } from '@signozhq/ui/typography';

import { FieldRendererProps } from './LogDetailedView.types';
import { getFieldAttributes } from './utils';

import './FieldRenderer.styles.scss';

const TOOLTIP_CONTENT_PROPS = {
	className: 'field-renderer-tooltip-content',
};

// Solo el nombre del campo. Los badges "type/data type" se omiten a propósito:
// el tipo se infiere del valor y solo agregaban ruido y altura (estilo DataDog).
function FieldRenderer({ field }: FieldRendererProps): JSX.Element {
	const { dataType, newField, logType } = getFieldAttributes(field);

	return (
		<span className="field-renderer-container">
			{dataType && newField && logType ? (
				<TooltipSimple
					title={newField}
					side="left"
					tooltipContentProps={TOOLTIP_CONTENT_PROPS}
					arrow
				>
					<Typography.Text truncate={1} className="label">
						{newField}
					</Typography.Text>
				</TooltipSimple>
			) : (
				<span className="label">{field}</span>
			)}
		</span>
	);
}

export default FieldRenderer;
