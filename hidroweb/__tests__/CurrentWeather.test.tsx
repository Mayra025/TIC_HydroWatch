import { render, screen, waitFor } from '@testing-library/react';
import CurrentWeather from '../src/componentes/CurrentWeather/CurrentWeather';

describe('CurrentWeather Component', () => {
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

    it('debe mostrar los datos del clima cuando la geolocalización es exitosa', async () => {
        // Mock de respuesta exitosa de geolocalización
        (navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementationOnce(
            (success) => {
                success({
                    coords: { latitude: -0.2299, longitude: -78.5249 },
                });
            }
        );

        // Mock de fetch para la API del clima
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                name: 'Quito',
                main: { temp: 18, humidity: 70 },
                weather: [{ description: 'nublado', icon: '04d' }],
            }),
        });

        render(<CurrentWeather />);

        await waitFor(() => {
            expect(screen.getByText(/Clima Actual en tu zona: Quito/i)).toBeInTheDocument();
        });

        expect(screen.getByText(/Temperatura: 18 °C/i)).toBeInTheDocument();
        expect(screen.getByText(/Humedad: 70%/i)).toBeInTheDocument();
        expect(screen.getByText(/Condición: nublado/i)).toBeInTheDocument();
    });

    it('debe mostrar un mensaje de error si la geolocalización falla', async () => {
        // Mock de error de geolocalización
        (navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementationOnce(
            (_, error) => {
                error({ message: 'Geolocalización no permitida' });
            }
        );

        render(<CurrentWeather />);

        await waitFor(() => {
            expect(
                screen.getByText(/No se pudo obtener la ubicación/i)
            ).toBeInTheDocument();
        });
    });

    it('debe mostrar un mensaje de error si fetch falla', async () => {
        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => { });

        // Mock de respuesta exitosa de geolocalización
        (navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementationOnce(
            (success) => {
                success({
                    coords: { latitude: -0.2299, longitude: -78.5249 },
                });
            }
        );

        // Mock de error de fetch
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: false,
        });

        render(<CurrentWeather />);

        await waitFor(() => {
            expect(
                screen.getByText(/Error al obtener los datos del clima/i)
            ).toBeInTheDocument();
        });

        // Restaurar console.error
        consoleErrorMock.mockRestore();
    });


    it('debe mostrar un mensaje si los datos del clima son inválidos', async () => {
        (navigator.geolocation.getCurrentPosition as jest.Mock).mockImplementationOnce(
            (success) => {
                success({
                    coords: { latitude: -0.2299, longitude: -78.5249 },
                });
            }
        );

        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({}), // Respuesta vacía
        });

        render(<CurrentWeather />);

        await waitFor(() => {
            expect(screen.getByText(/No se pudieron cargar los datos del clima/i)).toBeInTheDocument();
        });
    });

    

});
