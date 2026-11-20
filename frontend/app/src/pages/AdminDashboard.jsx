import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { bookingAPI, carAPI } from '../services/api';
import '../styles/AdminDashboard.css';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    const [carsResponse, bookingsResponse] = await Promise.all([
      carAPI.getAllCars(),
      bookingAPI.getAllBookings(),
    ]);
    const cars = carsResponse.data.data;
    const bookings = bookingsResponse.data.data;

    if (!Array.isArray(cars) || !Array.isArray(bookings)) {
      throw new Error('The server returned an invalid dashboard response');
    }

    return { cars, bookings };
  }, []);

  useEffect(() => {
    let active = true;
    fetchDashboard()
      .then((data) => {
        if (active) {
          setDashboardData(data);
          setError('');
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err.response?.data?.message ||
              err.message ||
              'Failed to load dashboard data'
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchDashboard]);

  const handleRefresh = async () => {
    setLoading(true);
    setError('');
    try {
      setDashboardData(await fetchDashboard());
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load dashboard data'
      );
    } finally {
      setLoading(false);
    }
  };

  const recentBookings = useMemo(
    () =>
      [...(dashboardData?.bookings || [])]
        .sort(
          (first, second) =>
            new Date(second.createdAt || second.startDate) -
            new Date(first.createdAt || first.startDate)
        )
        .slice(0, 5),
    [dashboardData]
  );

  const cars = dashboardData?.cars || [];
  const bookings = dashboardData?.bookings || [];
  const stats = [
    { label: 'Fleet size', value: cars.length },
    {
      label: 'Available cars',
      value: cars.filter((car) => car.availability && car.status === 'available').length,
    },
    {
      label: 'Rented cars',
      value: cars.filter((car) => car.status === 'rented').length,
    },
    { label: 'Total bookings', value: bookings.length },
    {
      label: 'Pending bookings',
      value: bookings.filter((booking) => booking.status === 'pending').length,
    },
    {
      label: 'Confirmed bookings',
      value: bookings.filter((booking) => booking.status === 'confirmed').length,
    },
  ];

  return (
    <AdminLayout>
      <div className="admin-page admin-dashboard">
        <div className="admin-dashboard-heading">
          <div>
            <h2>Admin Dashboard</h2>
            <p>Live overview of your fleet and bookings.</p>
          </div>
          <button
            className="admin-dashboard-refresh"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="admin-dashboard-error">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <p className="admin-dashboard-message">Loading dashboard...</p>
        ) : !error ? (
          <>
            <section className="admin-dashboard-stats" aria-label="Fleet and booking summary">
              {stats.map((stat) => (
                <article className="admin-dashboard-stat" key={stat.label}>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </article>
              ))}
            </section>

            <section className="admin-dashboard-recent">
              <div className="admin-dashboard-section-heading">
                <h3>Recent bookings</h3>
                <Link to="/admin/bookings">View all</Link>
              </div>

              {recentBookings.length === 0 ? (
                <p className="admin-dashboard-message">No bookings found.</p>
              ) : (
                <div className="admin-dashboard-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Car</th>
                        <th>Start date</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings.map((booking) => (
                        <tr key={booking._id}>
                          <td>
                            {[booking.userId?.firstName, booking.userId?.lastName]
                              .filter(Boolean)
                              .join(' ') || 'Unknown customer'}
                          </td>
                          <td>
                            {[booking.carId?.make, booking.carId?.model]
                              .filter(Boolean)
                              .join(' ') || 'Car unavailable'}
                          </td>
                          <td>
                            {booking.startDate
                              ? new Date(booking.startDate).toLocaleDateString()
                              : '—'}
                          </td>
                          <td>${Number(booking.totalPrice).toFixed(2)}</td>
                          <td>
                            <span
                              className={`admin-dashboard-status status-${booking.status}`}
                            >
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
