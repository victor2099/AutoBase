import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import ConfirmModal from '../components/ConfirmModal';
import api from '../services/api';
import '../styles/AdminCars.css';

export default function AdminCars() {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, carId: null, carName: '' });

  // Fetch cars on mount
  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/cars');
      setCars(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (carId, carName) => {
    setDeleteModal({
      show: true,
      carId,
      carName
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/cars/${deleteModal.carId}`);
      setCars(cars.filter(car => car._id !== deleteModal.carId));
      alert('Car deleted successfully');
      setDeleteModal({ show: false, carId: null, carName: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete car');
      setDeleteModal({ show: false, carId: null, carName: '' });
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ show: false, carId: null, carName: '' });
  };

  const handleEditCar = (carId) => {
    navigate(`/admin/edit-car/${carId}`);
  };

  // Calculate stats
  const totalCars = cars.length;
  const availableCars = cars.filter(car => car.status === 'available').length;
  const rentedCars = cars.filter(car => car.status === 'rented').length;

  return (
    <AdminLayout>
      <div className="admin-cars-container">
        {/* Header */}
        <div className="cars-header">
          <h2>Manage Cars</h2>
          <button
            onClick={() => navigate('/admin/add-car')}
            className="btn-action btn-edit"
            style={{ padding: '10px 16px' }}
          >
            + Add New Car
          </button>
        </div>

        {/* Stats Cards */}
        <div className="cars-stats">
          <div className="stat-card">
            <div className="stat-number">{totalCars}</div>
            <div className="stat-label">Total Cars</div>
          </div>
          <div className="stat-card available">
            <div className="stat-number">{availableCars}</div>
            <div className="stat-label">Available</div>
          </div>
          <div className="stat-card rented">
            <div className="stat-number">{rentedCars}</div>
            <div className="stat-label">Rented</div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading cars...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="error-container">
            <h3>Error Loading Cars</h3>
            <p>{error}</p>
            <button
              onClick={fetchCars}
              className="btn-action btn-edit"
              style={{ marginTop: '10px' }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && cars.length === 0 && (
          <div className="empty-container">
            <h3>No cars found</h3>
            <p>Start by adding your first car to the system.</p>
            <button
              onClick={() => navigate('/admin/add-car')}
              className="btn-action btn-edit"
              style={{ marginTop: '10px' }}
            >
              + Add New Car
            </button>
          </div>
        )}

        {/* Cars Table */}
        {!loading && !error && cars.length > 0 && (
          <div className="cars-table-container">
            <table className="cars-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Brand & Model</th>
                  <th>Registration #</th>
                  <th>Daily Rate</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                  <tr key={car._id}>
                    <td>
                      {car.image ? (
                        <img src={car.image} alt={`${car.make} ${car.model}`} className="car-image" />
                      ) : (
                        <div className="car-image placeholder">🚗</div>
                      )}
                    </td>
                    <td>
                      <div className="car-info">
                        <div className="car-details">
                          <h4>{car.make} {car.model}</h4>
                          <p>{car.year}</p>
                        </div>
                      </div>
                    </td>
                    <td>{car.registrationNumber || 'N/A'}</td>
                    <td>${car.pricePerDay}</td>
                    <td>
                      <span className={`status-badge ${car.status}`}>
                        {car.status}
                      </span>
                    </td>
                    <td>
                      <div className="car-actions">
                        <button
                          onClick={() => handleEditCar(car._id)}
                          className="btn-action btn-edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(car._id, `${car.make} ${car.model}`)}
                          className="btn-action btn-delete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <ConfirmModal
          title="Delete Car"
          message={`Are you sure you want to delete ${deleteModal.carName}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          isDestructive={true}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </AdminLayout>
  );
}

