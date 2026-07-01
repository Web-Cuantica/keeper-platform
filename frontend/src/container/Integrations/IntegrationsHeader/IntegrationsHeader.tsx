import { ChangeEvent, KeyboardEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { Button } from '@signozhq/ui/button';
import { DialogWrapper } from '@signozhq/ui/dialog';
import { Input } from '@signozhq/ui/input';
import { toast } from '@signozhq/ui/sonner';
import { Flex } from 'antd';
import { Typography } from '@signozhq/ui/typography';
import logEvent from 'api/common/logEvent';
import ROUTES from 'constants/routes';
import { ArrowRight, Cable, Check } from '@signozhq/icons';
import { useAppContext } from 'providers/App/App';
import { routePermission } from 'utils/permission';

import './IntegrationsHeader.styles.scss';

interface IntegrationsHeaderProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
}

function IntegrationsHeader(props: IntegrationsHeaderProps): JSX.Element {
	const { t } = useTranslation('pages');
	const history = useHistory();
	const { user } = useAppContext();

	const { searchQuery, onSearchChange } = props;
	const [isRequestIntegrationDialogOpen, setIsRequestIntegrationDialogOpen] =
		useState(false);

	const [
		isSubmittingRequestForIntegration,
		setIsSubmittingRequestForIntegration,
	] = useState(false);

	const [requestedIntegrationName, setRequestedIntegrationName] = useState('');

	const isGetStartedWithCloudAllowed =
		routePermission.GET_STARTED_WITH_CLOUD.includes(user.role);

	const handleRequestIntegrationSubmit = async (): Promise<void> => {
		try {
			setIsSubmittingRequestForIntegration(true);
			const eventName = 'Integration requested';
			const screenName = 'Integration list page';

			const response = await logEvent(eventName, {
				screen: screenName,
				integration: requestedIntegrationName,
			});

			if (response.statusCode === 200) {
				toast.success(
					t('intg_request_submitted', {
						defaultValue: 'Integration Request Submitted',
					}),
					{
						position: 'top-right',
					},
				);
				setRequestedIntegrationName('');
				setIsRequestIntegrationDialogOpen(false);
				setIsSubmittingRequestForIntegration(false);
			} else {
				toast.error(
					response.error ||
						t('intg_something_went_wrong', { defaultValue: 'Something went wrong' }),
					{
						position: 'top-right',
					},
				);

				setIsSubmittingRequestForIntegration(false);
			}
		} catch (error) {
			toast.error(
				t('intg_something_went_wrong', { defaultValue: 'Something went wrong' }),
				{
					position: 'top-right',
				},
			);
			setIsSubmittingRequestForIntegration(false);
		}
	};

	return (
		<div className="integrations-header">
			<Typography.Title className="title">
				{t('intg_title', { defaultValue: 'Integrations' })}
			</Typography.Title>
			<Flex
				justify="space-between"
				align="center"
				className="integrations-header__subrow"
			>
				<Typography.Text className="subtitle">
					{t('intg_subtitle', {
						defaultValue: 'Manage integrations for this workspace.',
					})}
				</Typography.Text>
			</Flex>

			<div className="integrations-search-request-container">
				<Input
					placeholder={t('intg_search_placeholder', {
						defaultValue: 'Search for an integration...',
					})}
					value={searchQuery}
					onChange={(e: ChangeEvent<HTMLInputElement>): void =>
						onSearchChange(e.target.value)
					}
				/>
				<Button
					variant="solid"
					color="secondary"
					className="request-integration-btn"
					prefix={<Cable size={14} />}
					onClick={(): void => setIsRequestIntegrationDialogOpen(true)}
				>
					{t('intg_request_integration', { defaultValue: 'Request Integration' })}
				</Button>

				<DialogWrapper
					className="request-integration-dialog"
					title={t('intg_request_new_integration', {
						defaultValue: 'Request New Integration',
					})}
					open={isRequestIntegrationDialogOpen}
					onOpenChange={setIsRequestIntegrationDialogOpen}
				>
					<div className="request-integration-form">
						<div className="request-integration-form-title">
							{t('intg_which_looking_for', {
								defaultValue: 'Which integration are you looking for?',
							})}
						</div>
						<Input
							placeholder={t('intg_enter_name_placeholder', {
								defaultValue: 'Enter integration name...',
							})}
							value={requestedIntegrationName}
							onChange={(e: ChangeEvent<HTMLInputElement>): void => {
								setRequestedIntegrationName(e.target.value);
							}}
							onKeyDown={(e: KeyboardEvent<HTMLInputElement>): void => {
								if (e.key === 'Enter' && requestedIntegrationName?.trim().length > 0) {
									handleRequestIntegrationSubmit();
								}
							}}
							disabled={isSubmittingRequestForIntegration}
						/>
					</div>

					<div className="request-integration-form-footer">
						<Button
							variant="solid"
							color="primary"
							prefix={<Check size={14} />}
							onClick={handleRequestIntegrationSubmit}
							loading={isSubmittingRequestForIntegration}
							disabled={
								isSubmittingRequestForIntegration ||
								!requestedIntegrationName ||
								requestedIntegrationName?.trim().length === 0
							}
						>
							{t('intg_submit', { defaultValue: 'Submit' })}
						</Button>
					</div>
				</DialogWrapper>

				{isGetStartedWithCloudAllowed && (
					<Button
						variant="solid"
						color="primary"
						onClick={(): void => history.push(ROUTES.GET_STARTED_WITH_CLOUD)}
					>
						<span>
							{t('intg_view_data_sources', { defaultValue: 'View 150+ Data Sources' })}
						</span>
						<ArrowRight size={14} />
					</Button>
				)}
			</div>
		</div>
	);
}

export default IntegrationsHeader;
