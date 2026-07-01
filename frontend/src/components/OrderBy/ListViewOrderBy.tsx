import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { Select, Spin } from 'antd';
import { getKeySuggestions } from 'api/querySuggestions/getKeySuggestions';
import { QueryKeyDataSuggestionsProps } from 'types/api/querySuggestions/types';
import { DataSource } from 'types/common/queryBuilder';

import './ListViewOrderBy.styles.scss';

interface ListViewOrderByProps {
	value: string;
	onChange: (value: string) => void;
	dataSource: DataSource;
}

// Componente Loader para el dropdown al cargar o cuando no hay resultados
function Loader({ isLoading }: { isLoading: boolean }): JSX.Element {
	const { t } = useTranslation('pages');
	return (
		<div className="order-by-loading-container">
			{isLoading ? (
				<Spin size="default" />
			) : (
				t('cmp_order_by_no_results', { defaultValue: 'No results found' })
			)}
		</div>
	);
}

function ListViewOrderBy({
	value,
	onChange,
	dataSource,
}: ListViewOrderByProps): JSX.Element {
	const { t } = useTranslation('pages');
	const [searchInput, setSearchInput] = useState('');
	const [debouncedInput, setDebouncedInput] = useState('');
	const [selectOptions, setSelectOptions] = useState<
		{ label: string; value: string }[]
	>([]);
	const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Fetch key suggestions based on debounced input
	const { data, isLoading } = useQuery({
		queryKey: ['orderByKeySuggestions', dataSource, debouncedInput],
		queryFn: async () => {
			const response = await getKeySuggestions({
				signal: dataSource,
				searchText: debouncedInput,
			});
			return response.data;
		},
	});

	useEffect(
		() => (): void => {
			if (debounceTimer.current) {
				clearTimeout(debounceTimer.current);
			}
		},
		[],
	);

	// Update options when API data changes
	useEffect(() => {
		const rawKeys: QueryKeyDataSuggestionsProps[] = data?.data?.keys
			? Object.values(data.data?.keys).flat()
			: [];

		const keyNames = rawKeys.map((key) => key.name);
		const uniqueKeys = [
			...new Set(searchInput ? keyNames : ['timestamp', ...keyNames]),
		];

		const updatedOptions = uniqueKeys.flatMap((key) => [
			{ label: `${key} (desc)`, value: `${key}:desc` },
			{ label: `${key} (asc)`, value: `${key}:asc` },
		]);

		setSelectOptions(updatedOptions);
	}, [data, searchInput]);

	// Handle search input with debounce
	const handleSearch = (input: string): void => {
		setSearchInput(input);

		// Filter current options for instant client-side match
		const filteredOptions = selectOptions.filter((option) =>
			option.value.toLowerCase().includes(input.trim().toLowerCase()),
		);

		// If no match found or input is empty, trigger debounced fetch
		if (filteredOptions.length === 0 || input === '') {
			if (debounceTimer.current) {
				clearTimeout(debounceTimer.current);
			}

			debounceTimer.current = setTimeout(() => {
				setDebouncedInput(input);
			}, 100);
		}
	};

	return (
		<Select
			showSearch
			value={value}
			onChange={onChange}
			onSearch={handleSearch}
			notFoundContent={<Loader isLoading={isLoading} />}
			placeholder={
				t('cmp_order_by_select_field', { defaultValue: 'Select a field' }) as string
			}
			style={{ width: 200 }}
			options={selectOptions}
			filterOption={(input, option): boolean =>
				(option?.value ?? '').toLowerCase().includes(input.trim().toLowerCase())
			}
		/>
	);
}

export default ListViewOrderBy;
