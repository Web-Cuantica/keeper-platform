import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Plus } from '@signozhq/icons';
import { Button } from '@signozhq/ui/button';
import { Input } from '@signozhq/ui/input';
import AuthZTooltip from 'components/AuthZTooltip/AuthZTooltip';
import ROUTES from 'constants/routes';
import { RoleCreatePermission } from 'hooks/useAuthZ/permissions/role.permissions';
import { useRolesFeatureGate } from 'hooks/useRolesFeatureGate';

import RolesListingTable from './RolesComponents/RolesListingTable';

import styles from './RolesSettings.module.scss';

function RolesSettings(): JSX.Element {
	const { t } = useTranslation('pages');
	const [searchQuery, setSearchQuery] = useState('');
	const history = useHistory();
	const { isRolesEnabled } = useRolesFeatureGate();

	return (
		<div data-testid="roles-settings">
			<div className={styles.rolesSettingsHeader}>
				<h3 className={styles.rolesSettingsHeaderTitle}>{t('cfg_roles', { defaultValue: "Roles" })}</h3>
				<p className={styles.rolesSettingsHeaderDescription}>
					{isRolesEnabled
						? 'Create and manage custom roles for your team. '
						: 'The built-in roles of this instance.'}{' '}
					<a
						href="https://signoz.io/docs/manage/administrator-guide/iam/roles/"
						target="_blank"
						rel="noopener noreferrer"
						className={styles.rolesSettingsHeaderLearnMore}
					>
						{t('cfg_learn_more', { defaultValue: "Learn more" })}
					</a>
				</p>
			</div>
			<div className={styles.rolesSettingsContent}>
				<div className={styles.rolesSettingsToolbar}>
					<Input
						type="search"
						placeholder={t('cfg_search_for_roles', { defaultValue: "Search for roles..." })}
						value={searchQuery}
						onChange={(e): void => setSearchQuery(e.target.value)}
					/>
					{isRolesEnabled && (
						<AuthZTooltip checks={[RoleCreatePermission]}>
							<Button
								variant="solid"
								color="primary"
								className={styles.roleSettingsToolbarButton}
								onClick={(): void => history.push(ROUTES.ROLE_CREATE)}
							>
								<Plus size={14} />
								{t('cfg_custom_role', { defaultValue: "Custom role" })}
							</Button>
						</AuthZTooltip>
					)}
				</div>
				<RolesListingTable searchQuery={searchQuery} />
			</div>
		</div>
	);
}

export default RolesSettings;
