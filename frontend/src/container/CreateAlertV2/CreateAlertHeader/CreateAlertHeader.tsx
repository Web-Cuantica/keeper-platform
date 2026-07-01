import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@signozhq/ui/button';
import { Input } from '@signozhq/ui/input';
import logEvent from 'api/common/logEvent';
import classNames from 'classnames';
import { QueryParams } from 'constants/query';
import ROUTES from 'constants/routes';
import { useQueryBuilder } from 'hooks/queryBuilder/useQueryBuilder';
import { useSafeNavigate } from 'hooks/useSafeNavigate';
import useUrlQuery from 'hooks/useUrlQuery';
import { RotateCcw } from '@signozhq/icons';
import { useAlertRuleOptional } from 'providers/Alert';
import { Labels } from 'types/api/alerts/def';

import { useCreateAlertState } from '../context';
import LabelsInput from './LabelsInput';

import './styles.scss';

function CreateAlertHeader(): JSX.Element {
	const { t } = useTranslation('pages');
	const { alertState, setAlertState, isEditMode } = useCreateAlertState();
	const alertRuleContext = useAlertRuleOptional();

	const { currentQuery } = useQueryBuilder();
	const { safeNavigate } = useSafeNavigate();
	const urlQuery = useUrlQuery();

	const groupByLabels = useMemo(() => {
		const labels = new Array<string>();
		currentQuery.builder.queryData.forEach((query) => {
			query.groupBy.forEach((groupBy) => {
				labels.push(groupBy.key);
			});
		});
		return labels;
	}, [currentQuery]);

	// If the label key is a group by label, then it is not allowed to be used as a label key
	const validateLabelsKey = useCallback(
		(key: string): string | null => {
			if (groupByLabels.includes(key)) {
				return t('al_v2_labels_key_not_allowed', {
					defaultValue: 'Cannot use {{key}} as a key',
					key,
				});
			}
			return null;
		},
		[groupByLabels, t],
	);

	const handleSwitchToClassicExperience = useCallback(() => {
		logEvent('Alert: Switch to classic experience button clicked', {});

		urlQuery.set(QueryParams.showClassicCreateAlertsPage, 'true');
		const url = `${ROUTES.ALERTS_NEW}?${urlQuery.toString()}`;
		safeNavigate(url, { replace: true });
	}, [safeNavigate, urlQuery]);

	return (
		<div
			className={classNames('alert-header', { 'edit-alert-header': isEditMode })}
		>
			{!isEditMode && (
				<div className="alert-header__tab-bar">
					<div className="alert-header__tab">
						{t('al_v2_new_alert_rule', { defaultValue: 'New Alert Rule' })}
					</div>
					<Button
						prefix={<RotateCcw size={12} />}
						onClick={handleSwitchToClassicExperience}
						variant="solid"
						color="secondary"
						size="sm"
					>
						{t('al_v2_switch_classic', {
							defaultValue: 'Switch to Classic Experience',
						})}
					</Button>
				</div>
			)}
			<div className="alert-header__content">
				<Input
					type="text"
					value={alertState.name}
					onChange={(e): void => {
						const newName = e.target.value;
						setAlertState({ type: 'SET_ALERT_NAME', payload: newName });
						if (isEditMode && alertRuleContext?.setAlertRuleName) {
							alertRuleContext.setAlertRuleName(newName);
						}
					}}
					className="alert-header__input title"
					placeholder={t('al_v2_alert_name_placeholder', {
						defaultValue: 'Enter alert rule name',
					})}
					data-testid="alert-name-input"
				/>
				<LabelsInput
					labels={alertState.labels}
					onLabelsChange={(labels: Labels): void =>
						setAlertState({ type: 'SET_ALERT_LABELS', payload: labels })
					}
					validateLabelsKey={validateLabelsKey}
				/>
			</div>
		</div>
	);
}

export default CreateAlertHeader;
