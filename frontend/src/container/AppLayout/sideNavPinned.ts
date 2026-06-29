/**
 * Resuelve el estado "pinned" (expandido) del SideNav a partir de la preferencia
 * guardada (booleano del backend o string de localStorage).
 *
 * Regla: el SideNav va EXPANDIDO por defecto. Solo queda colapsado si el usuario
 * lo guardó explícitamente como `false` (preferencia) o `'false'` (localStorage).
 * Si nunca lo configuró (`null`/`undefined`/`''`) → expandido.
 */
export function resolveSideNavPinned(
	raw: boolean | string | null | undefined,
): boolean {
	if (raw === null || raw === undefined || raw === '') {
		return true;
	}
	if (typeof raw === 'string') {
		return raw === 'true';
	}
	return raw;
}
