import { render, screen, fireEvent } from '@testing-library/react';
import HistoricalChartForm from '../src/componentes/HistoricalChartForm/HistoricalChartForm';

describe('HistoricalChartForm Component', () => {
    const mockProps = {
        cultivos: [
            { id: '1', especie: 'Lechuga', variedad: 'Butterhead' },
            { id: '2', especie: 'Tomate', variedad: 'Cherry' },
        ],
        selectedCultivo: '',
        setSelectedCultivo: jest.fn(),
        startDate: '',
        setStartDate: jest.fn(),
        endDate: '',
        setEndDate: jest.fn(),
        selectedAnalysis: '',
        setSelectedAnalysis: jest.fn(),
        availableAnalyses: {
            Sensor1: ['Análisis 1', 'Análisis 2'],
            Sensor2: ['Análisis 3'],
        },
        selectedSensor: '',
        setSelectedSensor: jest.fn(),
        fetchData: jest.fn(),
        resetFields: jest.fn(),
        setError: jest.fn(),
    };

    it('Renderiza todos los elementos del formulario correctamente', () => {
        render(<HistoricalChartForm {...mockProps} />);

        expect(screen.getByLabelText(/cultivo/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/sensor/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/fecha de inicio/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/fecha de fin/i)).toBeInTheDocument();
        expect(screen.getByText(/generar/i)).toBeInTheDocument();
        expect(screen.getByText(/limpiar/i)).toBeInTheDocument();
    });

    it('llama a setSelectedCultivo cuando se selecciona un cultivo', () => {
        render(<HistoricalChartForm {...mockProps} />);

        const select = screen.getByLabelText(/cultivo/i);
        fireEvent.change(select, { target: { value: '1' } });

        expect(mockProps.setSelectedCultivo).toHaveBeenCalledWith('1');
    });

    it('llama a setSelectedSensor cuando se selecciona un sensor', () => {
        render(<HistoricalChartForm {...mockProps} />);

        const select = screen.getByLabelText(/sensor/i);
        fireEvent.change(select, { target: { value: 'Sensor1' } });

        expect(mockProps.setSelectedSensor).toHaveBeenCalledWith('Sensor1');
    });

    it('llama a setStartDate y setError cuando se cambia la fecha de inicio', () => {
        render(<HistoricalChartForm {...mockProps} endDate="2025-01-15" />);

        const input = screen.getByLabelText(/fecha de inicio/i);
        fireEvent.change(input, { target: { value: '2025-01-16' } });

        expect(mockProps.setStartDate).toHaveBeenCalledWith('');
        expect(mockProps.setError).toHaveBeenCalledWith('La fecha de inicio no puede ser posterior a la fecha de fin.');
    });

    it('llama a fetchData cuando se hace clic en el botón "Generar"', () => {
        render(<HistoricalChartForm {...mockProps} />);

        const button = screen.getByText(/generar/i);
        fireEvent.click(button);

        expect(mockProps.fetchData).toHaveBeenCalled();
    });

    it('llama a resetFields cuando se hace clic en el botón "Limpiar"', () => {
        render(<HistoricalChartForm {...mockProps} />);

        const button = screen.getByText(/limpiar/i);
        fireEvent.click(button);

        expect(mockProps.resetFields).toHaveBeenCalled();
    });

    it('llama a setEndDate y setError cuando se cambia la fecha de fin', () => {
        render(<HistoricalChartForm {...mockProps} startDate="2025-01-15" />);

        const input = screen.getByLabelText(/fecha de fin/i);
        fireEvent.change(input, { target: { value: '2025-01-14' } });

        expect(mockProps.setEndDate).toHaveBeenCalledWith('');
        expect(mockProps.setError).toHaveBeenCalledWith('La fecha de fin no puede ser anterior a la fecha de inicio.');
    });

    it('muestra los valores predeterminados en los selectores', () => {
        render(<HistoricalChartForm {...mockProps} />);

        const selectCultivo = screen.getByLabelText(/cultivo/i) as HTMLSelectElement;
        expect(selectCultivo.value).toBe('');

        // const selectSensor = screen.getByLabelText(/""/i) as HTMLSelectElement;
        // expect(selectSensor.value).toBe('');
    });
   
    


});
