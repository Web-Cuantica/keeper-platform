import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { ResizeTable } from 'components/ResizeTable';

import { getColumns } from './Columns/ServiceColumn';
import { Container } from './styles';
import ServiceTableProp from './types';

function Services({ services, isLoading }: ServiceTableProp): JSX.Element {
	const { search } = useLocation();
	const { t } = useTranslation('pages');

	const tableColumns = useMemo(() => getColumns(search, t), [search, t]);

	return (
		<Container>
			<ResizeTable
				columns={tableColumns}
				dataSource={services}
				loading={isLoading}
				rowKey="serviceName"
			/>
		</Container>
	);
}

export default Services;
