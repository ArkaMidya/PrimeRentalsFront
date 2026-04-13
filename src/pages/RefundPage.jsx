import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { FaArrowLeft, FaReceipt, FaCreditCard, FaMoneyBillWave, FaCalendarAlt, FaCar, FaUser, FaCheckCircle } from 'react-icons/fa';

const RefundPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const { data } = await api.get(`/rentals/booking/${bookingId}`);
        setRental(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch booking details');
      } finally {
        setLoading(false);
      }
    };
    fetchBookingDetails();
  }, [bookingId]);

  const handleConfirmRefund = async () => {
    if (!window.confirm('Are you sure you want to process this refund? This action cannot be undone.')) return;
    
    setProcessing(true);
    try {
      await api.post(`/rentals/refund/${bookingId}`);
      alert('Refund successfully processed!');
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process refund');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading Refund Details...</div>;
  if (error) return (
    <div className="text-center mt-5 text-danger">
      <h3>Error</h3>
      <p>{error}</p>
      <button className="btn btn-primary" onClick={() => navigate('/admin')}>Back to Dashboard</button>
    </div>
  );

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 0' }}>
      <button 
        className="btn btn-outline" 
        onClick={() => navigate('/admin')}
        style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <FaArrowLeft /> Back to Command Center
      </button>

      <div className="glass-panel animate-fade-in" style={{ padding: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ color: 'var(--primary)', margin: 0 }}>Refund Processing</h1>
            <p className="text-muted" style={{ marginTop: '0.5rem' }}>Review booking details and verify payment method before refunding.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-danger" style={{ fontSize: '0.9rem' }}>{rental.rentalStatus.replace(/_/g, ' ')}</span>
            <h3 style={{ marginTop: '1rem', color: 'var(--text-main)' }}>ID: {rental.bookingId}</h3>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2.5rem' }}>
          {/* Car & User Details */}
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--secondary)' }}>
              <FaCar /> Vehicle & Customer
            </h4>
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="text-muted" style={{ display: 'block', fontSize: '0.8rem' }}>VEHICLE</label>
                <strong>{rental.carId?.make} {rental.carId?.model}</strong>
              </div>
              <div>
                <label className="text-muted" style={{ display: 'block', fontSize: '0.8rem' }}>CUSTOMER</label>
                <strong>{rental.userId?.name}</strong>
                <p style={{ fontSize: '0.85rem' }}>{rental.userId?.email}</p>
              </div>
            </div>
          </div>

          {/* Rental Timing */}
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--secondary)' }}>
              <FaCalendarAlt /> Rental Schedule
            </h4>
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="text-muted" style={{ display: 'block', fontSize: '0.8rem' }}>PICKUP</label>
                <strong>{new Date(rental.checkOutDate).toLocaleDateString()} at {rental.pickupTime}</strong>
              </div>
              <div>
                <label className="text-muted" style={{ display: 'block', fontSize: '0.8rem' }}>CANCELLATION TIME</label>
                <strong>{new Date(rental.cancellationTime).toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* Payment & Refund Details */}
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--secondary)' }}>
              <FaReceipt /> Financial Summary
            </h4>
            <div className="glass-panel" style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="text-muted">Total Paid:</span>
                <span>₹{rental.totalCost}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--danger)' }}>
                <span>Deduction (15%):</span>
                <span>- ₹{(rental.totalCost * 0.15).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary)' }}>
                <span>To Refund:</span>
                <span>₹{rental.refundAmount}</span>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--success)', background: 'rgba(40, 167, 69, 0.05)', padding: '1rem', borderRadius: '8px' }}>
              <FaMoneyBillWave />
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem' }}>PAYMENT METHOD</label>
                <strong>{rental.paymentMethod}</strong>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '3rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
            Clicking the button below will trigger a refund request of <strong>₹{rental.refundAmount}</strong> back to the original {rental.paymentMethod} account.
          </p>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '1rem 4rem', fontSize: '1.1rem', gap: '0.8rem' }}
            onClick={handleConfirmRefund}
            disabled={processing}
          >
            {processing ? 'Processing...' : <><FaCheckCircle /> Confirm & Issue Refund</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefundPage;
