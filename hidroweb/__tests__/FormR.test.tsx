import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import FormR from "../src/componentes/FormR/FormR";
import axios from "axios";

// Mock de axios
jest.mock("axios");

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

        // Verificar que el mensaje de éxito se muestre
        expect(screen.getByText('¡Registro exitoso! Redirigiendo...')).toBeInTheDocument();

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
        expect(screen.getByText((content, _element) => {
            return content.includes('Error desconocido en el registro.');
        })).toBeInTheDocument();

    });
});
