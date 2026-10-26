import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusChip } from './StatusChip';

describe('StatusChip', () => {
  it('renders running status with auditing label', () => {
    render(<StatusChip kind="running" />);
    expect(screen.getByText('Auditing…')).toBeInTheDocument();
  });

  it('renders complete status label', () => {
    render(<StatusChip kind="complete" />);
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('renders failed status label', () => {
    render(<StatusChip kind="failed" />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('renders severity chips (critical, major, minor)', () => {
    const { rerender } = render(<StatusChip kind="critical" />);
    expect(screen.getByText('Critical')).toBeInTheDocument();

    rerender(<StatusChip kind="medium" />);
    expect(screen.getByText('Medium')).toBeInTheDocument();

    rerender(<StatusChip kind="low" />);
    expect(screen.getByText('Low')).toBeInTheDocument();
  });
});
