import { useTranslation } from 'react-i18next';
import { Button } from '@signozhq/ui/button';
import { Kbd } from '@signozhq/ui/kbd';
import { DEFAULT_PIN_TOOLTIP_KEY } from 'lib/uPlotV2/plugins/TooltipPlugin/types';

import Styles from './TooltipFooter.module.scss';
import { MousePointerClick, X } from '@signozhq/icons';
import logEvent from 'api/common/logEvent';
import { Events } from 'constants/events';

interface TooltipFooterProps {
	id: string;
	pinKey?: string;
	isPinned: boolean;
	canDrilldown?: boolean;
	dismiss: () => void;
}

export default function TooltipFooter({
	id,
	pinKey = DEFAULT_PIN_TOOLTIP_KEY,
	isPinned,
	canDrilldown = true,
	dismiss,
}: TooltipFooterProps): JSX.Element {
	const { t } = useTranslation('pages');
	const handleUnpinClick = (): void => {
		logEvent(Events.TOOLTIP_UNPINNED, {
			id: id,
		});
		dismiss();
	};
	return (
		<div
			className={Styles.footer}
			role="status"
			data-testid="uplot-tooltip-footer"
		>
			<div>
				{isPinned ? (
					<div className={Styles.hint}>
						<span>{t('qb_press', { defaultValue: "Press" })}</span>
						<Kbd active>{pinKey.toUpperCase()}</Kbd>
						<span>or</span>
						<Kbd active>Esc</Kbd>
						<span>to unpin</span>
					</div>
				) : (
					<div className={Styles.hintList}>
						{canDrilldown && (
							<div className={Styles.hint} data-active="false">
								<Kbd>
									<MousePointerClick size={12} />
								</Kbd>
								<span>{t('qb_click_to_drilldown', { defaultValue: "Click to drilldown" })}</span>
							</div>
						)}
						<div className={Styles.hint} data-active="false">
							<span>{t('qb_press', { defaultValue: "Press" })}</span>
							<Kbd>{pinKey.toUpperCase()}</Kbd>
							<span>to pin the tooltip</span>
						</div>
					</div>
				)}
			</div>

			{isPinned && (
				<Button
					variant="outlined"
					color="secondary"
					size="sm"
					onClick={handleUnpinClick}
					aria-label={t('qb_unpin_tooltip', { defaultValue: "Unpin tooltip" })}
					data-testid="uplot-tooltip-unpin"
				>
					<X size={10} />
					<span>{t('qb_unpin', { defaultValue: "Unpin" })}</span>
				</Button>
			)}
		</div>
	);
}
