import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import * as Sentry from '@sentry/react';
import SeverityCriticalIcon from 'assets/AlertHistory/SeverityCriticalIcon';
import SeverityErrorIcon from 'assets/AlertHistory/SeverityErrorIcon';
import SeverityInfoIcon from 'assets/AlertHistory/SeverityInfoIcon';
import SeverityWarningIcon from 'assets/AlertHistory/SeverityWarningIcon';

import './AlertSeverity.styles.scss';

// Genera la config de severidad traducida; se llama en render para no congelar el namespace async
const getSeverityConfig = (
	t: TFunction,
): Record<string, Record<string, string | JSX.Element>> => ({
	critical: {
		text: t('al_severity_critical', { defaultValue: 'Critical' }),
		className: 'alert-severity--critical',
		icon: <SeverityCriticalIcon />,
	},
	error: {
		text: t('al_severity_error', { defaultValue: 'Error' }),
		className: 'alert-severity--error',
		icon: <SeverityErrorIcon />,
	},
	warning: {
		text: t('al_severity_warning', { defaultValue: 'Warning' }),
		className: 'alert-severity--warning',
		icon: <SeverityWarningIcon />,
	},
	info: {
		text: t('al_severity_info', { defaultValue: 'Info' }),
		className: 'alert-severity--info',
		icon: <SeverityInfoIcon />,
	},
});

export default function AlertSeverity({
	severity,
}: {
	severity: string;
}): JSX.Element {
	const { t } = useTranslation('pages');
	const severityDetails = useMemo(() => {
		const severityConfig = getSeverityConfig(t);
		if (severityConfig[severity]) {
			return severityConfig[severity];
		}

		Sentry.captureEvent({
			message: `Received unknown severity on Alert Details: ${severity}`,
			level: 'error',
		});

		return {
			text: severity,
			className: 'alert-severity--info',
			icon: <SeverityInfoIcon />,
		};
	}, [severity, t]);
	return (
		<div className={`alert-severity ${severityDetails.className}`}>
			<div className="alert-severity__icon">{severityDetails.icon}</div>
			<div className="alert-severity__text">{severityDetails.text}</div>
		</div>
	);
}
