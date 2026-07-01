import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { Button } from 'antd';
import { Typography } from '@signozhq/ui/typography';
import { AuthtypesAuthNProviderDTO } from 'api/generated/services/sigNoz.schemas';

import './CreateEdit.styles.scss';
import { Key, SolidGoogle } from '@signozhq/icons';

interface AuthNProvider {
	key: AuthtypesAuthNProviderDTO;
	title: string;
	description: string;
	icon: JSX.Element;
	enabled: boolean;
}

function getAuthNProviders(
	t: TFunction,
	samlEnabled: boolean,
): AuthNProvider[] {
	return [
		{
			key: AuthtypesAuthNProviderDTO.google_auth,
			title: t('pages:set_auth_google_title', {
				defaultValue: 'Google Apps Authentication',
			}),
			description: t('pages:set_auth_google_desc', {
				defaultValue: 'Let members sign-in with a Google workspace account',
			}),
			icon: <SolidGoogle size={37} />,
			enabled: true,
		},
		{
			key: AuthtypesAuthNProviderDTO.saml,
			title: t('pages:set_auth_saml_title', {
				defaultValue: 'SAML Authentication',
			}),
			description: t('pages:set_auth_saml_desc', {
				defaultValue:
					'Azure, Active Directory, Okta or your custom SAML 2.0 solution',
			}),
			icon: <Key size={37} />,
			enabled: samlEnabled,
		},

		{
			key: AuthtypesAuthNProviderDTO.oidc,
			title: t('pages:set_auth_oidc_title', {
				defaultValue: 'OIDC Authentication',
			}),
			description: t('pages:set_auth_oidc_desc', {
				defaultValue:
					'Authenticate using OpenID Connect providers like Azure, Active Directory, Okta, or other OIDC compliant solutions',
			}),
			icon: <Key size={37} />,
			enabled: samlEnabled,
		},
	];
}

function AuthnProviderSelector({
	setAuthnProvider,
	samlEnabled,
}: {
	setAuthnProvider: React.Dispatch<
		React.SetStateAction<AuthtypesAuthNProviderDTO | ''>
	>;
	samlEnabled: boolean;
}): JSX.Element {
	const { t } = useTranslation('pages');
	const authnProviders = getAuthNProviders(t, samlEnabled);
	return (
		<div className="authn-provider-selector">
			<section className="header">
				<Typography.Title level={4}>
					{t('set_configure_auth_method', {
						defaultValue: 'Configure Authentication Method',
					})}
				</Typography.Title>
				<Typography.Text italic>
					{t('set_configure_auth_subtitle', {
						defaultValue:
							'SigNoz supports the following single sign-on services (SSO). Get started with setting your project’s SSO below',
					})}
				</Typography.Text>
			</section>
			<section className="selector">
				{authnProviders.map((provider) => {
					if (provider.enabled) {
						return (
							<section key={provider.key} className="provider">
								<span className="icon">{provider.icon}</span>
								<div className="title-description">
									<Typography.Text className="title">{provider.title}</Typography.Text>
									<Typography.Text className="description">
										{provider.description}
									</Typography.Text>
								</div>
								<Button
									onClick={(): void => setAuthnProvider(provider.key)}
									type="primary"
								>
									{t('set_auth_configure', { defaultValue: 'Configure' })}
								</Button>
							</section>
						);
					}
					return <div key={provider.key} />;
				})}
			</section>
		</div>
	);
}

export default AuthnProviderSelector;
