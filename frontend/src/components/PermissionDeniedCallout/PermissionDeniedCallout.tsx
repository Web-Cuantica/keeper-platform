import { Callout } from '@signozhq/ui/callout';
import cx from 'classnames';
import { useTranslation } from 'react-i18next';
import styles from './PermissionDeniedCallout.module.scss';

interface PermissionDeniedCalloutProps {
	permissionName: string;
	className?: string;
}

function PermissionDeniedCallout({
	permissionName,
	className,
}: PermissionDeniedCalloutProps): JSX.Element {
	const { t } = useTranslation('pages');
	return (
		<Callout
			type="error"
			showIcon
			size="small"
			className={cx(styles.callout, className)}
		>
			{t('cmp_permission_denied_callout', {
				defaultValue: "You don't have {{permissionName}} permission",
				permissionName,
			})}
		</Callout>
	);
}

export default PermissionDeniedCallout;
