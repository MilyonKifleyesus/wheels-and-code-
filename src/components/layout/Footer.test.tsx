import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer';

describe('Footer', () => {
  it('renders the footer with brand name and copyright', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    // Check for brand name
    expect(screen.getByText('MIKEY G AUTO')).toBeInTheDocument();

    // Check for copyright notice
    const currentYear = new Date().getFullYear();
    const copyrightText = `© ${currentYear} APEX AUTO SALES & REPAIR. All rights reserved.`;
    expect(screen.getByText(copyrightText)).toBeInTheDocument();
  });

  it('renders quick links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByText('QUICK LINKS')).toBeInTheDocument();
    expect(screen.getByText('Inventory')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Book Service')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders services list', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByText('SERVICES')).toBeInTheDocument();
    expect(screen.getByText('Oil Change')).toBeInTheDocument();
    expect(screen.getByText('Brake Service')).toBeInTheDocument();
  });

  it('renders contact information', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByText('CONTACT')).toBeInTheDocument();
    expect(screen.getByText('(416) 916-6475')).toBeInTheDocument();
    expect(screen.getByText('179 Weston Rd, Toronto, ON M6N 3A5')).toBeInTheDocument();
  });
});
