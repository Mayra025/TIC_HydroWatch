import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import ProtectedRoute from '../src/componentes/ProtectedRoute/ProtectedRoute'; 
import { onAuthStateChanged } from 'firebase/auth';

// Mock de Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

describe('ProtectedRoute', () => {
  test('debe renderizar los elementos secundarios si el usuario está autenticado', async () => {
    // Simula que el usuario está autenticado
    const mockUser = { uid: '123', email: 'user@example.com' };
    (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
      callback(mockUser);
      return jest.fn(); // Simula unsubscribe
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Verifica si el contenido protegido es renderizado
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  test('debe redirigir a /login si el usuario no está autenticado', async () => {
    // Simula que no hay usuario autenticado
    (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
      callback(null);
      return jest.fn(); // Simula unsubscribe
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Verifica que el contenido protegido no se renderiza
    await waitFor(() => expect(screen.queryByText('Protected Content')).not.toBeInTheDocument());

    // Verifica que se ha redirigido, usando que el contenido cargado es de /login
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  test('Debería mostrar el estado de carga mientras se verifica la autenticación', async () => {
    // Simula el estado de carga mientras se verifica la autenticación
    (onAuthStateChanged as jest.Mock).mockImplementation((_auth, _callback) => {
      // No llama al callback, por lo que se mantiene en el estado de carga.
      return jest.fn();
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Verifica que se muestra el mensaje de "Loading..."
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
