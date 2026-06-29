import { Search } from '@signozhq/icons';
import { Button, Card, Input, Space } from 'antd';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import type { TFunction } from 'i18next';

import { getSearchPlaceholder } from '../Columns/ColumnContants';

type FilterDropdownPropsWithT = FilterDropdownProps & { t: TFunction };

export const filterDropdown = ({
	setSelectedKeys,
	selectedKeys,
	confirm,
	t,
}: FilterDropdownPropsWithT): JSX.Element => {
	const handleSearch = (): void => {
		confirm();
	};

	const selectedKeysHandler = (e: React.ChangeEvent<HTMLInputElement>): void => {
		setSelectedKeys(e.target.value ? [e.target.value] : []);
	};

	const searchText: string = t('pages:svc_search', { defaultValue: 'Search' });

	return (
		<Card size="small">
			<Space align="start" direction="vertical">
				<Input
					placeholder={getSearchPlaceholder(t)}
					value={selectedKeys[0]}
					onChange={selectedKeysHandler}
					allowClear
					onPressEnter={handleSearch}
				/>
				<Button
					type="primary"
					onClick={handleSearch}
					icon={<Search size="md" />}
					size="small"
				>
					{searchText}
				</Button>
			</Space>
		</Card>
	);
};
