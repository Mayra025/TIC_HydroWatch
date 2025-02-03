import { act, render, screen, waitFor, } from '@testing-library/react';
import '@testing-library/jest-dom';
import LineChart from '../src/componentes/LineChart/LineChart';

// Mock para Firebase Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  onSnapshot: jest.fn(), // La configuramos de manera dinámica en cada caso
}));

describe('LineChart Component', () => {
  const mockOnSnapshot = jest.requireMock('firebase/firestore').onSnapshot;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers(); // Usamos temporizadores falsos para simular tiempo
  });



  test('renders loading state initially', async () => {
    // Configuramos `onSnapshot` para retornar datos simulados después de 1 segundo
    mockOnSnapshot.mockImplementationOnce(
      (_: unknown, callback: (snapshot: any) => void) => {
        setTimeout(() => {
          callback({
            docs: [
              {
                data: () => ({
                  dateTime: { seconds: 1672531200 },
                  pH: '7.0',
                  temperature: '25',
                  waterLevel: '10',
                }),
              },
            ],
          });
        }, 1000);
        return jest.fn(); // Simula la función de desuscripción
      }
    );

    render(<LineChart sensorType="temperatura" userId="user123" cultivoId="cultivo123" />);

    // Asegurarse de que el estado "loading" es visible inicialmente
    expect(screen.getByRole('status')).toHaveTextContent(/loading/i);

    // Simulamos el paso del tiempo para completar el fetch
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Verificamos que el estado de "loading" desaparece y se muestran los datos
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });


  test('renders error state when there is an error fetching data', async () => {
    // Configuramos `onSnapshot` para simular un error
    mockOnSnapshot.mockImplementationOnce(
      (_: unknown, _callback: unknown, errorCallback: (error: Error) => void) => {
        errorCallback(new Error('Error fetching data'));
        return jest.fn(); // Simula la función de desuscripción
      }
    );

    render(<LineChart sensorType="temperatura" userId="user123" cultivoId="cultivo123" />);

    // Esperamos que se muestre el mensaje de error
    await waitFor(() => {
      expect(screen.getByText(/Error fetching data/i)).toBeInTheDocument();
    });
  });




  // test('renders data correctly', async () => {
  //   mockOnSnapshot.mockImplementationOnce((_: any, callback: (arg0: { docs: { id: string; data: () => { dateTime: string; temperature: number; }; }[]; }) => void) => {
  //     setTimeout(() => {
  //       callback({
  //         docs: [
  //           { id: '1', data: () => ({ dateTime: '2023-01-01T00:00:00Z', temperature: 25 }) },
  //           { id: '2', data: () => ({ dateTime: '2023-01-02T00:00:00Z', temperature: 26 }) },
  //         ],
  //       });
  //     }, 100);
  //     return jest.fn(); // Simula una función de desuscripción
  //   });

  //   render(<LineChart sensorType="temperatura" userId="user123" cultivoId="cultivo123" />);

  //   // Espera a que el componente termine de cargar
  //   await waitFor(() => {
  //     expect(screen.queryByRole('status')).not.toBeInTheDocument();
  //   });

  //   // Verifica que los datos procesados sean los esperados
  //   const chart = screen.getByTestId('mocked-line-chart');
  //   expect(chart).toHaveTextContent('"labels":["00:00:00","00:00:00"]');
  //   expect(chart).toHaveTextContent('"data":[25,26]');
  // });





  // test('renders correct title for the graph', async () => {
  //   render(<LineChart sensorType="temperatura" userId="user123" cultivoId="cultivo123" />);

  //   // Espera a que los datos se hayan cargado y desaparezca "loading"
  //   await waitFor(() => {
  //     expect(screen.queryByRole('status')).not.toBeInTheDocument();
  //   });

  //   // Verifica que el título del gráfico se muestra correctamente
  //   const title = screen.getByText(/Mediciones del/i);  // Verifica que contiene "Mediciones del"
  //   expect(title).toBeInTheDocument();
  // });

  // test('renders axis titles correctly', async () => {
  //   render(<LineChart sensorType="temperatura" userId="user123" cultivoId="cultivo123" />);

  //   // Espera a que los datos se hayan cargado y desaparezca "loading"
  //   await waitFor(() => {
  //     expect(screen.queryByRole('status')).not.toBeInTheDocument();
  //   });

  //   // Verifica que el título del eje y es "Temperatura (°C)"
  //   const yAxisTitle = screen.getByText('Temperatura (°C)');
  //   expect(yAxisTitle).toBeInTheDocument();

  //   // Verifica que el título del eje x es "Hora"
  //   const xAxisTitle = screen.getByText('Hora');
  //   expect(xAxisTitle).toBeInTheDocument();
  // });

});
