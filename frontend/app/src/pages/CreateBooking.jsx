import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/CreateBooking.css';

export default function CreateBooking() {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [formData, setFormData] = useState({
    carId: '',
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Fetch available cars on mount
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await api.get('/cars');
        setCars(response.data.data || []);
      } catch (err) {
        setError('Failed to load cars');
      }
    };
    fetchCars();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.carId || !formData.startDate || !formData.endDate) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (end <= start) {
      setError('End date must be after start date');
      setLoading(false);
      return;
    }

    try {
      await api.post('/bookings', {
        carId: formData.carId,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });

      alert('Booking created successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const selectedCar = cars.find(car => car._id === formData.carId);
  const startDate = formData.startDate ? new Date(formData.startDate) : null;
  const endDate = formData.endDate ? new Date(formData.endDate) : null;
  const days = startDate && endDate ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) : 0;
  const totalPrice = selectedCar && days > 0 ? selectedCar.pricePerDay * days : 0;

  return (
    <div className="create-booking-container">
      <div className="create-booking-card">
        <h2>Create New Booking</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="carId">Select Car *</label>
            <select
              id="carId"
              name="carId"
              value={formData.carId}
              onChange={handleChange}
              required
            >
              <option value="">-- Choose a car --</option>
              {cars.map(car => (
                <option key={car._id} value={car._id}>
                  {car.make} {car.model} (${car.pricePerDay}/day)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="startDate">Start Date *</label>
            <input
              id="startDate"
              type="datetime-local"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date *</label>
            <input
              id="endDate"
              type="datetime-local"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>

          {selectedCar && days > 0 && (
            <div className="booking-summary">
              <h3>Booking Summary</h3>
              <p><strong>Car:</strong> {selectedCar.make} {selectedCar.model}</p>
              <p><strong>Days:</strong> {days}</p>
              <p><strong>Price per Day:</strong> ${selectedCar.pricePerDay}</p>
              <p className="total-price"><strong>Total Price:</strong> ${totalPrice}</p>
            </div>
          )}

          <div className="form-buttons">
            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
            >
              {loading ? 'Creating...' : 'Create Booking'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
