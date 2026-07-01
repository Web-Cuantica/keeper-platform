import NotFoundImage from 'assets/NotFound';
import ROUTES from 'constants/routes';
import { useTranslation } from 'react-i18next';

import { defaultText } from './constant';
import { Button, Container, Text, TextContainer } from './styles';

function NotFound({ text }: Props): JSX.Element {
	const { t } = useTranslation('pages');
	const displayText =
		text ?? t('cmp_not_found_default_text', { defaultValue: defaultText });
	return (
		<Container>
			<NotFoundImage />

			<TextContainer>
				<Text>{displayText}</Text>
				<Text>
					{t('cmp_not_found_page_not_found', { defaultValue: 'Page Not Found' })}
				</Text>
			</TextContainer>

			<Button to={ROUTES.HOME} tabIndex={0}>
				{t('cmp_not_found_return_home', { defaultValue: 'Return Home' })}
			</Button>
		</Container>
	);
}

interface Props {
	text?: string;
}

NotFound.defaultProps = {
	text: undefined,
};

export default NotFound;
