import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ScoreBadge } from './ScoreBadge';

describe('ScoreBadge', () => {
  it('renders high score with percentage value and green color style', () => {
    const { container } = render(<ScoreBadge score={95} />);
    expect(screen.getByText('95%')).toBeInTheDocument();
    const span = container.querySelector('span');
    expect(span?.getAttribute('style')).toContain('color: rgb(16, 185, 129)');
  });

  it('renders warning score with amber color', () => {
    const { container } = render(<ScoreBadge score={72} />);
    expect(screen.getByText('72%')).toBeInTheDocument();
    const span = container.querySelector('span');
    expect(span?.getAttribute('style')).toContain('color: rgb(245, 158, 11)');
  });

  it('renders critical score with red color', () => {
    const { container } = render(<ScoreBadge score={45} />);
    expect(screen.getByText('45%')).toBeInTheDocument();
    const span = container.querySelector('span');
    expect(span?.getAttribute('style')).toContain('color: rgb(239, 68, 68)');
  });

  it('renders auditing state when loading', () => {
    render(<ScoreBadge score={0} loading={true} />);
    expect(screen.getByText(/Auditing/i)).toBeInTheDocument();
  });
});
