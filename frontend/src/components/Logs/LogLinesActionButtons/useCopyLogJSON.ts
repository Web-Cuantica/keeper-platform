import { useCallback } from 'react';
import { useCopyToClipboard } from 'react-use';
import { aggregateAttributesResourcesToString } from 'container/LogDetailedView/utils';
import { useNotifications } from 'hooks/useNotifications';
import { ILog } from 'types/api/logs/log';

/**
 * Copia un log completo como JSON al portapapeles.
 *
 * Reutiliza `aggregateAttributesResourcesToString`, la misma función que usa el
 * panel de detalle: así lo que se copia desde la lista y lo que se copia desde el
 * detalle son idénticos, en vez de dos serializaciones que se van separando.
 */
export function useCopyLogJSON(log: ILog): () => void {
	const [, copyToClipboard] = useCopyToClipboard();
	const { notifications } = useNotifications();

	return useCallback((): void => {
		copyToClipboard(aggregateAttributesResourcesToString(log));
		notifications.success({ message: 'Copiado al portapapeles' });
	}, [copyToClipboard, log, notifications]);
}
