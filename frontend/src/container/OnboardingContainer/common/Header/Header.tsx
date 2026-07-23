import { useTranslation } from 'react-i18next';
import cx from 'classnames';

interface HeaderProps {
	entity: string;
	heading: string;
	imgURL: string;
	docsURL: string;
	imgClassName: string;
}

export default function Header({
	entity,
	heading,
	imgURL,
	docsURL,
	imgClassName,
}: HeaderProps): JSX.Element {
	const { t } = useTranslation('pages');
	return (
		<div className={cx('header', entity)}>
			<img className={imgClassName} src={imgURL} alt="" />
			<div className="title">
				<h1>{heading}</h1>

				<div className="detailed-docs-link">
					{t('onb_view_detailed_docs', { defaultValue: "View detailed docs" })}
					<a target="_blank" href={docsURL} rel="noreferrer">
						here
					</a>
				</div>
			</div>
		</div>
	);
}
