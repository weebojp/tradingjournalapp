import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegisterForm } from '../RegisterForm';

describe('RegisterForm', () => {
  const mockOnRegister = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render register form with all required fields', () => {
    render(<RegisterForm onRegister={mockOnRegister} loading={false} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('should call onRegister with form data when submitted', async () => {
    render(<RegisterForm onRegister={mockOnRegister} loading={false} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const registerButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(mockOnRegister).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });
    });
  });

  test('should show validation errors for empty fields', async () => {
    render(<RegisterForm onRegister={mockOnRegister} loading={false} />);

    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
      expect(screen.getByText('Confirm password is required')).toBeInTheDocument();
    });

    expect(mockOnRegister).not.toHaveBeenCalled();
  });

  test('should show error when passwords do not match', async () => {
    render(<RegisterForm onRegister={mockOnRegister} loading={false} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const registerButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });

    expect(mockOnRegister).not.toHaveBeenCalled();
  });

  test('should show error for invalid email format', async () => {
    render(<RegisterForm onRegister={mockOnRegister} loading={false} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const registerButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });

    expect(mockOnRegister).not.toHaveBeenCalled();
  });

  test('should disable form when loading', () => {
    render(<RegisterForm onRegister={mockOnRegister} loading={true} />);

    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/^password$/i)).toBeDisabled();
    expect(screen.getByLabelText(/confirm password/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /registering.../i })).toBeDisabled();
  });

  test('should show error message when provided', () => {
    const errorMessage = 'Email already exists';
    render(<RegisterForm onRegister={mockOnRegister} loading={false} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toHaveClass('text-danger-500');
  });
});