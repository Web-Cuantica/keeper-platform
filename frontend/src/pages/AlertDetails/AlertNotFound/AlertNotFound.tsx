import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { Typography } from '@signozhq/ui/typography';
import ROUTES from 'constants/routes';
import { handleContactSupport } from 'container/Integrations/utils';
import { useGetTenantLicense } from 'hooks/useGetTenantLicense';
import { useSafeNavigate } from 'hooks/useSafeNavigate';
import { LifeBuoy, List } from '@signozhq/icons';
import { isModifierKeyPressed } from 'utils/app';

import broomUrl from '@/assets/Icons/broom.svg';
import constructionUrl from '@/assets/Icons/construction.svg';
import noDataUrl from '@/assets/Icons/no-data.svg';

import './AlertNotFound.styles.scss';

interface AlertNotFoundProps {
	isTestAlert: boolean;
}

function AlertNotFound({ isTestAlert }: AlertNotFoundProps): JSX.Element {
	const { t } = useTranslation('pages');
	const { isCloudUser: isCloudUserVal } = useGetTenantLicense();
	const { safeNavigate } = useSafeNavigate();

	const checkAllRulesHandler = (e: React.MouseEvent): void => {
		safeNavigate(ROUTES.LIST_ALL_ALERT, { newTab: isModifierKeyPressed(e) });
	};

	const contactSupportHandler = (): void => {
		handleContactSupport(isCloudUserVal);
	};

	return (
		<div className="alert-not-found">
			<section className="description">
				<img src={noDataUrl} alt="no-data" className="not-found-img" />
				<Typography.Text className="not-found-text">
					{t('al_nf_title', {
						defaultValue: "Uh-oh! We couldn't find the given alert rule.",
					})}
				</Typography.Text>
				<Typography.Text className="not-found-text">
					{isTestAlert
						? t('al_nf_scenario_single', {
								defaultValue: 'This can happen in the following scenario -',
							})
						: t('al_nf_scenario_multiple', {
								defaultValue:
									'This can happen in either of the following scenarios -',
							})}
				</Typography.Text>
			</section>
			<section className="reasons">
				{!isTestAlert && (
					<>
						<div className="reason">
							<img src={constructionUrl} alt="no-data" className="construction-img" />
							<Typography.Text className="text">
								{t('al_nf_reason_incorrect_link', {
									defaultValue:
										'The alert rule link is incorrect, please verify it once.',
								})}
							</Typography.Text>
						</div>
						<div className="reason">
							<img src={broomUrl} alt="no-data" className="broom-img" />
							<Typography.Text className="text">
								{t('al_nf_reason_deleted', {
									defaultValue:
										"The alert rule you're trying to check has been deleted.",
								})}
							</Typography.Text>
						</div>
					</>
				)}
				{isTestAlert && (
					<div className="reason">
						<img src={broomUrl} alt="no-data" className="broom-img" />
						<Typography.Text className="text">
							{t('al_nf_reason_test_alert', {
								defaultValue:
									'You clicked on the Alert notification link received when testing a new Alert rule. Once the alert rule is saved, future notifications will link to actual alerts.',
							})}
						</Typography.Text>
					</div>
				)}
			</section>
			<section className="none-of-above">
				<Typography.Text className="text">
					{t('al_nf_none_of_above', {
						defaultValue:
							'If you feel the issue is none of the above, please contact support.',
					})}
				</Typography.Text>
				<div className="action-btns">
					<Button
						className="action-btn"
						icon={<List size={14} />}
						onClick={checkAllRulesHandler}
					>
						{t('al_nf_check_all_rules', { defaultValue: 'Check all rules' })}
					</Button>
					<Button
						className="action-btn"
						icon={<LifeBuoy size={14} />}
						onClick={contactSupportHandler}
					>
						{t('al_nf_contact_support', { defaultValue: 'Contact Support' })}
					</Button>
				</div>
			</section>
		</div>
	);
}

export default AlertNotFound;
