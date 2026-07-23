import { useTranslation } from 'react-i18next';
import { EQueryType } from 'types/common/dashboard';

function QueryTypeTag({ queryType }: IQueryTypeTagProps): JSX.Element {
	const { t } = useTranslation('pages');
	switch (queryType) {
		case EQueryType.QUERY_BUILDER:
			return <span>{t('qb_query_builder', { defaultValue: "Query Builder" })}</span>;

		case EQueryType.CLICKHOUSE:
			return <span>{t('qb_clickhouse_query', { defaultValue: "ClickHouse Query" })}</span>;
		case EQueryType.PROM:
			return <span>{t('qb_promql', { defaultValue: "PromQL" })}</span>;
		default:
			return <span />;
	}
}

interface IQueryTypeTagProps {
	queryType?: EQueryType;
}

QueryTypeTag.defaultProps = {
	queryType: EQueryType.QUERY_BUILDER,
};

export default QueryTypeTag;
