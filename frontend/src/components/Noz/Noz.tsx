import cx from 'classnames';

import qubiIconUrl from '@/assets/Logos/cuantica-icon.png';

import styles from './Noz.module.scss';

interface NozProps {
	size?: number;
	className?: string;
}

/**
 * Ícono de Qubi — el asistente de IA de Keeper. Rebrand: usa el logo de Cuántica/Keeper
 * (antes era la mascota SVG de SigNoz "Noz"). Se conserva el nombre del componente/clase
 * `noz-wave` para no romper las referencias existentes en el resto del panel.
 */
export default function Noz({ size = 24, className }: NozProps): JSX.Element {
	return (
		<span
			className={cx(styles.noz, className)}
			style={{ width: size, height: size }}
			aria-hidden="true"
		>
			<img
				src={qubiIconUrl}
				width={size}
				height={size}
				alt=""
				style={{ width: size, height: size, objectFit: 'contain' }}
			/>
		</span>
	);
}

Noz.defaultProps = {
	size: 24,
	className: undefined,
};
