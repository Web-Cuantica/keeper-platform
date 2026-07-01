import { useTranslation } from 'react-i18next';
import { Tooltip } from 'antd';
import { Badge } from '@signozhq/ui/badge';
import cx from 'classnames';
import { Pin, PinOff } from '@signozhq/icons';

import { SidebarItem } from '../sideNav.types';

import './NavItem.styles.scss';

export default function NavItem({
	item,
	isActive,
	onClick,
	isDisabled,
	onTogglePin,
	isPinned,
	showIcon,
	dataTestId,
}: {
	item: SidebarItem;
	isActive: boolean;
	onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
	isDisabled: boolean;
	onTogglePin?: (item: SidebarItem) => void;
	isPinned?: boolean;
	showIcon?: boolean;
	dataTestId?: string;
}): JSX.Element {
	const { label, icon, isBeta, isNew, isEarlyAccess, tooltip } = item;
	// Traducimos el label por su itemKey (namespace 'sidenav'); si no hay clave
	// o el label es un nodo JSX, se conserva el original como respaldo.
	const { t } = useTranslation('sidenav');
	const displayLabel =
		item.itemKey && typeof label === 'string'
			? t(item.itemKey, { defaultValue: label })
			: label;

	const handleTogglePinClick = (
		event: React.MouseEvent<SVGSVGElement, MouseEvent>,
	): void => {
		event.stopPropagation();
		onTogglePin?.(item);
	};

	const navItem = (
		<div
			className={cx(
				'nav-item',
				isActive ? 'active' : '',
				isDisabled ? 'disabled' : '',
			)}
			onClick={(event): void => {
				if (isDisabled) {
					return;
				}
				onClick(event);
			}}
			data-testid={dataTestId}
		>
			{showIcon && <div className="nav-item-active-marker" />}
			<div className={cx('nav-item-data', isBeta ? 'beta-tag' : '')}>
				{showIcon && (
					<div className={cx('nav-item-icon', isEarlyAccess ? 'noz-wave' : '')} data-item-key={item.itemKey}>
						{icon}
					</div>
				)}

				<div className="nav-item-label">{displayLabel}</div>

				{isBeta && (
					<div className="nav-item-beta">
						<Badge color="robin" className="sidenav-beta-tag">
							Beta
						</Badge>
					</div>
				)}

				{isNew && (
					<div className="nav-item-new">
						<Badge color="robin" className="sidenav-new-tag">
							{t('tag_new', { defaultValue: 'New' })}
						</Badge>
					</div>
				)}

				{isEarlyAccess && (
					<div className="nav-item-early-access">
						<Badge color="robin">
							{t('tag_early_access', { defaultValue: 'Early Access' })}
						</Badge>
					</div>
				)}

				{onTogglePin && !isPinned && (
					<Tooltip
						title={t('ui_add_to_shortcuts', { defaultValue: 'Add to shortcuts' })}
						placement="right"
					>
						<Pin
							size={12}
							className="nav-item-pin-icon"
							onClick={handleTogglePinClick}
							color="var(--Vanilla-400, #c0c1c3)"
						/>
					</Tooltip>
				)}

				{onTogglePin && isPinned && (
					<Tooltip
						title={t('ui_remove_from_shortcuts', {
							defaultValue: 'Remove from shortcuts',
						})}
						placement="right"
					>
						<PinOff
							size={12}
							className="nav-item-pin-icon"
							onClick={handleTogglePinClick}
							color="var(--Vanilla-400, #c0c1c3)"
						/>
					</Tooltip>
				)}
			</div>
		</div>
	);

	// Only non-pinnable items set `tooltip`; it would nest with the pin tooltip.
	return tooltip ? (
		<Tooltip title={tooltip} placement="right">
			{navItem}
		</Tooltip>
	) : (
		navItem
	);
}

NavItem.defaultProps = {
	onTogglePin: undefined,
	isPinned: false,
	showIcon: false,
	dataTestId: undefined,
};
