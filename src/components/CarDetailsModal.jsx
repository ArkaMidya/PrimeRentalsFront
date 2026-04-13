import React from 'react';
import ReactDOM from 'react-dom';
import { FaTimes, FaCarSide, FaCogs, FaShieldAlt, FaTachometerAlt } from 'react-icons/fa';

const CarDetailsModal = ({ car, onClose }) => {
  if (!car) return null;

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      zIndex: 5000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="animate-fade-in" style={{
        maxWidth: '850px',
        width: '95%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        background: 'var(--surface)', // Use solid surface to avoid hover issues from glass-panel
        border: '1px solid var(--glass-border)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        borderRadius: '32px',
        padding: '3rem',
        margin: 'auto'
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem' }}
        >
          <FaTimes />
        </button>

        <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>
          {car.make} {car.model}
        </h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <p className="text-muted" style={{ margin: 0, fontWeight: 500 }}>
            Year of Buying: {car.year}
          </p>
          <div style={{ background: 'rgba(40, 167, 69, 0.1)', color: 'var(--success)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontWeight: 'bold', border: '1px solid var(--success)' }}>
            ₹{car.rentPerDay} / Day
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>

          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)' }}>
              <FaCarSide /> Description
            </h4>
            <p style={{ marginTop: '0.5rem' }}>
              {car.description || 'No formal description provided for this vehicle.'}
            </p>
          </div>

          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)' }}>
              <FaTachometerAlt /> Mileage Info
            </h4>
            <div style={{ marginTop: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px' }}>
              <strong style={{ fontSize: '1.2rem', color: 'var(--success)' }}>{car.mileage} km/h</strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Top Speed / Efficiency rating</div>
            </div>
          </div>

          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)' }}>
              <FaCogs /> Engine & Parts
            </h4>
            <ul style={{ marginTop: '0.5rem', listStyle: 'none', padding: 0 }}>
              {car.engineDetails?.type && <li><strong>Engine Type:</strong> {car.engineDetails.type}</li>}
              {car.engineDetails?.capacity && <li><strong>Capacity:</strong> {car.engineDetails.capacity}</li>}
              {car.engineDetails?.hp && <li><strong>Horsepower:</strong> {car.engineDetails.hp} HP</li>}
            </ul>
            {car.partsDetails && car.partsDetails.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Key Parts Condition:</strong>
                <ul style={{ marginLeft: '1.2rem', fontSize: '0.9rem' }}>
                  {car.partsDetails.map((p, i) => (
                    <li key={i}>{p.partName}: <em style={{ color: 'var(--warning)' }}>{p.condition}</em></li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)' }}>
              <FaShieldAlt /> Assurance & Servicing
            </h4>
            <div style={{ marginTop: '0.5rem' }}>
              <strong>Servicing Details:</strong>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{car.servicingDetails || 'Regularly maintained.'}</p>

              {car.serviceHistory && car.serviceHistory.length > 0 && (
                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--success)' }}>
                  <strong>Last Serviced On:</strong> {new Date(Math.max(...car.serviceHistory.map(s => new Date(s.serviceDate).getTime()))).toLocaleDateString()}
                </p>
              )}

              <strong>Insurance Info:</strong>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
                <li>Reg #: {car.insurance?.registrationNumber || 'N/A'}</li>
                <li>Provider: {car.insurance?.provider || 'N/A'}</li>
                <li>Expires: {car.insurance?.expirationDate ? new Date(car.insurance.expirationDate).toLocaleDateString() : 'N/A'}</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};

export default CarDetailsModal;
