import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import api from '../services/api';
import '../styles/AdminAddEditCar.css';

export default function AdminAddEditCar() {
  const navigate = useNavigate();
  const { carId } = useParams();
  const isEditMode = !!carId;

  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    registrationNumber: '',
    category: 'sedan',
    pricePerDay: '',
    image: '',
  });

  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditMode);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validation, setValidation] = useState({});

  const categories = ['sedan', 'suv', 'truck', 'van', 'convertible', 'sports'];

  // Fetch car data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchCarData();
    }
  }, [carId]);

  const fetchCarData = async () => {
    try {
      const response = await api.get(`/cars/${carId}`);
      const car = response.data.data;
      setFormData({
        make: car.make,
        model: car.model,
        year: car.year,
        registrationNumber: car.registrationNumber || '',
        category: car.category || 'sedan',
        pricePerDay: car.pricePerDay,
        image: car.image || '',
      });
      if (car.image) {
        setImagePreview(car.image);
      }
      setFetchingData(false);
    } catch (err) {
      setError('Failed to load car data');
      setFetchingData(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.make.trim()) newErrors.make = 'Brand is required';
    if (!formData.model.trim()) newErrors.model = 'Model is required';
    if (!formData.year) newErrors.year = 'Year is required';
    if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Please enter a valid year';
    }
    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = 'Registration number is required';
    }
    if (!formData.pricePerDay || formData.pricePerDay <= 0) {
      newErrors.pricePerDay = 'Daily rate must be greater than 0';
    }

    setValidation(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'pricePerDay' ? parseFloat(value) || '' : value
    }));
    // Clear validation error for this field
    if (validation[name]) {
      setValidation(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }));
        setImagePreview(reader.result);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        registrationNumber: formData.registrationNumber,
        category: formData.category,
        pricePerDay: parseFloat(formData.pricePerDay),
        ...(formData.image && { image: formData.image })
      };

      if (isEditMode) {
        await api.patch(`/cars/${carId}`, payload);
        setSuccess('Car updated successfully!');
      } else {
        await api.post('/cars', payload);
        setSuccess('Car added successfully!');
      }

      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate('/admin/cars');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save car');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <AdminLayout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading car data...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-form-container">
        <div className="form-card">
          <h2>{isEditMode ? 'Edit Car' : 'Add New Car'}</h2>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit} className="car-form">
            {/* Brand & Model Row */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="make">Brand *</label>
                <input
                  id="make"
                  name="make"
                  type="text"
                  value={formData.make}
                  onChange={handleChange}
                  placeholder="e.g., Toyota"
                  className={validation.make ? 'input-error' : ''}
                />
                {validation.make && <span className="error-text">{validation.make}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="model">Model *</label>
                <input
                  id="model"
                  name="model"
                  type="text"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g., Camry"
                  className={validation.model ? 'input-error' : ''}
                />
                {validation.model && <span className="error-text">{validation.model}</span>}
              </div>
            </div>

            {/* Year & Registration Row */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="year">Year *</label>
                <input
                  id="year"
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className={validation.year ? 'input-error' : ''}
                />
                {validation.year && <span className="error-text">{validation.year}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="registrationNumber">Registration # *</label>
                <input
                  id="registrationNumber"
                  name="registrationNumber"
                  type="text"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  placeholder="e.g., ABC-1234"
                  className={validation.registrationNumber ? 'input-error' : ''}
                />
                {validation.registrationNumber && (
                  <span className="error-text">{validation.registrationNumber}</span>
                )}
              </div>
            </div>

            {/* Category & Daily Rate Row */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="pricePerDay">Daily Rate ($) *</label>
                <input
                  id="pricePerDay"
                  name="pricePerDay"
                  type="number"
                  value={formData.pricePerDay}
                  onChange={handleChange}
                  placeholder="e.g., 50"
                  step="0.01"
                  min="0"
                  className={validation.pricePerDay ? 'input-error' : ''}
                />
                {validation.pricePerDay && (
                  <span className="error-text">{validation.pricePerDay}</span>
                )}
              </div>
            </div>

            {/* Image Upload Row */}
            <div className="form-group">
              <label htmlFor="carImage">Car Image</label>
              <div className="image-upload-group">
                <input
                  id="carImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                />
                <label htmlFor="carImage" className="file-label">
                  📷 Choose Image
                </label>
              </div>
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setFormData(prev => ({ ...prev, image: '' }));
                    }}
                    className="btn-remove-image"
                  >
                    ✕ Remove
                  </button>
                </div>
              )}
              <p className="help-text">Max 5MB, JPG/PNG/WebP</p>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="submit"
                disabled={loading}
                className="btn-submit"
              >
                {loading ? 'Saving...' : (isEditMode ? 'Update Car' : 'Add Car')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/cars')}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
