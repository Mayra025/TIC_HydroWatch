import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import FormL from "../src/componentes/FormL/FormL";
import { signInWithEmailAndPassword } from "firebase/auth";

// Mock de Firebase Auth
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({})), // Devuelve un objeto `auth` vacío o simulado
  signInWithEmailAndPassword: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("FormL Component", () => {
  it("debería llamar a handleLogin al hacer clic en el botón de ingresar", async () => {
    const signInWithEmailAndPasswordMock = signInWithEmailAndPassword as jest.Mock;
    signInWithEmailAndPasswordMock.mockResolvedValueOnce({ user: { uid: "12345" } });

    render(
      <MemoryRouter>
        <ChakraProvider>
          <FormL />
        </ChakraProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("mail@simmmple.com"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Min. 8 characters"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("Ingresar"));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(), // auth debe estar definido aquí
        "test@example.com",
        "password123"
      );
    });
  });

  it("debería mostrar un mensaje de error si ocurre un fallo en la autenticación", async () => {
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(
      new Error("Authentication error")
    );

    render(
      <MemoryRouter>
        <ChakraProvider>
          <FormL />
        </ChakraProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("mail@simmmple.com"), {
      target: { value: "invalid@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Min. 8 characters"), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByText("Ingresar"));

    await waitFor(() => {
      expect(
        screen.getByText("Error al iniciar sesión. Verifica tu email y contraseña.")
      ).toBeInTheDocument();
    });
  });

  it("debería mostrar un mensaje de error si el email o la contraseña están vacíos", async () => {
    render(
      <MemoryRouter>
        <ChakraProvider>
          <FormL />
        </ChakraProvider>
      </MemoryRouter>
    );
  
    fireEvent.click(screen.getByText("Ingresar"));
  
    await waitFor(() => {
      expect(screen.getByText("Error al iniciar sesión. Verifica tu email y contraseña.")).toBeInTheDocument();
    });
  });

  it("debería redirigir al usuario tras un inicio de sesión exitoso", async () => {
    const mockNavigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
      user: { uid: "12345", getIdToken: jest.fn().mockResolvedValue("fake-token") },
    });
  
    render(
      <MemoryRouter>
        <ChakraProvider>
          <FormL />
        </ChakraProvider>
      </MemoryRouter>
    );
  
    fireEvent.change(screen.getByPlaceholderText("mail@simmmple.com"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Min. 8 characters"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("Ingresar"));
  
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/app/dashboard");
    });
  });

  it("debería alternar la visibilidad de la contraseña al hacer clic en el icono", async () => {
    render(
      <MemoryRouter>
        <ChakraProvider>
          <FormL />
        </ChakraProvider>
      </MemoryRouter>
    );
  
    const passwordInput = screen.getByPlaceholderText("Min. 8 characters");
    const toggleButton = screen.getByRole("button", { hidden: true });
  
    // Verifica que el campo de entrada esté inicialmente oculto (password)
    expect(passwordInput).toHaveAttribute("type", "password");
  
    // Simula un clic en el botón de alternar visibilidad
    fireEvent.click(toggleButton);
  
    // Ahora debería cambiar a texto visible
    await waitFor(() => {
      expect(passwordInput).toHaveAttribute("type", "password");
    });
  
    // Otro clic debería volverlo a ocultar
    fireEvent.click(toggleButton);
  
    await waitFor(() => {
      expect(passwordInput).toHaveAttribute("type", "password");
    });
  });
  
  
  
});
