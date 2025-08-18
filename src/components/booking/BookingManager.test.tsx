import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BookingProvider } from '../../contexts/BookingContext';
import BookingManager from './BookingManager';
import { vi } from 'vitest';

// Mock the Toast component
vi.mock('../ui/Toast', () => ({
  __esModule: true,
  default: () => <div data-testid="toast"></div>,
}));

describe('BookingManager', () => {
  beforeEach(() => {
    render(
      <BookingProvider>
        <BookingManager />
      </BookingProvider>
    );
  });

  it('should render the list of initial bookings', () => {
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
  });

  it('should filter bookings by search term', async () => {
    const searchInput = screen.getByPlaceholderText(/Search bookings/);
    fireEvent.change(searchInput, { target: { value: 'John Smith' } });

    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.queryByText('Sarah Johnson')).not.toBeInTheDocument();
    });
  });

  it('should filter bookings by status', async () => {
    const statusFilter = screen.getByDisplayValue('All Status');
    fireEvent.change(statusFilter, { target: { value: 'pending' } });

    await waitFor(() => {
      expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    });
  });

  it('should open the add booking modal and add a new booking', async () => {
    fireEvent.click(screen.getByText('ADD BOOKING'));

    // The modal should appear
    await screen.findByText('ADD NEW BOOKING');

    // Fill the form
    fireEvent.change(screen.getByPlaceholderText('Customer Name'), { target: { value: 'Test Customer' } });
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), { target: { value: '555-555-5555' } });
    fireEvent.change(screen.getByPlaceholderText('Email Address'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Vehicle (Year Make Model)'), { target: { value: '2025 Test Car' } });
    fireEvent.change(screen.getByLabelText('Service'), { target: { value: 'Tire Service' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2025-12-12' } });
    fireEvent.change(screen.getByLabelText('Time'), { target: { value: '3:00 PM' } });

    // Submit
    const addModal = screen.getByRole('dialog', { name: 'ADD NEW BOOKING' });
    const submitButton = within(addModal).getByRole('button', { name: 'ADD BOOKING' });
    fireEvent.click(submitButton);

    // Check if the new booking is in the list
    await waitFor(() => {
      expect(screen.getByText('Test Customer')).toBeInTheDocument();
    });
  });

  it('should open the edit modal and update a booking', async () => {
    // Find the edit button for John Smith's booking and click it
    const editButtons = screen.getAllByRole('button', { name: /EDIT/i });
    fireEvent.click(editButtons[0]);

    const editModal = await screen.findByRole('dialog', { name: 'EDIT BOOKING' });

    const nameInput = within(editModal).getByDisplayValue('John Smith');
    fireEvent.change(nameInput, { target: { value: 'John Smith Updated' } });

    fireEvent.click(within(editModal).getByRole('button', { name: 'SAVE CHANGES' }));

    await waitFor(() => {
      expect(screen.getByText('John Smith Updated')).toBeInTheDocument();
    });
  });

  it('should delete a booking', async () => {
    // Mock window.confirm
    window.confirm = vi.fn(() => true);

    // Open the edit modal for the first booking
    const editButtons = screen.getAllByRole('button', { name: /EDIT/i });
    fireEvent.click(editButtons[0]);

    const editModal = await screen.findByRole('dialog', { name: 'EDIT BOOKING' });

    // Click the delete button inside the modal
    const deleteBtn = within(editModal).getByRole('button', { name: 'DELETE' });
    fireEvent.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
    });
  });
});
