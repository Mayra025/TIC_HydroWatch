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
    await waitFor(async () => {
      render(
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      );
    });

    expect(screen.getByText('HydroWatch')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Cultivos')).toBeInTheDocument();
    expect(screen.getByText('Consultas')).toBeInTheDocument();

  });

  it('renderiza las iniciales del usuario cuando los datos del usuario están disponibles', async () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const avatar = await screen.findByRole('img', { name: 'John' });
    expect(avatar).toBeInTheDocument();
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



  //   const mockNavigate = jest.fn();
  //   jest.mock('react-router-dom', () => ({
  //     ...jest.requireActual('react-router-dom'),
  //     useNavigate: () => mockNavigate,
  //   }));

  //   const mockUser: User = {
  //     displayName: 'Test User',
  //     uid: '123',
  //     emailVerified: true,
  //     isAnonymous: false,
  //     metadata: { creationTime: '2024-01-01', lastSignInTime: '2024-01-01' },
  //     providerData: [],
  //     providerId: 'password',
  //     refreshToken: 'some-refresh-token',
  //     phoneNumber: null,
  //     photoURL: null,
  //     email: 'testuser@example.com',
  //     tenantId: null,
  //     delete: function (): Promise<void> {
  //       throw new Error('Function not implemented.');
  //     },
  //     getIdToken: function (_forceRefresh?: boolean): Promise<string> {
  //       throw new Error('Function not implemented.');
  //     },
  //     getIdTokenResult: function (_forceRefresh?: boolean): Promise<IdTokenResult> {
  //       throw new Error('Function not implemented.');
  //     },
  //     reload: function (): Promise<void> {
  //       throw new Error('Function not implemented.');
  //     },
  //     toJSON: function (): object {
  //       throw new Error('Function not implemented.');
  //     }
  //   };

  //   // Simula los datos del usuario en el contexto de Firebase
  //   jest.spyOn(auth, 'onAuthStateChanged').mockImplementation((callback) => {
  //     if (typeof callback === 'function') {
  //       callback(mockUser);  // Llama al callback con el usuario simulado
  //     }

  //     // Devuelve una función de desuscripción
  //     return () => {
  //       console.log('Desuscrito');
  //     };
  //   });

  //   render(
  //     <MemoryRouter>
  //       <Navbar />
  //     </MemoryRouter>
  //   );

  //   const profileButton = screen.getByText('Configuración de Perfil');

  //   await act(async () => {
  //     fireEvent.click(profileButton);
  //   });

  //   expect(mockNavigate).toHaveBeenCalledWith('/app/profile');
  // });

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
});
