import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaSearch, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import CarDetailsModal from '../components/CarDetailsModal';
import RentalBookingModal from '../components/RentalBookingModal';

const CustomerDashboard = () => {
  const [cars, setCars] = useState([]);
  const [myRentals, setMyRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [bookingCar, setBookingCar] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [{ data: carsData }, { data: rentalsData }] = await Promise.all([
        api.get('/cars'),
        api.get('/rentals')
      ]);
      setCars(carsData);
      setMyRentals(rentalsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const availableCars = cars.filter(c => c.status === 'Available');

  if (loading) return <div className="text-center mt-4">Loading Customer Dashboard...</div>;

  return (
    <div>
      <h1 className="mb-4 text-center" style={{ color: 'var(--secondary)' }}>Find Your Next Ride</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        {/* Available Cars */}
        <div style={{ gridColumn: '1 / -1' }}>
          <h3 className="mb-4"><FaSearch /> Available Vehicles</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {availableCars.map(car => (
              <div key={car._id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{car.make} {car.model}</h4>
                <p className="text-muted" style={{ flexGrow: 1 }}>Year: {car.year}</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button 
                    className="btn btn-outline" 
                    style={{ flex: 1 }}
                    onClick={() => setSelectedCar(car)}
                  >
                    <FaInfoCircle /> Details
                  </button>
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 1 }}
                    onClick={() => setBookingCar(car)}
                  >
                    <FaCheckCircle /> Rent
                  </button>
                </div>
              </div>
            ))}
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
