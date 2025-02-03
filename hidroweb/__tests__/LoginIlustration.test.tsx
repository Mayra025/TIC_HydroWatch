import { render, screen } from "@testing-library/react";
import LoginIllustration from "../src/componentes/LoginIllustration/LoginIllustration";
import { ChakraProvider } from "@chakra-ui/react";

jest.mock("../src/assets/lo.png", () => "test-file-stub");

describe("LoginIllustration", () => {
  it("renderiza el componente correctamente", () => {
    render(
      <ChakraProvider>
        <LoginIllustration illustrationBackground="background.png">
          <div>Test content</div>
        </LoginIllustration>
      </ChakraProvider>
    );

    // Verifica que el contenido pasado como children se renderice
    expect(screen.getByText("Test content")).toBeInTheDocument();

    // Verifica que la imagen esté presente
    const img = screen.getByAltText("PNG icon");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "test-file-stub");

    // Verifica el fondo usando estilos calculados
    const illustrationBox = screen.getByTestId("illustration-box");
    const styles = window.getComputedStyle(illustrationBox);
    expect(styles.backgroundImage).toContain("background.png");
  });

  it("debe aplicar el estilo de fondo correctamente", () => {
    render(
      <ChakraProvider>
        <LoginIllustration illustrationBackground="test-background.png">
          <div>Test content</div>
        </LoginIllustration>
      </ChakraProvider>
    );

    // Verifica el fondo usando estilos calculados
    const illustrationBox = screen.getByTestId("illustration-box");
    const styles = window.getComputedStyle(illustrationBox);
    expect(styles.backgroundImage).toContain("test-background.png");
  });
});
