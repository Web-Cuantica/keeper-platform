import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, Tooltip } from 'antd';
import { Typography } from '@signozhq/ui/typography';
import { useQueryBuilder } from 'hooks/queryBuilder/useQueryBuilder';
import { Info } from '@signozhq/icons';

import { ALL_SELECTED_VALUE } from '../constants';
import { useCreateAlertState } from '../context';

function MultipleNotifications(): JSX.Element {
	const { t } = useTranslation('pages');
	const { notificationSettings, setNotificationSettings } =
		useCreateAlertState();
	const { currentQuery } = useQueryBuilder();

	const isAllOptionSelected = useMemo(
		() =>
			notificationSettings.multipleNotifications?.includes(ALL_SELECTED_VALUE),
		[notificationSettings.multipleNotifications],
	);

	const spaceAggregationOptions = useMemo(() => {
		const allGroupBys = currentQuery.builder.queryData?.reduce<string[]>(
			(acc, query) => {
				const groupByKeys = query.groupBy?.map((groupBy) => groupBy.key) || [];
				return [...acc, ...groupByKeys];
			},
			[],
		);
		const uniqueGroupBys = [...new Set(allGroupBys)];
		const options = uniqueGroupBys.map((key) => ({
			label: key,
			value: key,
			disabled: isAllOptionSelected,
			'data-testid': 'multiple-notifications-select-option',
		}));
		if (options.length > 0) {
			return [
				{
					label: t('al_v2_group_by_all', { defaultValue: 'All' }),
					value: ALL_SELECTED_VALUE,
					'data-testid': 'multiple-notifications-select-option',
				},
				...options,
			];
		}
		return options;
	}, [currentQuery.builder.queryData, isAllOptionSelected, t]);

	const isMultipleNotificationsEnabled = spaceAggregationOptions.length > 0;

	const onSelectChange = useCallback(
		(newSelectedOptions: string[]): void => {
			const currentSelectedOptions = notificationSettings.multipleNotifications;
			const allOptionLastSelected =
				!currentSelectedOptions?.includes(ALL_SELECTED_VALUE) &&
				newSelectedOptions.includes(ALL_SELECTED_VALUE);
			if (allOptionLastSelected) {
				setNotificationSettings({
					type: 'SET_MULTIPLE_NOTIFICATIONS',
					payload: [ALL_SELECTED_VALUE],
				});
			} else {
				setNotificationSettings({
					type: 'SET_MULTIPLE_NOTIFICATIONS',
					payload: newSelectedOptions,
				});
			}
		},
		[setNotificationSettings, notificationSettings.multipleNotifications],
	);

	const groupByDescription = useMemo(() => {
		if (isAllOptionSelected) {
			return t('al_v2_group_by_all_disabled', {
				defaultValue: 'All = grouping of alerts is disabled',
			});
		}
		if (notificationSettings.multipleNotifications?.length) {
			return t('al_v2_group_by_same_fields', {
				defaultValue: 'Alerts with same {{fields}} will be grouped',
				fields: notificationSettings.multipleNotifications?.join(', '),
			});
		}
		return t('al_v2_group_by_empty', {
			defaultValue: 'Empty = all matching alerts combined into one notification',
		});
	}, [isAllOptionSelected, notificationSettings.multipleNotifications, t]);

	const multipleNotificationsInput = useMemo(() => {
		const placeholder = isMultipleNotificationsEnabled
			? t('al_v2_select_group_by_fields', {
					defaultValue: 'Select fields to group by (optional)',
			  })
			: t('al_v2_no_grouping_fields', {
					defaultValue: 'No grouping fields available',
			  });
		let input = (
			<div>
				<Select
					options={spaceAggregationOptions}
					onChange={onSelectChange}
					value={notificationSettings.multipleNotifications}
					mode="multiple"
					placeholder={placeholder}
					disabled={!isMultipleNotificationsEnabled}
					aria-disabled={!isMultipleNotificationsEnabled}
					maxTagCount={3}
					data-testid="multiple-notifications-select"
				/>
				{isMultipleNotificationsEnabled && (
					<Typography.Text className="multiple-notifications-select-description">
						{groupByDescription}
					</Typography.Text>
				)}
			</div>
		);
		if (!isMultipleNotificationsEnabled) {
			input = (
				<Tooltip
					title={t('al_v2_add_group_by_tooltip', {
						defaultValue:
							"Add 'Group by' fields to your query to enable alert grouping",
					})}
				>
					{input}
				</Tooltip>
			);
		}
		return input;
	}, [
		groupByDescription,
		isMultipleNotificationsEnabled,
		notificationSettings.multipleNotifications,
		onSelectChange,
		spaceAggregationOptions,
		t,
	]);

	return (
		<div className="multiple-notifications-container">
			<div className="multiple-notifications-header">
				<Typography.Text className="multiple-notifications-header-title">
					{t('al_v2_group_alerts_by', { defaultValue: 'Group alerts by' })}{' '}
					<Tooltip
						title={t('al_v2_group_alerts_by_tooltip', {
							defaultValue:
								'Group similar alerts together to reduce notification volume. Leave empty to combine all matching alerts into one notification without grouping.',
						})}
					>
						<Info size={16} />
					</Tooltip>
				</Typography.Text>
				<Typography.Text className="multiple-notifications-header-description">
					{t('al_v2_group_alerts_by_desc', {
						defaultValue:
							'Combine alerts with the same field values into a single notification.',
					})}
				</Typography.Text>
			</div>
			{multipleNotificationsInput}
		</div>
	);
}

export default MultipleNotifications;
