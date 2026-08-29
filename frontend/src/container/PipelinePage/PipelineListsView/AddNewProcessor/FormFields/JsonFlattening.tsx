import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Info } from '@signozhq/icons';
import { Input } from '@signozhq/ui/input';
import { Switch } from '@signozhq/ui/switch';
import { Flex, Form, Space, Tooltip } from 'antd';
import { ProcessorData } from 'types/api/pipeline/def';

import { PREDEFINED_MAPPING } from '../config';
import KeyValueList from './KeyValueList';

import './JsonFlattening.styles.scss';

interface JsonFlatteningProps {
	selectedProcessorData?: ProcessorData;
	isAdd: boolean;
}

function JsonFlattening({
	selectedProcessorData,
	isAdd,
}: JsonFlatteningProps): JSX.Element | null {
	const { t } = useTranslation('pages');
	const form = Form.useFormInstance();
	const mappingValue = selectedProcessorData?.mapping || {};
	const enableFlattening = Form.useWatch('enable_flattening', form);
	const enablePaths = Form.useWatch('enable_paths', form);

	const [enableMapping, setEnableMapping] = useState(
		!!mappingValue && Object.keys(mappingValue).length > 0,
	);

	const selectedMapping = selectedProcessorData?.mapping;
	useEffect(() => {
		if (!enableMapping) {
			form.setFieldsValue({ mapping: undefined });
		} else if (form.getFieldValue('mapping') === undefined) {
			form.setFieldsValue({
				mapping: selectedMapping || PREDEFINED_MAPPING,
			});
		}
	}, [enableMapping, form, selectedMapping]);

	const handleEnableMappingChange = (checked: boolean): void => {
		setEnableMapping(checked);
	};

	const handleEnablePathsChange = (checked: boolean): void => {
		form.setFieldValue('enable_paths', checked);
	};

	if (!enableFlattening) {
		return null;
	}

	return (
		<div className="json-flattening-form">
			<Form.Item
				className="json-flattening-form__item"
				name="enable_paths"
				valuePropName="checked"
				initialValue={isAdd ? true : selectedProcessorData?.enable_paths}
			>
				<Space>
					<Switch value={enablePaths} onChange={handleEnablePathsChange} />
					{t('cfg_enable_paths', { defaultValue: "Enable Paths" })}
				</Space>
			</Form.Item>

			{enablePaths && (
				<Form.Item
					name="path_prefix"
					label={t('cfg_path_prefix', { defaultValue: "Path Prefix" })}
					initialValue={selectedProcessorData?.path_prefix}
				>
					<Input placeholder={t('cfg_path_prefix', { defaultValue: "Path Prefix" })} />
				</Form.Item>
			)}

			<Form.Item className="json-flattening-form__item">
				<Space>
					<Switch value={enableMapping} onChange={handleEnableMappingChange} />
					<Flex gap="8px" align="center">
						{t('cfg_enable_mapping', { defaultValue: "Enable Mapping" })}
						<Tooltip title={t('cfg_the_order_of_filled', { defaultValue: "The order of filled keys will determine the priority of keys i.e. earlier keys have higher precedence" })}>
							<Info size="md" />
						</Tooltip>
					</Flex>
				</Space>
			</Form.Item>

			{enableMapping && (
				<Form.Item
					name="mapping"
					initialValue={selectedProcessorData?.mapping || PREDEFINED_MAPPING}
				>
					<KeyValueList />
				</Form.Item>
			)}
		</div>
	);
}

JsonFlattening.defaultProps = {
	selectedProcessorData: undefined,
};

export default JsonFlattening;
