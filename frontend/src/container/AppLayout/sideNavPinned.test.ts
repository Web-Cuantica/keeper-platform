import { resolveSideNavPinned } from './sideNavPinned';

describe('resolveSideNavPinned', () => {
	it('por defecto va expandido cuando no hay preferencia (null/undefined/"")', () => {
		expect(resolveSideNavPinned(null)).toBe(true);
		expect(resolveSideNavPinned(undefined)).toBe(true);
		expect(resolveSideNavPinned('')).toBe(true);
	});

	it('respeta el colapso explícito guardado como booleano', () => {
		expect(resolveSideNavPinned(false)).toBe(false);
		expect(resolveSideNavPinned(true)).toBe(true);
	});

	it('respeta el valor de localStorage como string', () => {
		expect(resolveSideNavPinned('false')).toBe(false);
		expect(resolveSideNavPinned('true')).toBe(true);
	});

	it('cualquier string no reconocido se trata como colapsado (no "true")', () => {
		expect(resolveSideNavPinned('maybe')).toBe(false);
	});
});
