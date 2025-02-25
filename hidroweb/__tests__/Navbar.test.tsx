import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import Navbar from '../src/componentes/Navbar/Navbar';
import { signOut, } from 'firebase/auth';

jest.mock('firebase/app', () => ({
  auth: jest.fn().mockReturnValue({
    currentUser: {
      displayName: 'Alexandra',
      email: 'alex@example.com',
      photoURL: 'photo_url',
    },
  }),
}));

jest.useFakeTimers();  // Para manejar el tiempo en las pruebas


jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: 'user123' },
  })),
  signOut: jest.fn(() => Promise.resolve()), // Devuelve una promesa resuelta
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn((_, collection, id) => ({ collection, id })),
  getDoc: jest.fn(async () => ({
    exists: () => true,
    data: () => ({
      nombre: 'John',
      // apellido: 'Doe',
      photoURL: null,
    }),
  })),
}));

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: jest.fn(),
  };
});


describe('Navbar Component', () => {
  beforeAll(() => {
    jest.spyOn(global, 'matchMedia').mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });



  it('Renderiza la barra de navegación con todos los elementos', async () => {
    // await act(async () => {

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    // });

    expect(screen.getByText(/HydroWatch/i)).toBeInTheDocument();
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Cultivos/i)).toBeInTheDocument();
    expect(screen.getByText(/Consultas/i)).toBeInTheDocument();
  });



  it('Gestiona correctamente el cierre de sesión', async () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const logoutButton = screen.getByText('Salir');
    fireEvent.click(logoutButton);

    // Espera que la promesa de signOut sea llamada
    await waitFor(() => expect(signOut).toHaveBeenCalled());
  });


  it('Muestra la fecha y hora actuales', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const today = new Date();
    const formattedDate = today.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    expect(screen.getByText(new RegExp(formattedDate, 'i'))).toBeInTheDocument();
  });



  const mockNavigate = jest.fn();
  (useNavigate as jest.Mock).mockImplementation(() => mockNavigate);

  it('Navega a la configuración del perfil cuando se hace clic en la opción Perfil', async () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const profileOption = screen.getByText(/Configuración de Perfil/i);

    await waitFor(() => {
      expect(profileOption).toBeInTheDocument();
    });

    fireEvent.click(profileOption);

    expect(mockNavigate).toHaveBeenCalledWith('/app/profile');
  });


  it('Navega a la página correspondiente cuando se hace clic en un enlace', async () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const dashboardLink = screen.getByText(/Dashboard/i);
    fireEvent.click(dashboardLink);

    // Verifica que la navegación se haya realizado correctamente a la página esperada
    expect(mockNavigate).toHaveBeenCalledWith('/app/profile');
  });

  jest.useFakeTimers();  // Activar temporizadores falsos

  it('debería actualizar la hora cada segundo', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Simular el paso de 1000 ms (1 segundo)
    jest.advanceTimersByTime(1000);

    // Asegúrate de que el estado de currentTime haya cambiado
    expect(screen.getByText(/Hoy:/)).toBeInTheDocument();

    // Limpiar temporizadores después de la prueba
    jest.useRealTimers();
  });

});
