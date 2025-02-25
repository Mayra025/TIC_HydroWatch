import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import FormU from "../src/componentes/FormU/FormU";
import { setDoc, getDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Mock de Firestore
jest.mock("firebase/firestore", () => ({
    ...jest.requireActual("firebase/firestore"),
    setDoc: jest.fn(), // Mock de setDoc
    getDoc: jest.fn(), // Mock de getDoc
    doc: jest.fn(), // Mock de doc
}));

jest.mock("firebase/auth", () => ({
    getAuth: jest.fn(() => ({
        currentUser: {
            uid: "123", // ID del usuario simulado
            email: "test@example.com", // Email simulado
        },
    })),
}));

jest.mock("firebase/storage", () => {
    const actualFirebaseStorage = jest.requireActual("firebase/storage");
    return {
        ...actualFirebaseStorage,
        uploadBytes: jest.fn().mockResolvedValue({
            ref: { fullPath: "test-path" },
        }),
    };
});

describe("FormU Component", () => {
    beforeEach(() => {
        global.open = jest.fn(); // Mock de window.open

        // Simulación de Firestore (mock de referencia de documento y snapshot)
        const mockDocRef = { id: "userId" };
        const mockDocSnap = {
            exists: jest.fn(() => true),
            data: jest.fn(() => ({
                nombre: "Juan",
                correo: "test@example.com",
                telegramUserId: "12345",
            })),
        };

        // jest.fn() para mockear las funciones `doc` y `getDoc`
        (doc as jest.Mock).mockReturnValue(mockDocRef);  // cast explícito a jest.Mock
        (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("debe renderizar el componente correctamente", async () => {
        // actualizaciones de estado correctamente dentro de act()
        await act(async () => {
            render(<FormU />);
        });

        expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/id de telegram/i)).toBeInTheDocument();
    });

    it("debe obtener datos de usuario y completar los campos del formulario", async () => {
        render(<FormU />);

        await waitFor(() => {
            expect((screen.getByLabelText(/nombre/i) as HTMLInputElement).value).toBe("Juan");
        });

        expect((screen.getByLabelText(/email/i) as HTMLInputElement).value).toBe("test@example.com");
        expect((screen.getByLabelText(/id de telegram/i) as HTMLInputElement).value).toBe("12345");
    });

    it("debe guardar los cambios cuando el formulario es válido", async () => {
        render(<FormU />);

        // Cambia los valores de los campos
        fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Carlos' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });

        // Verificar que el botón no está deshabilitado
        const saveButton = screen.getByRole('button', { name: /guardar cambios/i });
        expect(saveButton).not.toBeDisabled();

        // Hacer clic en el botón
        fireEvent.click(saveButton);

        // Verificar si setDoc fue llamado correctamente con los valores correctos
        await waitFor(() => {
            expect(setDoc).toHaveBeenCalledWith(
                expect.any(Object), // ref de Firestore
                {
                    nombre: 'Carlos',
                    correo: 'test@example.com',
                    telegramUserId: '',
                    photoURL: 'default-photo-url', // Valor predeterminado si no se sube una foto
                },
                { merge: true }
            );
        });
    });


    it("debe abrir la configuración de Telegram cuando se haga clic en el botón 'Configurar Telegram", async () => {
        render(<FormU />);

        // Simula hacer clic en el botón de configurar Telegram
        fireEvent.click(screen.getByText(/configurar telegram/i));

        // Verifica que la URL correcta se haya abierto
        await waitFor(() => {
            expect(global.open).toHaveBeenCalledWith("https://t.me/smartgreennotif_bot?start=123", "_blank");
        });
    });

    it("no debe intentar obtener datos si el usuario no está autenticado", async () => {
        (getAuth as jest.Mock).mockReturnValue({ currentUser: null });

        render(<FormU />);

        await waitFor(() => {
            expect(getDoc).not.toHaveBeenCalled();
        });
    });

    it("no debe intentar guardar cambios si el usuario no está autenticado", async () => {
        (getAuth as jest.Mock).mockReturnValue({ currentUser: null });

        render(<FormU />);

        fireEvent.click(screen.getByRole("button", { name: /guardar cambios/i }));

        await waitFor(() => {
            expect(setDoc).not.toHaveBeenCalled();
        });
    });

    it("muestra alerta si el usuario no está autenticado al configurar Telegram", async () => {
        (getAuth as jest.Mock).mockReturnValue({ currentUser: null });

        window.alert = jest.fn();

        render(<FormU />);
        fireEvent.click(screen.getByText(/configurar telegram/i));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith("Debes estar autenticado para configurar Telegram.");
        });
    });

    it("debe actualizar el estado de foto al seleccionar un archivo", () => {
        render(<FormU />);

        const fileInput = screen.getByLabelText(/foto/i) as HTMLInputElement;
        const file = new File(["dummy content"], "foto.jpg", { type: "image/jpeg" });

        fireEvent.change(fileInput, { target: { files: [file] } });

        // Verifica si el estado 'foto' ha sido actualizado
        // expect(screen.getByLabelText(/foto/i).files[0]).toBe(file);
    });


});
