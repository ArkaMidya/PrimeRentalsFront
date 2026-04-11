import React from 'react';
import { FaTimes, FaCarSide, FaCogs, FaShieldAlt, FaTachometerAlt } from 'react-icons/fa';

const CarDetailsModal = ({ car, onClose }) => {
  if (!car) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      zIndex: 1000,
      overflowY: 'auto',
      padding: '2rem 1rem'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: '700px', width: '90%', 
        position: 'relative',
        marginBottom: '2rem'
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
        <p className="text-muted" style={{ marginBottom: '1.5rem', fontWeight: 500 }}>
          Year of Buying: {car.year}
        </p>

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
                    <li key={i}>{p.partName}: <em style={{color: 'var(--warning)'}}>{p.condition}</em></li>
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
    </div>
  );
};

export default CarDetailsModal;
