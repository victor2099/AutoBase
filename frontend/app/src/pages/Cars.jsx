import { useState, useEffect } from 'react';
import { carAPI } from '../services/api';
import BookingModal from '../components/BookingModal';
import '../styles/Cars.css';

export default function Cars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCar, setSelectedCar] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await carAPI.getAllCars();
        setCars(response.data.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load cars');
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const handleBookCar = (car) => {
    setSelectedCar(car);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    setSelectedCar(null);
  };

  if (loading) return <div className="loading">Loading cars...</div>;

  return (
    <div className="cars-container">
      <h2>Available Cars for Rent</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="cars-grid">
        {cars.length === 0 ? (
          <p>No cars available at the moment.</p>
        ) : (
          cars.map((car) => (
            <div key={car._id} className="car-card">
              <div className="car-info">
                <h3>{car.make} {car.model}</h3>
                <p className="year">Year: {car.year}</p>
                <p className="plate">License Plate: {car.licensePlate}</p>
                <p className="status">Status: {car.status}</p>
                <p className="price">${car.dailyRate}/day</p>
                <button
                  onClick={() => handleBookCar(car)}
                  disabled={!car.availability}
                  className="book-btn"
                >
                  {car.availability ? 'Book Now' : 'Not Available'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showBookingModal && selectedCar && (
        <BookingModal
          car={selectedCar}
          onClose={() => setShowBookingModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}
