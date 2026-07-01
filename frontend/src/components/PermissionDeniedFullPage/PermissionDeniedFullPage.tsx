import { CircleSlash2 } from '@signozhq/icons';
import { Trans, useTranslation } from 'react-i18next';

import styles from './PermissionDeniedFullPage.module.scss';
import { Style } from '@signozhq/design-tokens';
import { useAppContext } from 'providers/App/App';

interface PermissionDeniedFullPageProps {
	permissionName: string;
}

function PermissionDeniedFullPage({
	permissionName,
}: PermissionDeniedFullPageProps): JSX.Element {
	const { user } = useAppContext();
	const { t } = useTranslation('pages');

	return (
		<div className={styles.container}>
			<div className={styles.content}>
				<span className={styles.icon}>
					<CircleSlash2 color={Style.CALLOUT_WARNING_TITLE} size={14} />
				</span>
				<p className={styles.title}>
					{t('cmp_permission_denied_title', {
						defaultValue: 'Uh-oh! You are not authorized',
					})}
				</p>
				<p className={styles.subtitle}>
					<Trans
						i18nKey="pages:cmp_permission_denied_subtitle"
						defaults="<0>user/{{userId}}</0> is not authorized to perform <1>{{permissionName}}</1>"
						values={{ userId: user.id, permissionName }}
						components={[
							<code className={styles.permission} />,
							<code className={styles.permission} />,
						]}
					/>
				</p>
			</div>
		</div>
	);
}

export default PermissionDeniedFullPage;
