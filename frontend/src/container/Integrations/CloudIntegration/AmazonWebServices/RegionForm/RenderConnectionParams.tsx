import { useTranslation } from 'react-i18next';
import { Input } from '@signozhq/ui/input';
import { Form } from 'antd';
import { CloudintegrationtypesCredentialsDTO } from 'api/generated/services/sigNoz.schemas';

function RenderConnectionFields({
	isConnectionParamsLoading,
	connectionParams,
	isFormDisabled,
}: {
	isConnectionParamsLoading?: boolean;
	connectionParams?: CloudintegrationtypesCredentialsDTO | null;
	isFormDisabled?: boolean;
}): JSX.Element | null {
	const { t } = useTranslation('pages');
	if (
		isConnectionParamsLoading ||
		(!!connectionParams?.ingestionUrl &&
			!!connectionParams?.ingestionKey &&
			!!connectionParams?.sigNozApiUrl &&
			!!connectionParams?.sigNozApiKey)
	) {
		return null;
	}

	return (
		<Form.Item name="connectionParams">
			{!connectionParams?.ingestionUrl && (
				<Form.Item
					name="ingestionUrl"
					label={t('intg_ingestion_url', { defaultValue: 'Ingestion URL' })}
					rules={[
						{
							required: true,
							message: t('intg_ingestion_url_required', {
								defaultValue: 'Please enter ingestion URL',
							}),
						},
					]}
				>
					<Input
						placeholder={t('intg_ingestion_url_placeholder', {
							defaultValue: 'Enter ingestion URL',
						})}
						disabled={isFormDisabled}
					/>
				</Form.Item>
			)}
			{!connectionParams?.ingestionKey && (
				<Form.Item
					name="ingestionKey"
					label={t('intg_ingestion_key', { defaultValue: 'Ingestion Key' })}
					rules={[
						{
							required: true,
							message: t('intg_ingestion_key_required', {
								defaultValue: 'Please enter ingestion key',
							}),
						},
					]}
				>
					<Input
						placeholder={t('intg_ingestion_key_placeholder', {
							defaultValue: 'Enter ingestion key',
						})}
						disabled={isFormDisabled}
					/>
				</Form.Item>
			)}
			{!connectionParams?.sigNozApiUrl && (
				<Form.Item
					name="sigNozApiUrl"
					label={t('intg_api_url', { defaultValue: 'SigNoz API URL' })}
					rules={[
						{
							required: true,
							message: t('intg_api_url_required', {
								defaultValue: 'Please enter SigNoz API URL',
							}),
						},
					]}
				>
					<Input
						placeholder={t('intg_api_url_placeholder', {
							defaultValue: 'Enter SigNoz API URL',
						})}
						disabled={isFormDisabled}
					/>
				</Form.Item>
			)}
			{!connectionParams?.sigNozApiKey && (
				<Form.Item
					name="sigNozApiKey"
					label={t('intg_api_key', { defaultValue: 'SigNoz API KEY' })}
					rules={[
						{
							required: true,
							message: t('intg_api_key_required', {
								defaultValue: 'Please enter SigNoz API Key',
							}),
						},
					]}
				>
					<Input
						placeholder={t('intg_api_key_placeholder', {
							defaultValue: 'Enter SigNoz API Key',
						})}
						disabled={isFormDisabled}
					/>
				</Form.Item>
			)}
		</Form.Item>
	);
}

RenderConnectionFields.defaultProps = {
	connectionParams: null,
	isFormDisabled: false,
	isConnectionParamsLoading: false,
};

export default RenderConnectionFields;
