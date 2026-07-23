import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { Button, Flex, Form, Input, Modal, Select } from 'antd';
import { Typography } from '@signozhq/ui/typography';
import ROUTES from 'constants/routes';
import { ModalTitle } from 'container/PipelinePage/PipelineListsView/styles';
import { Check, Loader, X } from '@signozhq/icons';
import { useAppContext } from 'providers/App/App';
import { USER_ROLES } from 'types/roles';
import { openInNewTab } from 'utils/navigation';

import { INITIAL_ROUTING_POLICY_DETAILS_FORM_STATE } from './constants';
import {
	RoutingPolicyDetailsFormState,
	RoutingPolicyDetailsProps,
} from './types';

function RoutingPolicyDetails({
	closeModal,
	mode,
	channels,
	isErrorChannels,
	isLoadingChannels,
	routingPolicy,
	handlePolicyDetailsModalAction,
	isPolicyDetailsModalActionLoading,
	refreshChannels,
}: RoutingPolicyDetailsProps): JSX.Element {
	const { t } = useTranslation('pages');
	const [form] = Form.useForm();
	const { user } = useAppContext();

	const initialFormState = useMemo(() => {
		if (mode === 'edit') {
			return {
				name: routingPolicy?.name || '',
				expression: routingPolicy?.expression || '',
				channels: routingPolicy?.channels || [],
				description: routingPolicy?.description || '',
			};
		}
		return INITIAL_ROUTING_POLICY_DETAILS_FORM_STATE;
	}, [routingPolicy, mode]);

	const saveButtonIcon = isPolicyDetailsModalActionLoading ? (
		<Loader size={16} />
	) : (
		<Check size={16} />
	);

	const modalTitle =
		mode === 'edit' ? 'Edit routing policy' : 'Create routing policy';

	const handleSave = (): void => {
		handlePolicyDetailsModalAction(mode, {
			name: form.getFieldValue('name'),
			expression: form.getFieldValue('expression'),
			channels: form.getFieldValue('channels'),
			description: form.getFieldValue('description'),
		});
	};

	const notificationChannelsNotFoundContent = (
		<Flex justify="space-between">
			<Flex gap={4} align="center">
				<Typography.Text>{t('cfg_no_channels_yet', { defaultValue: "No channels yet." })}</Typography.Text>
				{user?.role === USER_ROLES.ADMIN ? (
					<Typography.Text>
						{t('cfg_create_one', { defaultValue: "Create one" })}
						<Button
							style={{ padding: '0 4px' }}
							type="link"
							onClick={(): void => {
								openInNewTab(ROUTES.CHANNELS_NEW);
							}}
						>
							here.
						</Button>
					</Typography.Text>
				) : (
					<Typography.Text>{t('cfg_please_ask_your_admin', { defaultValue: "Please ask your admin to create one." })}</Typography.Text>
				)}
			</Flex>
			<Button type="text" onClick={refreshChannels}>
				{t('cfg_refresh', { defaultValue: "Refresh" })}
			</Button>
		</Flex>
	);

	return (
		<Modal
			title={<ModalTitle level={4}>{modalTitle}</ModalTitle>}
			centered
			open
			className="create-policy-modal"
			width={600}
			onCancel={closeModal}
			footer={null}
			maskClosable={false}
		>
			<Form<RoutingPolicyDetailsFormState>
				form={form}
				initialValues={initialFormState}
				onFinish={handleSave}
			>
				<div className="create-policy-container">
					<div className="input-group">
						<Typography.Text>{t('cfg_routing_policy_name', { defaultValue: "Routing Policy Name" })}</Typography.Text>
						<Form.Item
							name="name"
							rules={[
								{
									required: true,
									message: 'Please provide a name for the routing policy',
								},
							]}
						>
							<Input placeholder={t('cfg_eg_base_routing_policy', { defaultValue: "e.g. Base routing policy..." })} />
						</Form.Item>
					</div>
					<div className="input-group">
						<Typography.Text>{t('cfg_description', { defaultValue: "Description" })}</Typography.Text>
						<Form.Item
							name="description"
							rules={[
								{
									required: false,
								},
							]}
						>
							<Input.TextArea
								placeholder={t('cfg_eg_this_is_a', { defaultValue: "e.g. This is a routing policy that..." })}
								autoSize={{ minRows: 1, maxRows: 6 }}
								style={{ resize: 'none' }}
							/>
						</Form.Item>
					</div>
					<div className="input-group">
						<Typography.Text>{t('cfg_expression', { defaultValue: "Expression" })}</Typography.Text>
						<Form.Item
							name="expression"
							rules={[
								{
									required: true,
									message: 'Please provide an expression for the routing policy',
								},
							]}
						>
							<Input.TextArea
								placeholder='e.g. service.name == "payment" && threshold.name == "critical"'
								autoSize={{ minRows: 1, maxRows: 6 }}
								style={{ resize: 'none' }}
							/>
						</Form.Item>
					</div>
					<div className="input-group">
						<Typography.Text>{t('cfg_notification_channels', { defaultValue: "Notification Channels" })}</Typography.Text>
						<Form.Item
							name="channels"
							rules={[
								{
									required: true,
									message: 'Please select at least one notification channel',
								},
							]}
						>
							<Select
								options={channels.map((channel) => ({
									value: channel.name,
									label: channel.name,
								}))}
								mode="multiple"
								placeholder={t('cfg_select_notification_channels', { defaultValue: "Select notification channels" })}
								showSearch
								maxTagCount={3}
								maxTagPlaceholder={(omittedValues): string =>
									`+${omittedValues.length} more`
								}
								maxTagTextLength={10}
								filterOption={(input, option): boolean =>
									option?.label?.toLowerCase().includes(input.toLowerCase()) || false
								}
								status={isErrorChannels ? 'error' : undefined}
								disabled={isLoadingChannels}
								notFoundContent={notificationChannelsNotFoundContent}
							/>
						</Form.Item>
					</div>
				</div>
				<Flex className="create-policy-footer" justify="space-between">
					<Button
						icon={<X size={16} />}
						onClick={closeModal}
						disabled={isPolicyDetailsModalActionLoading}
					>
						{t('cfg_cancel', { defaultValue: "Cancel" })}
					</Button>
					<Button
						icon={saveButtonIcon}
						type="primary"
						htmlType="submit"
						loading={isPolicyDetailsModalActionLoading}
						disabled={isPolicyDetailsModalActionLoading}
					>
						{t('cfg_save_routing_policy', { defaultValue: "Save Routing Policy" })}
					</Button>
				</Flex>
			</Form>
		</Modal>
	);
}

export default RoutingPolicyDetails;
