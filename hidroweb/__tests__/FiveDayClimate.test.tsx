import { render, screen, waitFor } from '@testing-library/react';
import FiveDayClimate from '../src/componentes/FiveDayClimate/FiveDayClimate';

jest.mock('react-slick', () => {
  return jest.fn(({ children }) => (
    <div>
      <button data-testid="next-arrow">➡️</button>
      {children}
    </div>
  ));
});

describe('FiveDayClimate Component', () => {
  beforeAll(() => {
    // Mock de geolocalización
    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('muestra mensaje de carga mientras se obtienen los datos', () => {
    render(<FiveDayClimate />);
    expect(screen.getByText(/Cargando pronóstico.../i)).toBeInTheDocument();
  });


  it('muestra un mensaje de error si falla la geolocalización', async () => {
    // Mock de error de geolocalización
    (navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementationOnce(
      (_, error) => {
        error({ message: 'Geolocalización no disponible' });
      }
    );

    render(<FiveDayClimate />);

    await waitFor(() => {
      expect(screen.getByText(/No se pudo obtener la ubicación./i)).toBeInTheDocument();
    });
  });

  it('muestra un mensaje de error si la API devuelve un error', async () => {
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => { });

    // Mock de éxito en la geolocalización
    (navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementationOnce(
      (success) => {
        success({
          coords: { latitude: 12.34, longitude: 56.78 },
        });
      }
    );

    // Mock de error de fetch
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<FiveDayClimate />);

    await waitFor(() => {
      expect(screen.getByText(/Error al obtener los datos del pronóstico/i)).toBeInTheDocument();
    });

    // Restaurar console.error
    consoleErrorMock.mockRestore();
  });

  it('muestra el pronóstico correctamente cuando la API responde con datos válidos', async () => {
    // Mock de éxito en la geolocalización
    (navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementationOnce(
      (success) => {
        success({ coords: { latitude: 12.34, longitude: 56.78 } });
      }
    );

    // Mock de respuesta de la API con datos de clima
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        list: [
          { dt_txt: '2025-02-07 12:00:00', main: { temp: 22, humidity: 55 }, weather: [{ icon: '01d', description: 'soleado' }] },
          { dt_txt: '2025-02-08 12:00:00', main: { temp: 18, humidity: 70 }, weather: [{ icon: '03d', description: 'parcialmente nublado' }] },
        ],
      }),
    });

    render(<FiveDayClimate />);

    await waitFor(() => {

      expect(screen.getByText(/soleado/i)).toBeInTheDocument();
      expect(screen.getByText(/22 °C/i)).toBeInTheDocument();
      expect(screen.getByText(/💧: 55%/i)).toBeInTheDocument();
      expect(screen.getByText(/parcialmente nublado/i)).toBeInTheDocument();
      expect(screen.getByText(/18 °C/i)).toBeInTheDocument();
    });
  });


  it('muestra mensaje de error cuando la API devuelve un objeto vacío', async () => {
    (navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementationOnce(
      (success) => {
        success({ coords: { latitude: 12.34, longitude: 56.78 } });
      }
    );

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({}), // Respuesta vacía
    });

    render(<FiveDayClimate />);

    await waitFor(() => {
      expect(screen.getByText(/Error al obtener los datos del pronóstico/i)).toBeInTheDocument();
    });
  });

  it('muestra exactamente 5 días de pronóstico si los datos están disponibles', async () => {
    (navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementationOnce(
      (success) => {
        success({ coords: { latitude: 12.34, longitude: 56.78 } });
      }
    );

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        list: [
          { dt_txt: '2025-02-07 12:00:00', main: { temp: 22, humidity: 55 }, weather: [{ icon: '01d', description: 'soleado' }] },
          { dt_txt: '2025-02-08 12:00:00', main: { temp: 18, humidity: 70 }, weather: [{ icon: '03d', description: 'parcialmente nublado' }] },
          { dt_txt: '2025-02-09 12:00:00', main: { temp: 20, humidity: 60 }, weather: [{ icon: '02d', description: 'nublado' }] },
          { dt_txt: '2025-02-10 12:00:00', main: { temp: 25, humidity: 50 }, weather: [{ icon: '04d', description: 'tormenta' }] },
          { dt_txt: '2025-02-11 12:00:00', main: { temp: 15, humidity: 80 }, weather: [{ icon: '09d', description: 'lluvia' }] },
          { dt_txt: '2025-02-12 12:00:00', main: { temp: 17, humidity: 65 }, weather: [{ icon: '10d', description: 'llovizna' }] }, // No debería mostrarse
        ],
      }),
    });

    render(<FiveDayClimate />);

    await waitFor(() => {
      const forecastItems = screen.getAllByTestId('weather-description');
      expect(forecastItems.length).toBe(5); // Verificar que solo haya 5 elementos
    });
  });
});
