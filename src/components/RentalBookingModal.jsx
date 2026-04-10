import React, { useState } from 'react';
import { FaTimes, FaCreditCard, FaCheckCircle, FaSpinner, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import api from '../api/axios';

const RentalBookingModal = ({ car, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    checkOutDate: '',
    checkInDate: '',
    pickupTime: '', // Added pickupTime
    sourceLocation: '',
    destinationLocation: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');

  if (!car) return null;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateDays = () => {
    const start = new Date(formData.checkOutDate);
    const end = new Date(formData.checkInDate);
    if (isNaN(start) || isNaN(end)) return 0;
    
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1; 
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    if (new Date(formData.checkInDate) < new Date(formData.checkOutDate)) {
      alert("Return date cannot be before rental start date.");
      return;
    }
    const days = calculateDays();
    const cost = (1500 * days) + (70 * days);
    setTotalCost(cost);
    setStep(2);
  };

  const executeFakePayment = () => {
    setIsProcessing(true);
    
    // Simulate fake processing latency
    setTimeout(async () => {
      try {
        await api.post('/rentals', {
          carId: car._id,
          checkOutDate: formData.checkOutDate,
          checkInDate: formData.checkInDate,
          pickupTime: formData.pickupTime, // Added pickupTime to payload
          sourceLocation: formData.sourceLocation,
          destinationLocation: formData.destinationLocation,
          totalCost: totalCost,
          paymentMethod: paymentMethod // Track how the transaction was cleared
        });
        
        setIsProcessing(false);
        setStep(4); // Success Screen
        
        // Auto-close after 2 seconds
        setTimeout(() => {
          onSuccess();
        }, 2000);

      } catch (err) {
        setIsProcessing(false);
        alert(err.response?.data?.message || 'Error processing payment and rental.');
        setStep(1); // Go back if error
      }
    }, 2500);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
    }}>
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: '550px', width: '90%', position: 'relative'
      }}>
        {step !== 4 && (
          <button 
            onClick={onClose} 
            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem' }}
          >
            <FaTimes />
          </button>
        )}

        {/* Step 1: Trip Details */}
        {step === 1 && (
          <div>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Book {car.make} {car.model}</h2>
            <form onSubmit={handleCalculate}>
              
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><FaMapMarkerAlt /> Routing</h4>
              <div className="form-group">
                <label>Source Address</label>
                <input type="text" className="form-control" name="sourceLocation" value={formData.sourceLocation} onChange={handleInputChange} required placeholder="Enter pickup address" />
              </div>
              <div className="form-group">
                <label>Destination Address</label>
                <input type="text" className="form-control" name="destinationLocation" value={formData.destinationLocation} onChange={handleInputChange} required placeholder="Enter drop-off address" />
              </div>
              
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', marginBottom: '1rem' }}><FaCalendarAlt /> Dates & Time</h4>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label>Start Date</label>
                  <input type="date" className="form-control" name="checkOutDate" value={formData.checkOutDate} onChange={handleInputChange} min={new Date().toISOString().split('T')[0]} required />
                </div>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label>Pick-up Time</label>
                  <input type="time" className="form-control" name="pickupTime" value={formData.pickupTime} onChange={handleInputChange} required />
                </div>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label>Expected Return</label>
                  <input type="date" className="form-control" name="checkInDate" value={formData.checkInDate} onChange={handleInputChange} min={formData.checkOutDate || new Date().toISOString().split('T')[0]} required />
                </div>
              </div>

              <div className="text-center mt-4">
                <button type="submit" className="btn primary-btn" style={{ background: 'var(--primary)', color: '#000', border: 'none', borderRadius: '8px', width: '100%', fontSize: '1.1rem', padding: '1rem', cursor: 'pointer', fontWeight: 'bold' }}>Calculate Rental Cost</button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Invoice & Payment */}
        {step === 2 && (
          <div>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Booking Summary</h2>
            
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Car:</span> <strong>{car.make} {car.model}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Days:</span> <strong>{calculateDays()} Days</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Base Rent (₹1500/day):</span> <strong>₹{1500 * calculateDays()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span>Servicing Charge (₹70/day):</span> <strong>₹{70 * calculateDays()}</strong>
              </div>
              
              <hr style={{ borderColor: 'rgba(255,255,255,0.1)', marginBottom: '1rem' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', color: 'var(--success)' }}>
                <span>Total Amount:</span> <strong>₹{totalCost}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-outline" style={{ flex: 1, padding: '1rem', borderRadius: '8px', cursor: 'pointer' }} onClick={() => setStep(1)} disabled={isProcessing}>
                Back
              </button>
              <button className="btn btn-secondary" style={{ flex: 2, background: 'var(--secondary)', color: '#fff', border: 'none', borderRadius: '8px', padding: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }} onClick={() => setStep(3)}>
                <FaCreditCard /> Proceed to Payment
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment Selection */}
        {step === 3 && (
          <div>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', textAlign: 'center' }}>Select Payment Method</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.2rem', marginBottom: '2rem' }}>
              {[
                { id: 'Cash', icon: '💵', label: 'Cash' },
                { id: 'Credit/Debit Card', icon: '💳', label: 'Credit / Debit Card' },
                { id: 'UPI', icon: '📱', label: 'UPI' },
                { id: 'Net Banking', icon: '🏦', label: 'Net Banking' }
              ].map(method => {
                const isSelected = paymentMethod === method.id;
                return (
                  <div 
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.transform = 'scale(1.03)';
                        e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1.5rem', 
                      background: isSelected ? 'rgba(0, 123, 255, 0.08)' : '#ffffff',
                      border: isSelected ? '2px solid #007bff' : '2px solid transparent',
                      borderRadius: '12px', 
                      cursor: 'pointer', 
                      transition: 'all 0.3s ease',
                      boxShadow: isSelected ? '0 8px 20px rgba(0,123,255,0.2)' : '0 4px 6px rgba(0,0,0,0.1)',
                      color: isSelected ? '#007bff' : '#333333',
                      transform: isSelected ? 'scale(1.03)' : 'scale(1)'
                    }}
                  >
                    <span style={{ fontSize: '2rem' }}>{method.icon}</span>
                    <strong style={{ fontSize: '1.1rem', fontWeight: isSelected ? '700' : '500' }}>{method.label}</strong>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-outline" style={{ flex: 1, padding: '1rem', borderRadius: '8px', cursor: 'pointer' }} onClick={() => setStep(2)} disabled={isProcessing}>
                Back
              </button>
              {paymentMethod ? (
                <button className="btn btn-secondary" style={{ flex: 2, background: 'var(--secondary)', color: '#fff', border: 'none', borderRadius: '8px', padding: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }} onClick={executeFakePayment} disabled={isProcessing}>
                  {isProcessing ? (
                    <><FaSpinner className="animate-spin" /> Processing Transaction...</>
                  ) : (
                    <><FaCheckCircle /> Pay ₹{totalCost}</>
                  )}
                </button>
              ) : (
                <div style={{ flex: 2, textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                  Please select a payment method
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Success Screen */}
        {step === 4 && (
          <div className="text-center animate-fade-in" style={{ padding: '2rem 1rem' }}>
            <FaCheckCircle style={{ fontSize: '5rem', color: 'var(--success)', marginBottom: '1.5rem', display: 'block', margin: '0 auto' }} />
            <h2 style={{ color: 'var(--success)', marginBottom: '1rem' }}>Transaction Successful!</h2>
            <p className="text-muted" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Paid via {paymentMethod}</p>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Payment of ₹{totalCost} received.</p>
            <p style={{ fontWeight: '500' }}>Your {car.make} {car.model} is successfully booked! Navigating back...</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default RentalBookingModal;
