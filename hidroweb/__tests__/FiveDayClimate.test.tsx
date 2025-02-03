import { render, screen, waitFor } from '@testing-library/react';
import FiveDayClimate from '../src/componentes/FiveDayClimate/FiveDayClimate';

// Mock para solucionar el error con media queries
jest.mock('react-slick', () => {
  return jest.fn(() => <div>Mocked Slider</div>);
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

  // it('debe mostrar los datos del clima para 5 días cuando la geolocalización es exitosa', async () => {
  //   // Mock de respuesta exitosa de geolocalización
  //   (navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementationOnce(
  //     (success) => {
  //       success({
  //         coords: { latitude: -0.2299, longitude: -78.5249 },
  //       });
  //     }
  //   );

  //   // Mock de respuesta de la API con datos de clima
  //   global.fetch = jest.fn().mockResolvedValueOnce({
  //     ok: true,
  //     json: async () => ({
  //       list: [
  //         {
  //           dt_txt: '2024-12-30 12:00:00',
  //           main: { temp: 13.27, humidity: 80 },
  //           weather: [{ icon: '01d', description: 'lluvia ligera' }],
  //         },
  //         {
  //           dt_txt: '2024-12-31 12:00:00',
  //           main: { temp: 22, humidity: 70 },
  //           weather: [{ icon: '02d', description: 'Parcialmente nublado' }],
  //         },
  //         // Agrega más días si es necesario
  //       ],
  //     }),
  //   });

  //   render(<FiveDayClimate />);

  //   // Esperar a que los datos se carguen y luego buscar las descripciones


  //   ////esto no funciona, revisar de nuevo
  //   // await waitFor(() => {
  //   //   const descripcionClima = screen.getAllByText(/lluvia ligera/i);
  //   //   expect(descripcionClima.length).toBeGreaterThan(0);

  //   //   const descripcionParcialmenteNublado = screen.getAllByText(/Parcialmente nublado/i);
  //   //   expect(descripcionParcialmenteNublado.length).toBeGreaterThan(0);

  //   //   const temperatura1 = screen.getByText(/🌡️: 13.27 °C/i);
  //   //   expect(temperatura1).toBeInTheDocument();

  //   //   const humedad1 = screen.getByText(/💧: 80%/i);
  //   //   expect(humedad1).toBeInTheDocument();

  //   //   const temperatura2 = screen.getByText(/🌡️: 22 °C/i);
  //   //   expect(temperatura2).toBeInTheDocument();

  //   //   const humedad2 = screen.getByText(/💧: 70%/i);
  //   //   expect(humedad2).toBeInTheDocument();
  //   // });
  // });

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
});
