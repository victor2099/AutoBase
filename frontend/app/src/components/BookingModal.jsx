import { useState } from 'react';
import { bookingAPI } from '../services/api';
import '../styles/BookingModal.css';

export default function BookingModal({ car, onClose, onSuccess }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);

  const calculateTotal = (start, end) => {
    if (start && end) {
      const startD = new Date(start);
      const endD = new Date(end);
      const days = Math.ceil((endD - startD) / (1000 * 60 * 60 * 24));
      const total = days * car.dailyRate;
      setTotalPrice(total);
    }
  };

  const handleStartDateChange = (e) => {
    const value = e.target.value;
    setStartDate(value);
    calculateTotal(value, endDate);
  };

  const handleEndDateChange = (e) => {
    const value = e.target.value;
    setEndDate(value);
    calculateTotal(startDate, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      setLoading(false);
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      setError('End date must be after start date');
      setLoading(false);
      return;
    }

    try {
      await bookingAPI.createBooking({
        carId: car._id,
        startDate,
        endDate,
      });
      alert('Booking created successfully!');
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Book {car.make} {car.model}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="car-details">
            <p><strong>License Plate:</strong> {car.licensePlate}</p>
            <p><strong>Daily Rate:</strong> ${car.dailyRate}</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="startDate">Start Date:</label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date:</label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                min={startDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {totalPrice > 0 && (
              <div className="total-price">
                <p><strong>Total Price: ${totalPrice}</strong></p>
              </div>
            )}

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
