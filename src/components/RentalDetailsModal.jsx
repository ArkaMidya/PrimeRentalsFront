import React from 'react';
import ReactDOM from 'react-dom';
import { FaTimes, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaMoneyBillWave, FaCar, FaInfoCircle, FaUser } from 'react-icons/fa';

const RentalDetailsModal = ({ rental, onClose }) => {
  if (!rental) return null;

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 6000
    }}>
      <div className="animate-fade-in" style={{
        maxWidth: '700px', width: '95%', maxHeight: '90vh', overflowY: 'auto', position: 'relative',
        background: 'var(--surface)', border: '1px solid var(--glass-border)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', borderRadius: '32px', padding: '3rem'
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem' }}
        >
          <FaTimes />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255, 183, 3, 0.1)', color: 'var(--primary)', fontSize: '2rem', marginBottom: '1rem' }}>
            <FaInfoCircle />
          </div>
          <h2 style={{ color: 'var(--primary)', margin: 0 }}>Rental Details</h2>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>Booking ID: <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{rental.bookingId}</span></p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          
          {/* Car & Customer Info */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem', color: 'var(--secondary)' }}><FaCar /> Vehicle & Customer</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div>
                <small className="text-muted">Vehicle</small>
                <div style={{ fontWeight: 600 }}>{rental.carId ? `${rental.carId.make} ${rental.carId.model}` : rental.carName || 'N/A'}</div>
              </div>
              {rental.userId?.name && (
                <div>
                  <small className="text-muted">Rented By</small>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FaUser style={{ fontSize: '0.8rem' }} /> {rental.userId.name}
                  </div>
                  {rental.userId.email && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '1.2rem' }}>
                      {rental.userId.email}
                    </div>
                  )}
                  {rental.phone && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '1.2rem', marginTop: '0.2rem' }}>
                      📞 {rental.phone}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Routing & Location */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem', color: 'var(--primary)' }}><FaMapMarkerAlt /> Routing</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div>
                <small className="text-muted">Pick-up Point</small>
                <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{rental.pickupLocation || rental.sourceLocation || 'N/A'}</div>
              </div>
              <div>
                <small className="text-muted">Drop-off Destination</small>
                <div style={{ fontWeight: 600 }}>{rental.destinationLocation || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem', color: 'var(--warning)' }}><FaCalendarAlt /> Schedule</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <small className="text-muted">Pick-up Date</small>
                <div style={{ fontWeight: 600 }}>{new Date(rental.checkOutDate).toLocaleDateString()}</div>
              </div>
              <div>
                <small className="text-muted">Pick-up Time</small>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <FaClock style={{ fontSize: '0.8rem' }} /> {rental.pickupTime || 'N/A'}
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <small className="text-muted">Expected Return</small>
                <div style={{ fontWeight: 600 }}>{new Date(rental.checkInDate).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* Billing */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem', color: 'var(--success)' }}><FaMoneyBillWave /> Billing Information</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <small className="text-muted">Total Paid</small>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--success)' }}>₹{rental.totalCost}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <small className="text-muted">Payment Method</small>
                <div style={{ fontWeight: 600 }}>{rental.paymentMethod}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <small className="text-muted">Status</small>
                <span className={`badge badge-${rental.rentalStatus === 'Completed' ? 'success' : rental.rentalStatus.startsWith('CANCELLED') ? 'danger' : 'primary'}`} style={{ fontSize: '0.75rem' }}>
                  {rental.rentalStatus.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>

        </div>

        <div className="text-center mt-5">
           <button className="btn btn-primary" style={{ padding: '0.8rem 2.5rem', borderRadius: '12px' }} onClick={onClose}>Close Details</button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default RentalDetailsModal;
