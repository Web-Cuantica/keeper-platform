import { useTranslation } from 'react-i18next';
import { InputNumber, Row, Space } from 'antd';
import { Typography } from '@signozhq/ui/typography';

interface PopoverContentProps {
	linesPerRow: number;
	handleLinesPerRowChange: (l: unknown) => void;
}

function PopoverContent({
	linesPerRow,
	handleLinesPerRowChange,
}: PopoverContentProps): JSX.Element {
	const { t } = useTranslation('pages');

	return (
		<Row align="middle">
			<Space align="center">
				<Typography>
					{t('logstabs_max_lines_per_row', { defaultValue: 'Max lines per Row' })}{' '}
				</Typography>
				<InputNumber
					min={1}
					max={10}
					value={linesPerRow}
					onChange={handleLinesPerRowChange}
				/>
			</Space>
		</Row>
	);
}

export default PopoverContent;
