import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';
import { VirtuosoMockContext } from 'react-virtuoso';
import { render, RenderResult, screen } from '@testing-library/react';
import ListAlertRules from 'container/ListAlertRules';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { AppContext } from 'providers/App/App';
import TimezoneProvider from 'providers/Timezone';
import { onNuqsUrlUpdate, resetNuqsState } from 'tests/nuqs-helpers';
import { getAppContextMock } from 'tests/test-utils';

// Sobrescribe el mock global de react-i18next (que devuelve la clave) para que
// respete el defaultValue. Así los textos i18n-izados con t('clave', { defaultValue })
// renderizan su valor en inglés en los tests, igual que antes de la i18n.
jest.mock('react-i18next', () => ({
	useTranslation: (): {
		t: (str: string, options?: { defaultValue?: string }) => string;
		i18n: { changeLanguage: () => Promise<void> };
	} => ({
		t: (str: string, options?: { defaultValue?: string }): string =>
			options?.defaultValue ?? str,
		i18n: {
			changeLanguage: (): Promise<void> => new Promise(() => {}),
		},
	}),
}));

interface RenderOptions {
	role?: string;
	initialRoute?: string;
}

export function renderListAlertRules(
	options: RenderOptions = {},
): RenderResult {
	const { role = 'ADMIN', initialRoute = '/' } = options;

	const initialSearch = initialRoute.includes('?')
		? initialRoute.slice(initialRoute.indexOf('?'))
		: '';
	resetNuqsState(initialSearch);

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { refetchOnWindowFocus: false, retry: false },
			mutations: { retry: false },
		},
	});

	return render(
		<MemoryRouter initialEntries={[initialRoute]}>
			<NuqsTestingAdapter
				searchParams={initialSearch}
				onUrlUpdate={onNuqsUrlUpdate}
				rateLimitFactor={0}
				hasMemory
			>
				<QueryClientProvider client={queryClient}>
					<AppContext.Provider value={getAppContextMock(role)}>
						<TimezoneProvider>
							<VirtuosoMockContext.Provider
								value={{ viewportHeight: 800, itemHeight: 46 }}
							>
								<ListAlertRules />
							</VirtuosoMockContext.Provider>
						</TimezoneProvider>
					</AppContext.Provider>
				</QueryClientProvider>
			</NuqsTestingAdapter>
		</MemoryRouter>,
	);
}

export async function findAlertRow(alertName: string): Promise<HTMLElement> {
	const cell = await screen.findByText(alertName, {}, { timeout: 5000 });
	const row = cell.closest('tr');
	if (!row) {
		throw new Error(`Row not found for alert "${alertName}"`);
	}
	return row as HTMLElement;
}
