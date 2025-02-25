import { render, screen } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import { useAlerts } from "../src/context/AlertContext";
import Notif from "../src/componentes/Notif/Notif";

// Mock del contexto
jest.mock("../src/context/AlertContext", () => ({
    useAlerts: jest.fn(),
}));

describe("Notif Component", () => {
    it("Renderiza las alertas correctamente", () => {
        const activeAlerts = [
            {
                cultivoId: "1",
                especie: "Lechuga",
                variedad: "Butterhead",
                color: "red.500",
                requerimientos: {
                    temperatura: { min: 18, max: 24 },
                    ph: { min: 5.5, max: 6.5 },
                    nivelAgua: "Alto",
                },
                currentTemp: 27,
                currentPh: 6.8,
                currentWaterLevel: 70,
                error: true,
            },
        ];

        (useAlerts as jest.Mock).mockReturnValue({ activeAlerts });

        render(
            <ChakraProvider>
                <Notif />
            </ChakraProvider>
        );

        // Verificar el contenido fragmentado usando un matcher personalizado
        expect(
            screen.getByText((_content, element) => {
                const text = element?.textContent?.trim();
                return text === "Temperatura requerida: 18°C - 24°C";
            })
        ).toBeInTheDocument();

        expect(
            screen.getByText((_content, element) => {
                const text = element?.textContent?.trim();
                return text === "pH requerido: 5.5 - 6.5";
            })
        ).toBeInTheDocument();

        expect(
            screen.getByText((_content, element) => {
                const text = element?.textContent?.trim();
                return text === "Nivel de agua requerido: Alto";
            })
        ).toBeInTheDocument();
    });

    it("no renderiza ninguna alerta cuando activeAlerts está vacío", () => {
        // Simular el valor de `useAlerts` con una lista vacía
        (useAlerts as jest.Mock).mockReturnValue({ activeAlerts: [] });

        // Renderizar el componente
        render(
            <ChakraProvider>
                <Notif />
            </ChakraProvider>
        );

        // Verificar que no se renderizan alertas
        expect(screen.queryByText(/Cultivo:/i)).not.toBeInTheDocument();
    });

    it("Maneja correctamente alertas sin datos completos", () => {
        const activeAlerts = [
            {
                cultivoId: "2",
                especie: null,
                variedad: null,
                color: "green.500",
                requerimientos: {}, // Sin requerimientos
                currentTemp: null,
                currentPh: null,
                currentWaterLevel: null,
                error: true,
            },
        ];
    
        (useAlerts as jest.Mock).mockReturnValue({ activeAlerts });
    
        render(
            <ChakraProvider>
                <Notif />
            </ChakraProvider>
        );
    
        expect(screen.getByText(/Cultivo: Desconocido - Variedad no especificada/i)).toBeInTheDocument();
      
        expect(
            screen.getByText((_content, element) => {
              const text = element?.textContent?.replace(/\s+/g, " ").trim();
              return text === "Temperatura requerida: N/A°C - N/A°C";
            })
          ).toBeInTheDocument();
          
       
        expect(
            screen.getByText((_content, element) => {
              const text = element?.textContent?.replace(/\s+/g, " ").trim();
              return text === "pH requerido: N\/A - N\/A";
            })
          ).toBeInTheDocument();
          
    
        
        expect(
            screen.getByText((_content, element) => {
              const text = element?.textContent?.replace(/\s+/g, " ").trim();
              return text === "Nivel de agua requerido: N\/A";
            })
          ).toBeInTheDocument();
        expect(screen.getByText(/Error: Los datos no se han actualizado/i)).toBeInTheDocument();
    });
    
});
