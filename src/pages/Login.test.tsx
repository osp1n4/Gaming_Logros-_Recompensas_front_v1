import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './Login';
import { authService } from '../services/auth.service';

// Mock del servicio de autenticación
vi.mock('../services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn()
  }
}));

// Mock de react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const renderLogin = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('renders login form correctly', () => {
    renderLogin();
    
    expect(screen.getByText('Gaming Rewards')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    renderLogin();
    
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/email es requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/contraseña es requerida/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    renderLogin();
    
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');
    
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid credentials', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      player: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        createdAt: new Date().toISOString()
      },
      message: 'Login successful'
    };

    (authService.login as any).mockResolvedValue(mockResponse);
    
    renderLogin();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123');
    
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123'
      });
    });
  });

  it('switches to register form when clicking register link', async () => {
    const user = userEvent.setup();
    renderLogin();
    
    const registerLink = screen.getByText(/regístrate aquí/i);
    await user.click(registerLink);
    
    await waitFor(() => {
      expect(screen.getByText(/crear cuenta/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/nombre de usuario/i)).toBeInTheDocument();
    });
  });
});

describe('Register Form', () => {
  it('shows validation errors for password mismatch', async () => {
    const user = userEvent.setup();
    renderLogin();
    
    // Switch to register
    const registerLink = screen.getByText(/regístrate aquí/i);
    await user.click(registerLink);
    
    await waitFor(() => {
      expect(screen.getByText(/crear cuenta/i)).toBeInTheDocument();
    });
    
    const passwordInput = screen.getByLabelText(/^contraseña$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i);
    
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'DifferentPass123');
    
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/contraseñas no coinciden/i)).toBeInTheDocument();
    });
  });

  it('validates password requirements', async () => {
    const user = userEvent.setup();
    renderLogin();
    
    const registerLink = screen.getByText(/regístrate aquí/i);
    await user.click(registerLink);
    
    await waitFor(() => {
      expect(screen.getByText(/crear cuenta/i)).toBeInTheDocument();
    });
    
    const passwordInput = screen.getByLabelText(/^contraseña$/i);
    await user.type(passwordInput, 'weak');
    
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/debe tener al menos 8 caracteres/i)).toBeInTheDocument();
    });
  });
});
