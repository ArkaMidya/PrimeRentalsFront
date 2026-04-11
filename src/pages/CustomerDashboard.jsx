import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaSearch, FaCheckCircle, FaInfoCircle, FaCar, FaFilter, FaTachometerAlt, FaTools, FaHistory, FaTimes } from 'react-icons/fa';
import CarDetailsModal from '../components/CarDetailsModal';
import RentalBookingModal from '../components/RentalBookingModal';

const CustomerDashboard = () => {
  const [cars, setCars] = useState([]);
  const [myRentals, setMyRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [bookingCar, setBookingCar] = useState(null);
  const [allBookedDates, setAllBookedDates] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    mileageRange: '',
    maintenance: '',
    usage: ''
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.mileageRange) queryParams.append('mileageRange', filters.mileageRange);
      if (filters.maintenance) queryParams.append('maintenance', filters.maintenance);
      if (filters.usage) queryParams.append('usage', filters.usage);

      const [{ data: carsData }, { data: rentalsData }, { data: bookedDatesData }] = await Promise.all([
        api.get(`/cars?${queryParams.toString()}`),
        api.get('/rentals'),
        api.get('/cars/booked-dates/all')
      ]);
      setCars(carsData);
      setMyRentals(rentalsData);
      setAllBookedDates(bookedDatesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ search: '', mileageRange: '', maintenance: '', usage: '' });
  };

  const availableCars = cars.filter(c => c.status !== 'Servicing');

  if (loading) return <div className="text-center mt-4">Loading Customer Dashboard...</div>;

  return (
    <div>
      <h1 className="mb-4 text-center" style={{ color: 'var(--secondary)' }}>Find Your Next Ride</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        {/* Available Cars */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            {/* <h3 style={{ margin: 0 }}><FaSearch /> Available Vehicles</h3> */}

            {/* Filter Toolbar */}
            <div className="glass-panel" style={{ padding: '0.75rem 1.5rem', display: 'flex', gap: '1.2rem', alignItems: 'center', flexWrap: 'wrap', borderRadius: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
                <FaSearch style={{ position: 'absolute', left: '0.8rem', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search Maker, Model..."
                  className="form-control"
                  style={{ padding: '0.4rem 0.8rem 0.4rem 2.2rem', fontSize: '0.85rem', width: '350px', background: 'rgba(0,0,0,0.1)' }}
                />
              </div>

              <div style={{ height: '24px', width: '1px', background: 'var(--border-color)' }}></div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FaTachometerAlt style={{ color: 'var(--primary)' }} />
                <select name="mileageRange" value={filters.mileageRange} onChange={handleFilterChange} className="form-control" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', width: 'auto', background: 'transparent' }}>
                  <option value="">All Mileage</option>
                  <option value="high">Good (24 - 35+ km/L)</option>
                  <option value="medium">Average (18 - 23 km/L)</option>
                  <option value="low">Poor (Below 18 km/L)</option>

                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FaTools style={{ color: 'var(--secondary)' }} />
                <select name="maintenance" value={filters.maintenance} onChange={handleFilterChange} className="form-control" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', width: 'auto', background: 'transparent' }}>
                  <option value="">All Maintenance</option>
                  <option value="recent">Recently Serviced</option>
                  <option value="old">Not Recently Serviced</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FaHistory style={{ color: 'var(--warning)' }} />
                <select name="usage" value={filters.usage} onChange={handleFilterChange} className="form-control" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', width: 'auto', background: 'transparent' }}>
                  <option value="">All Usage</option>
                  <option value="low">Low Used (0-5)</option>
                  <option value="medium">Medium Used (5-15)</option>
                  <option value="high">High Used (15+)</option>
                </select>
              </div>

              {(filters.search || filters.mileageRange || filters.maintenance || filters.usage) && (
                <button onClick={clearFilters} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', color: 'var(--danger)' }}>
                  <FaTimes /> Clear
                </button>
              )}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {availableCars.map(car => {
              const carBookings = allBookedDates[car._id] || [];
              const todayStatus = new Date();
              todayStatus.setHours(0, 0, 0, 0);

              // "Upcoming booking updated as if today's date == in the range of (checkout and checkin)"
              const isUpcomingBooking = carBookings.some(r => {
                const checkOut = new Date(r.checkOutDate);
                const checkIn = new Date(r.checkInDate);
                checkOut.setHours(0, 0, 0, 0);
                checkIn.setHours(23, 59, 59, 999);
                return checkOut <= todayStatus && todayStatus <= checkIn;
              });

              // "Currently available use this logic if todays date < most recent checkout date of the car"
              // If there are no bookings or the nearest checkout is in the future, it is currently available.
              // Also if a car isn't currently in "Upcoming Booking" (the range), it's available.
              const isCurrentlyAvailable = !isUpcomingBooking;

              let badgeText = "";
              let badgeStyle = {};

              if (isUpcomingBooking) {
                badgeText = "📅 Upcoming Booking";
                badgeStyle = { background: 'rgba(0, 123, 255, 0.1)', color: '#007bff', border: '1px solid #007bff', borderRadius: '20px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 'bold' };
              } else if (isCurrentlyAvailable) {
                badgeText = "✅ Currently Available";
                badgeStyle = { background: 'rgba(40, 167, 69, 0.1)', color: '#28a745', border: '1px solid #28a745', borderRadius: '20px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 'bold' };
              }

              return (
                <div key={car._id} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minHeight: '350px', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1rem', opacity: 0.8 }}>
                      <FaCar />
                    </div>
                    <h4 style={{ fontSize: '1.4rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>{car.make} {car.model}</h4>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <span style={badgeStyle}>{badgeText}</span>
                    </div>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', margin: '1rem 0' }}>
                    <p className="text-muted" style={{ fontSize: '1rem', fontWeight: 500 }}>
                      Year: <span style={{ color: 'var(--secondary)' }}>{car.year}</span>
                    </p>
                    <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.75rem', lineHeight: '1.5' }}>
                      {car.description ? (car.description.length > 80 ? car.description.substring(0, 80) + '...' : car.description) : 'Experience ultimate luxury and performance with this premium vehicle selection.'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', width: '100%' }}>
                    <button
                      className="btn btn-outline"
                      style={{ flex: 1, padding: '0.75rem' }}
                      onClick={() => setSelectedCar(car)}
                    >
                      <FaInfoCircle /> Details
                    </button>
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '0.75rem' }}
                      onClick={() => setBookingCar(car)}
                    >
                      <FaCheckCircle /> Rent
                    </button>
                  </div>
                </div>
              )
            })}
            {availableCars.length === 0 && (
              <div className="glass-panel" style={{ gridColumn: '1/-1', textAlign: 'center' }}>
                No cars available at the moment.
              </div>
            )}
          </div>
        </div>

        {/* My Rentals Summary */}
        <div className="glass-panel" style={{ gridColumn: '1 / -1' }}>
          <h3>My Active & Past Rentals</h3>
          {myRentals.length === 0 ? (
            <p className="mt-4 text-muted">You haven't rented any cars yet.</p>
          ) : (
            <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem' }}>Order ID</th>
                  <th style={{ padding: '1rem' }}>Car</th>
                  <th style={{ padding: '1rem' }}>Rented On</th>
                  <th style={{ padding: '1rem' }}>Pick-up Time</th>
                  <th style={{ padding: '1rem' }}>Expected Return</th>
                  <th style={{ padding: '1rem' }}>Payment Mode</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {myRentals.map(rental => (
                  <tr key={rental._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--primary)' }}>{rental.bookingId || 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>{rental.carId ? `${rental.carId.make} ${rental.carId.model}` : rental.carName || 'Deleted Vehicle'}</td>
                    <td style={{ padding: '1rem' }}>{new Date(rental.checkOutDate).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}>{rental.pickupTime || 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>{new Date(rental.checkInDate).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>
                        {rental.paymentMethod || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge badge-${rental.rentalStatus === 'Completed' ? 'success' : 'primary'}`}>{rental.rentalStatus}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Popup View */}
      {selectedCar && (
        <CarDetailsModal car={selectedCar} onClose={() => setSelectedCar(null)} />
      )}

      {/* Booking Modal Flow */}
      {bookingCar && (
        <RentalBookingModal
          car={bookingCar}
          onClose={() => setBookingCar(null)}
          onSuccess={() => {
            setBookingCar(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;
