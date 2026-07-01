import { useTranslation } from 'react-i18next';
import { Button } from '@signozhq/ui/button';
import { TooltipSimple, TooltipProvider } from '@signozhq/ui/tooltip';
import { Copy } from '@signozhq/icons';
import './CopyIconButton.styles.scss';

interface CopyIconButtonProps {
	ariaLabel: string;
	onCopy: () => void;
	disabled?: boolean;
}

function CopyIconButton({
	ariaLabel,
	onCopy,
	disabled = false,
}: CopyIconButtonProps): JSX.Element {
	const { t } = useTranslation('pages');
	const tooltipTitle = disabled
		? t('intg_mcp_enter_cloud_region_first', {
				defaultValue: 'Enter your Cloud region first',
		  })
		: t('intg_mcp_copy_to_clipboard', { defaultValue: 'Copy to clipboard' });

	return (
		<TooltipProvider>
			<TooltipSimple title={tooltipTitle}>
				<span>
					<Button
						color="secondary"
						variant="ghost"
						size="icon"
						aria-label={ariaLabel}
						disabled={disabled}
						className="mcp-copy-btn"
						prefix={<Copy size={14} />}
						onClick={onCopy}
					/>
				</span>
			</TooltipSimple>
		</TooltipProvider>
	);
}

export default CopyIconButton;
