import { Button, Card, Input, Space } from 'antd';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import type { TFunction } from 'i18next';

import { getSearchPlaceholder } from '../Columns/ColumnContants';
import { Search } from '@signozhq/icons';

// `t` es opcional para mantener compatibilidad con consumidores que aún no
// inyectan la función de traducción (p. ej. TopOperationsTable). Sin `t` se
// usan los textos en inglés por defecto.
type FilterDropdownPropsWithT = FilterDropdownProps & { t?: TFunction };

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

	const searchText: string = t
		? t('pages:svc_search', { defaultValue: 'Search' })
		: 'Search';
	const placeholderText: string = t ? getSearchPlaceholder(t) : 'Search by service';

	return (
		<Card size="small">
			<Space align="start" direction="vertical">
				<Input
					placeholder={placeholderText}
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
