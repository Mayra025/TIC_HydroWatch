import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import FormR from "../src/componentes/FormR/FormR";
import axios from "axios";

// Mock de axios
jest.mock("axios");

// Mock de useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate, // Mockear el hook useNavigate
}));

beforeEach(() => {
    jest.useFakeTimers(); // Simula el control del tiempo
});

afterEach(() => {
    jest.useRealTimers(); // Restaura los temporizadores después de la prueba
});

describe("FormR Component", () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;

    it("debería mostrar un mensaje de éxito al registrarse correctamente", async () => {
        // Mockear una respuesta exitosa de la API
        mockedAxios.post.mockResolvedValueOnce({
            status: 201,
            data: { message: "¡Registro exitoso!" },
        });

        // Renderizar el componente
        render(
            <MemoryRouter>
                <ChakraProvider>
                    <FormR />
                </ChakraProvider>
            </MemoryRouter>
        );

        // Simular ingreso de valores en los campos
        fireEvent.change(screen.getByPlaceholderText("Tu nombre o un alias"), { target: { value: "John" } });
        fireEvent.change(screen.getByPlaceholderText("mail@simmmple.com"), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("Min. 8 characters"), {
            target: { value: "password123" },
        });

        // Simular clic en el botón de registro
        fireEvent.click(screen.getByText("Regístrate"));

        // Verificar que se llame a la API con los valores correctos
        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalledWith("http://localhost:5000/api/auth/register", {
                name: "John",
                email: "test@example.com",
                password: "password123",
            });
        });

        // Esperar a que el mensaje de éxito sea visible
        await waitFor(() => {
            expect(screen.getByText('¡Registro exitoso! Redirigiendo...')).toBeInTheDocument();
        });

        // Avanzar el tiempo para que el setTimeout se ejecute
        jest.runAllTimers();

        // Verificar que la redirección haya ocurrido
        expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    it("debería mostrar un mensaje de error si ocurre un fallo en el registro", async () => {
        // Mockear un fallo en la API
        mockedAxios.post.mockRejectedValueOnce({
            response: {
                data: { error: "Email ya registrado." },
            },
        });

        // Renderizar el componente
        render(
            <MemoryRouter>
                <ChakraProvider>
                    <FormR />
                </ChakraProvider>
            </MemoryRouter>
        );

        // Simular ingreso de valores en los campos
        fireEvent.change(screen.getByPlaceholderText("Tu nombre o un alias"), { target: { value: "John" } });
        fireEvent.change(screen.getByPlaceholderText("mail@simmmple.com"), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("Min. 8 characters"), {
            target: { value: "password123" },
        });

        // Simular clic en el botón de registro
        fireEvent.click(screen.getByText("Regístrate"));

        // Verificar que se llame a la API con los valores correctos
        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalledWith("http://localhost:5000/api/auth/register", {
                name: "John",
                email: "test@example.com",
                password: "password123",
            });
        });

        // Verificar que el mensaje de error se muestre
        await waitFor(() => {
            expect(screen.getByText('Error desconocido en el registro.')).toBeInTheDocument();
        });
    });


    it("debería mostrar un mensaje de error si ocurre un fallo desconocido", async () => {
        // Mockear un fallo desconocido (error no relacionado con Axios)
        mockedAxios.post.mockRejectedValueOnce(new Error("Error desconocido"));

        // Renderizar el componente
        render(
            <MemoryRouter>
                <ChakraProvider>
                    <FormR />
                </ChakraProvider>
            </MemoryRouter>
        );

        // Simular ingreso de valores en los campos
        fireEvent.change(screen.getByPlaceholderText("Tu nombre o un alias"), { target: { value: "John" } });
        fireEvent.change(screen.getByPlaceholderText("mail@simmmple.com"), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("Min. 8 characters"), {
            target: { value: "password123" },
        });

        // Simular clic en el botón de registro
        fireEvent.click(screen.getByText("Regístrate"));

        // Verificar que se llame a la API con los valores correctos
        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalledWith("http://localhost:5000/api/auth/register", {
                name: "John",
                email: "test@example.com",
                password: "password123",
            });
        });

        // Verificar que el mensaje de error desconocido se muestre
        await waitFor(() => {
            expect(screen.getByText('Error desconocido en el registro.')).toBeInTheDocument();
        });
    });

    it("debería eliminar el mensaje de error si el registro es exitoso", async () => {
        // Mockear la respuesta de error
        mockedAxios.post.mockRejectedValueOnce({
            response: {
                data: { error: "Email ya registrado." },
            },
        });

        render(
            <MemoryRouter>
                <ChakraProvider>
                    <FormR />
                </ChakraProvider>
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText("Tu nombre o un alias"), { target: { value: "John" } });
        fireEvent.change(screen.getByPlaceholderText("mail@simmmple.com"), { target: { value: "test@example.com" } });
        fireEvent.change(screen.getByPlaceholderText("Min. 8 characters"), { target: { value: "password123" } });

        fireEvent.click(screen.getByText("Regístrate"));

        // Verificar el mensaje de error
        await waitFor(() => {
            expect(screen.getByText('Error desconocido en el registro.')).toBeInTheDocument();
        });

        // Mockear un registro exitoso
        mockedAxios.post.mockResolvedValueOnce({
            status: 201,
            data: { message: "¡Registro exitoso!" },
        });

        // Simular otro clic en el botón de registro
        fireEvent.click(screen.getByText("Regístrate"));

        // Verificar que el mensaje de error ya no esté presente y que el mensaje de éxito sea mostrado
        await waitFor(() => {
            expect(screen.queryByText('Error desconocido en el registro.')).not.toBeInTheDocument();
            expect(screen.getByText('¡Registro exitoso! Redirigiendo...')).toBeInTheDocument();
        });
    });



});
