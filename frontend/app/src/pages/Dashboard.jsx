import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('Searching for your bookings, please hold on');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const controllerRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const performSearch = async () => {
    const controller = new AbortController();
    controllerRef.current = controller;
    let timeoutId;

    // Start with searching message
    setLoading(true);
    setError('Searching for your bookings, please hold on');
    setShowSearchModal(false);

    // Show modal after 15s if still loading
    timeoutId = setTimeout(() => {
      if (loading) setShowSearchModal(true);
    }, 15000);

    try {
      let response;
      if (user.role === 'admin') {
        response = await api.get('/bookings', { signal: controller.signal });
      } else {
        response = await api.get('/bookings/my-bookings', { signal: controller.signal });
      }

      setBookings(response.data.data || []);
      setError(''); // Clear error on success
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        setError('Could not find any Bookings');
      } else {
        setError(err.response?.data?.message || 'Failed to load bookings');
      }
    } finally {
      clearTimeout(timeoutId);
      setShowSearchModal(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, [user.role]);

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.delete(`/bookings/${bookingId}`);
        setBookings(bookings.filter(b => b._id !== bookingId));
        alert('Booking cancelled successfully');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to cancel booking');
      }
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const response = await api.patch(`/bookings/${bookingId}`, { status: newStatus });
      setBookings(bookings.map(b => b._id === bookingId ? response.data.data : b));
      alert('Booking updated successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking');
    }
  };

  const handleContinueSearching = () => {
    setShowSearchModal(false);
    // Search continues in background
  };

  const handleCancelSearch = () => {
    if (controllerRef.current) controllerRef.current.abort();
    setShowSearchModal(false);
    setLoading(false);
    setError('Could not find any Bookings');
  };

  return (
    <div className="dashboard-container">
      <h2>{user.role === 'admin' ? 'All Bookings' : 'My Bookings'}</h2>

      {/* Modal for search timeout - shown after 15s if still loading */}
      {showSearchModal && (
        <div className="modal-overlay" onClick={() => { /* don't close on overlay click */ }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Still searching...</h3>
            </div>
            <div className="modal-body">
              <p>The search is taking longer than expected. Would you like to keep waiting or cancel?</p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                <button onClick={handleContinueSearching} className="submit-btn">Keep Searching</button>
                <button onClick={handleCancelSearch} className="cancel-btn">Cancel Search</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show error message (includes initial "Searching..." message) */}
      {error && <div className="error-message">{error}</div>}

      {/* Action buttons below error message */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, marginTop: 16 }}>
        <button 
          onClick={performSearch} 
          disabled={loading}
          className="search-btn"
          style={{ padding: '8px 16px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Searching...' : 'Search Bookings'}
        </button>
        {user.role !== 'admin' && (
          <button 
            onClick={() => navigate('/create-booking')}
            className="create-btn"
            style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Create Booking
          </button>
        )}
      </div>

      {/* Show bookings table only after search completes and no error */}
      {!loading && !error && (
        <div className="bookings-table">
          {bookings.length === 0 ? (
            <p>No bookings found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Car</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Total Price</th>
                  <th>Status</th>
                  {user.role === 'admin' && <th>Customer</th>}
                  {user.role === 'admin' && <th>Actions</th>}
                  {user.role !== 'admin' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      {booking.carId?.make} {booking.carId?.model}
                    </td>
                    <td>{new Date(booking.startDate).toLocaleDateString()}</td>
                    <td>{new Date(booking.endDate).toLocaleDateString()}</td>
                    <td>${booking.totalPrice}</td>
                    <td>
                      {user.role === 'admin' ? (
                        <select
                          value={booking.status}
                          onChange={(e) => handleUpdateStatus(booking._id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="completed">Completed</option>
                        </select>
                      ) : (
                        <span className={`status-${booking.status}`}>
                          {booking.status}
                        </span>
                      )}
                    </td>
                    {user.role === 'admin' && (
                      <td>{booking.userId?.firstName} {booking.userId?.lastName}</td>
                    )}
                    <td>
                      {booking.status === 'pending' || booking.status === 'confirmed' ? (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="cancel-btn"
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="no-action">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
