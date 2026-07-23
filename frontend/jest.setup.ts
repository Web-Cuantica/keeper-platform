/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable object-shorthand */
/* eslint-disable func-names */

/**
 * Adds custom matchers from the react testing library to all tests
 */
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import 'jest-styled-components';

import { server } from './src/mocks-server/server';

import './src/styles.scss';
// Establish API mocking before all tests.

// Mock window.matchMedia
window.matchMedia =
	window.matchMedia ||
	function (): any {
		return {
			matches: false,
			addListener: function () {},
			removeListener: function () {},
		};
	};

if (!HTMLElement.prototype.scrollIntoView) {
	HTMLElement.prototype.scrollIntoView = function (): void {};
}

// jsdom doesn't implement the Pointer Capture API, which Radix UI primitives
// (e.g. @signozhq/ui Select) call when opening. Stub them so those components
// can be exercised in tests.
if (!HTMLElement.prototype.hasPointerCapture) {
	HTMLElement.prototype.hasPointerCapture = function (): boolean {
		return false;
	};
}
if (!HTMLElement.prototype.releasePointerCapture) {
	HTMLElement.prototype.releasePointerCapture = function (): void {};
}

if (typeof window.IntersectionObserver === 'undefined') {
	class IntersectionObserverMock {
		observe(): void {}
		unobserve(): void {}
		disconnect(): void {}
		takeRecords(): IntersectionObserverEntry[] {
			return [];
		}
	}
	(window as any).IntersectionObserver = IntersectionObserverMock;
}

if (typeof window.ResizeObserver === 'undefined') {
	class ResizeObserverMock {
		observe(): void {}
		unobserve(): void {}
		disconnect(): void {}
	}
	(window as any).ResizeObserver = ResizeObserverMock;
}

// Patch getComputedStyle to handle CSS parsing errors from @signozhq/* packages.
// These packages inject CSS at import time via style-inject / vite-plugin-css-injected-by-js.
// jsdom's nwsapi cannot parse some of the injected selectors (e.g. Tailwind's :animate-in),
// causing SyntaxErrors during getComputedStyle / getByRole calls.
const _origGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = function (
	elt: Element,
	pseudoElt?: string | null,
): CSSStyleDeclaration {
	try {
		return _origGetComputedStyle.call(window, elt, pseudoElt);
	} catch {
		// Return a minimal CSSStyleDeclaration so callers (testing-library, Radix UI)
		// see the element as visible and without animations.
		return {
			display: '',
			visibility: '',
			opacity: '1',
			animationName: 'none',
			getPropertyValue: () => '',
		} as unknown as CSSStyleDeclaration;
	}
};

// Doble global de react-i18next.
//
// Sin i18next inicializado, el `t` real devuelve la CLAVE, no el `defaultValue`. Como los
// componentes usan t('clave', { defaultValue: 'English' }), cualquier test que busque el
// texto en inglés falla — y falla en silencio hasta que alguien lo corre, porque la app en
// el navegador sí carga los locales. Estaba resuelto solo en `src/tests/test-utils.tsx`, que
// muchos tests no importan; aquí aplica a TODOS.
// Solo se intercepta `useTranslation`: `Trans`, `I18nextProvider` e `initReactI18next` se
// dejan reales porque hay componentes que los usan.
jest.mock('react-i18next', () => ({
	...jest.requireActual('react-i18next'),
	useTranslation: (): {
		t: (str: string, options?: { defaultValue?: string }) => string;
		i18n: { changeLanguage: () => Promise<void>; language: string };
	} => ({
		t: (str: string, options?: { defaultValue?: string }): string =>
			options?.defaultValue ?? str,
		i18n: {
			changeLanguage: (): Promise<void> => new Promise(() => {}),
			// SideNav lee `i18n.language` para marcar el idioma activo; sin esto sería
			// undefined en todo test que lo renderice.
			language: 'en',
		},
	}),
}));

beforeAll(() => server.listen());

afterEach(() => server.resetHandlers());

afterAll(() => server.close());
