import { fireEvent, render, screen } from '@testing-library/react';

import LogLinesActionButtons from './LogLinesActionButtons';

describe('LogLinesActionButtons', () => {
	const base = {
		handleShowContext: jest.fn(),
		onLogCopy: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('muestra las cuatro acciones cuando se pasan todas', () => {
		render(
			<LogLinesActionButtons
				{...base}
				onViewDetails={jest.fn()}
				onCopyJSON={jest.fn()}
			/>,
		);
		expect(screen.getByTestId('log-view-details-btn')).toBeInTheDocument();
		expect(screen.getByTestId('log-copy-json-btn')).toBeInTheDocument();
		expect(screen.getByTestId('log-show-context-btn')).toBeInTheDocument();
		expect(screen.getByTestId('log-copy-link-btn')).toBeInTheDocument();
	});

	// Las dos acciones nuevas son opcionales para no romper a quien ya usaba el
	// componente con dos botones: si no se pasan, no deben aparecer huecos.
	it('omite las acciones nuevas si no se pasan', () => {
		render(<LogLinesActionButtons {...base} />);
		expect(screen.queryByTestId('log-view-details-btn')).not.toBeInTheDocument();
		expect(screen.queryByTestId('log-copy-json-btn')).not.toBeInTheDocument();
		expect(screen.getByTestId('log-show-context-btn')).toBeInTheDocument();
		expect(screen.getByTestId('log-copy-link-btn')).toBeInTheDocument();
	});

	it('cada botón dispara su propia acción', () => {
		const onViewDetails = jest.fn();
		const onCopyJSON = jest.fn();
		render(
			<LogLinesActionButtons
				{...base}
				onViewDetails={onViewDetails}
				onCopyJSON={onCopyJSON}
			/>,
		);

		fireEvent.click(screen.getByTestId('log-view-details-btn'));
		expect(onViewDetails).toHaveBeenCalledTimes(1);

		fireEvent.click(screen.getByTestId('log-copy-json-btn'));
		expect(onCopyJSON).toHaveBeenCalledTimes(1);

		fireEvent.click(screen.getByTestId('log-show-context-btn'));
		expect(base.handleShowContext).toHaveBeenCalledTimes(1);

		fireEvent.click(screen.getByTestId('log-copy-link-btn'));
		expect(base.onLogCopy).toHaveBeenCalledTimes(1);
	});
});
