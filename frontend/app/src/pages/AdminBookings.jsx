import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { bookingAPI } from '../services/api';
import '../styles/AdminBookings.css';

const bookingStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString() : '—';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingBookingId, setUpdatingBookingId] = useState(null);

  const fetchBookings = useCallback(async () => {
    const response = await bookingAPI.getAllBookings();
    return response.data.data;
  }, []);

  useEffect(() => {
    let active = true;
    fetchBookings()
      .then((data) => {
        if (active) {
          setBookings(data);
          setError('');
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.response?.data?.message || 'Failed to load bookings');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchBookings]);

  const handleRefresh = async () => {
    setLoading(true);
    setError('');
    try {
      setBookings(await fetchBookings());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, status) => {
    setUpdatingBookingId(bookingId);
    setError('');

    try {
      const response = await bookingAPI.updateBooking(bookingId, { status });
      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking._id === bookingId ? response.data.data : booking
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update booking');
    } finally {
      setUpdatingBookingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page admin-bookings">
        <div className="admin-bookings-heading">
          <div>
            <h2>Bookings</h2>
            <p>Review and update customer bookings.</p>
          </div>
          <button
            className="admin-bookings-refresh"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {error && <div className="admin-bookings-error">{error}</div>}

        {loading ? (
          <p className="admin-bookings-message">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p className="admin-bookings-message">No bookings found.</p>
        ) : (
          <div className="admin-bookings-table-wrap">
            <table className="admin-bookings-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Car</th>
                  <th>Rental dates</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      <div className="admin-bookings-customer">
                        <strong>
                          {[booking.userId?.firstName, booking.userId?.lastName]
                            .filter(Boolean)
                            .join(' ') || 'Unknown customer'}
                        </strong>
                        {booking.userId?.email && <span>{booking.userId.email}</span>}
                      </div>
                    </td>
                    <td>
                      {[booking.carId?.make, booking.carId?.model]
                        .filter(Boolean)
                        .join(' ') || 'Car unavailable'}
                    </td>
                    <td>
                      {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
                    </td>
                    <td>${Number(booking.totalPrice).toFixed(2)}</td>
                    <td>
                      <select
                        className={`admin-booking-status status-${booking.status}`}
                        value={booking.status}
                        onChange={(event) =>
                          handleStatusChange(booking._id, event.target.value)
                        }
                        disabled={updatingBookingId === booking._id}
                        aria-label={`Status for booking ${booking._id}`}
                      >
                        {bookingStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
