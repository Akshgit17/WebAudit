import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { LandingPage } from './LandingPage';
import { AuthProvider } from '../context/AuthContext';

describe('LandingPage', () => {
  it('renders WebAudit branding and title', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LandingPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('WebAudit')).toBeInTheDocument();
    expect(
      screen.getByText(/Audit your website the way a user/i)
    ).toBeInTheDocument();
  });

  it('validates URL input and shows error for empty or local host', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LandingPage />
        </AuthProvider>
      </BrowserRouter>
    );

    const button = screen.getByRole('button', { name: /Start Audit/i });
    fireEvent.click(button);

    expect(await screen.findByText('Enter a website URL.')).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/Enter a website URL/i);
    fireEvent.change(input, { target: { value: 'localhost' } });
    fireEvent.click(button);

    expect(
      await screen.findByText("We can't audit local addresses. Try a public URL.")
    ).toBeInTheDocument();
  });
});
