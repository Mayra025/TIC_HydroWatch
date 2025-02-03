import { render, screen } from '@testing-library/react';
import Footer from '../src/componentes/Footer/Footer';

describe('Footer Component', () => {
    it('renderiza el pie de página con el texto correcto', () => {
        render(<Footer />);
        
        const footerElement = screen.getByRole('contentinfo');
        expect(footerElement).toHaveTextContent(/© 2025 HydroWatch \(TIC\) - Facultad de Sistemas EPN\./i);

    });
});
