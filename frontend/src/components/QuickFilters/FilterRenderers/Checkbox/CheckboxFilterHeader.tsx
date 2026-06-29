import { useTranslation } from 'react-i18next';
import { Typography } from '@signozhq/ui/typography';
import { ChevronDown, ChevronRight } from '@signozhq/icons';

interface CheckboxFilterHeaderProps {
	title: string;
	isOpen: boolean;
	showClearAll: boolean;
	onToggleOpen: () => void;
	onClear: () => void;
}

function CheckboxFilterHeader({
	title,
	isOpen,
	showClearAll,
	onToggleOpen,
	onClear,
}: CheckboxFilterHeaderProps): JSX.Element {
	const { t } = useTranslation('pages');
	return (
		<section className="filter-header-checkbox" onClick={onToggleOpen}>
			<section className="left-action">
				{isOpen ? (
					<ChevronDown size={13} cursor="pointer" />
				) : (
					<ChevronRight size={13} cursor="pointer" />
				)}
				<Typography.Text className="title">{title}</Typography.Text>
			</section>
			<section className="right-action">
				{isOpen && showClearAll && (
					<Typography.Text
						className="clear-all"
						onClick={(e): void => {
							e.stopPropagation();
							e.preventDefault();
							onClear();
						}}
					>
						{t('qf_clear_all', { defaultValue: 'Clear All' })}
					</Typography.Text>
				)}
			</section>
		</section>
	);
}

export default CheckboxFilterHeader;
