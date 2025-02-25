import { fireEvent, render, screen, waitFor, } from "@testing-library/react";
import "@testing-library/jest-dom";
import FormC from "../src/componentes/FormC/FormC";
import { ChakraProvider } from "@chakra-ui/react";

// Mock de Firebase
jest.mock("firebase/auth", () => ({
    getAuth: jest.fn(() => ({
        currentUser: { uid: "testUser123" },
    })),
}));

jest.mock("firebase/firestore", () => ({
    getFirestore: jest.fn(),
    collection: jest.fn(),
    doc: jest.fn(() => ({
        id: "testCultivoId",
    })),
    setDoc: jest.fn(),
    // setDoc: jest.fn().mockResolvedValue(undefined), // Asegura que devuelva una promesa resuelta

}));

describe("FormC Component", () => {
    const mockOnClose = jest.fn();
    const mockOnSave = jest.fn();

    let matchMediaSpy: jest.SpyInstance;

    // Mockear matchMedia solo para este archivo de prueba
    beforeAll(() => {
        matchMediaSpy = jest.spyOn(global, 'matchMedia').mockImplementation((query: string) => ({
            matches: false, // si la consulta de medios coincide o no
            media: query, // La consulta de medios
            onchange: null, //  manejador de eventos 
            addListener: jest.fn(), // mock para addListener
            removeListener: jest.fn(), // mock para removeListener
            addEventListener: jest.fn(), // mock para addEventListener
            removeEventListener: jest.fn(), // mock para removeEventListener
            dispatchEvent: jest.fn(), // mock para dispatchEvent
        }));
    });

    // Restaurar matchMedia después de las pruebas
    afterAll(() => {
        matchMediaSpy.mockRestore(); // Restaurar el comportamiento original
    });

    it("Renderiza el formulario con valores predeterminados al crear un nuevo cultivo", async () => {
        render(
            <ChakraProvider>
                <FormC
                    isOpen={true}
                    onClose={mockOnClose}
                    crop={null}
                    isCreating={true}
                    onSave={mockOnSave}
                />
            </ChakraProvider>
        );

        // Verificar encabezado de manera asincrónica
        const header = await screen.findByText("Crear Nuevo Cultivo");
        expect(header).toBeInTheDocument();
    });

    it("Renderiza el formulario con datos del cultivo al editar un cultivo existente", async () => {
        render(
            <ChakraProvider>
                <FormC
                    isOpen={true}
                    onClose={mockOnClose}
                    crop={{
                        id: "testCultivoId",
                        especie: "Butterhead",
                        variedad: "Butterhead",
                        fase: "Crecimiento",
                        fechaSiembra: "2024-12-15"
                    }}
                    isCreating={false}
                    onSave={mockOnSave}
                />
            </ChakraProvider>
        );

        // Esperar que el label esté presente
        await screen.findByText("Variedad de la especie");

        const variedadSelect = await screen.findByRole("combobox", { name: /variedad de la especie/i });

        // Type assertion para decirle a TypeScript que es un select
        const selectElement = variedadSelect as HTMLSelectElement;

        // Verificar que el valor de la opción seleccionada sea correcto
        expect(selectElement.value).toBe("Butterhead");

        // Verificar otros campos
        await screen.findByText("Fase de crecimiento");

        const faseSelect = await screen.findByRole("combobox", { name: /fase de crecimiento/i });
        const sElement = faseSelect as HTMLSelectElement;
        expect(sElement.value).toBe("Crecimiento");

        const fechaInput = screen.getByLabelText(/Fecha de Siembra/i);
        expect(fechaInput).toBeInTheDocument();
    });

    it("Actualiza los requerimientos cuando cambia la variedad o fase", async () => {
        render(
            <ChakraProvider>
                <FormC
                    isOpen={true}
                    onClose={mockOnClose}
                    crop={null}
                    isCreating={true}
                    onSave={mockOnSave}
                />
            </ChakraProvider>
        );

        const variedadSelect = screen.getByRole("combobox", { name: /variedad de la especie/i });
        fireEvent.change(variedadSelect, { target: { value: "Butterhead" } });

        const faseSelect = screen.getByRole("combobox", { name: /fase de crecimiento/i });
        fireEvent.change(faseSelect, { target: { value: "Crecimiento" } });

        await waitFor(() => {
            expect(screen.getByText(/pH Óptimo/i)).toBeInTheDocument();
            expect(screen.getByText(/Temperatura Óptima/i)).toBeInTheDocument();
            expect(screen.getByText(/Nivel de Agua/i)).toBeInTheDocument();
        });
    });

    it("Cierra el formulario al hacer clic en el botón de cerrar", () => {
        render(
            <ChakraProvider>
                <FormC
                    isOpen={true}
                    onClose={mockOnClose}
                    crop={null}
                    isCreating={true}
                    onSave={mockOnSave}
                />
            </ChakraProvider>
        );

        const closeButton = screen.getByRole("button", { name: /close/i });
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalled();
    });


});
