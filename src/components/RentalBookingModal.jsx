import React, { useState, useEffect, useContext } from 'react';
import ReactDOM from 'react-dom';
import { FaTimes, FaCreditCard, FaCheckCircle, FaSpinner, FaMapMarkerAlt, FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const RentalBookingModal = ({ car, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    checkOutDate: '',
    checkInDate: '',
    pickupTime: '', // Added pickupTime
    phone: '',
    sourceLocation: '',
    destinationLocation: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [capturedPaymentMethod, setCapturedPaymentMethod] = useState(''); // Stores method from Razorpay
  const [bookedDates, setBookedDates] = useState([]);
  const [loadingBookedDates, setLoadingBookedDates] = useState(false);

  React.useEffect(() => {
    if (car && car._id) {
      setLoadingBookedDates(true);
      api.get(`/cars/${car._id}/booked-dates`)
        .then(res => setBookedDates(res.data))
        .catch(err => console.error("Could not fetch booked dates", err))
        .finally(() => setLoadingBookedDates(false));
    }
  }, [car]);

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

  const getRequestedDates = () => {
    if (!formData.checkOutDate || !formData.checkInDate) return null;
    
    // Combine date and time for robust parsing as Local Time
    const startTimeStr = formData.pickupTime ? `${formData.checkOutDate}T${formData.pickupTime}` : `${formData.checkOutDate}T00:00`;
    const start = new Date(startTimeStr);
    
    const endTimeStr = `${formData.checkInDate}T23:59:59`;
    const end = new Date(endTimeStr);
    
    return { start, end };
  };

  const validateTrip = () => {
    const dates = getRequestedDates();
    if (!dates) return false;
    const { start: requestedCheckOut, end: requestedCheckIn } = dates;

    const now = new Date();
    const nowTime = now.getTime();
    
    // Safety check for invalid dates
    if (isNaN(requestedCheckOut.getTime())) {
      alert("Invalid start date or pick-up time. Please check your selection.");
      return false;
    }

    const startTime = requestedCheckOut.getTime();
    const minimumLeadTime = 60 * 1000 * 60; // 1 hour

    // Case 1: Time is in the total past (even by a second)
    if (startTime < nowTime) {
      alert("Error: Pick-up time cannot be in the past. Please select a future date and time.");
      return false;
    }

    // Case 2: Time is less than 1 hour in the future
    if (startTime < (nowTime + minimumLeadTime)) {
      alert("Policies: Pick-up time must be at least 1 hour from the current time. Please choose a later time.");
      return false;
    }

    if (requestedCheckIn < requestedCheckOut) {
      alert("Return date cannot be before rental start date.");
      return false;
    }

    const hasOverlap = bookedDates.some(range => {
      const existingCheckOut = new Date(range.checkOutDate);
      const existingCheckIn = new Date(range.checkInDate);
      return requestedCheckOut < existingCheckIn && requestedCheckIn > existingCheckOut;
    });

    if (hasOverlap) {
      alert("The car is already booked for these dates. Please select other dates.");
      return false;
    }

    return true;
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!validateTrip()) return;

    const days = calculateDays();
    const cost = (car.rentPerDay * days) + (70 * days);
    setTotalCost(cost);
    setStep(2);
  };
  
  const { user } = useContext(AuthContext);

  const handleRazorpayPayment = async () => {
    if (!validateTrip()) return;
    setIsProcessing(true);

    try {
      const dates = getRequestedDates();
      // Step 1: Create a Pending Rental
      const rentalRes = await api.post('/rentals', {
        carId: car._id,
        checkOutDate: formData.checkOutDate,
        checkInDate: formData.checkInDate,
        startEpoch: dates.start.getTime(),
        endEpoch: dates.end.getTime(),
        pickupTime: formData.pickupTime,
        phone: formData.phone,
        sourceLocation: formData.sourceLocation,
        destinationLocation: formData.destinationLocation,
        totalCost: totalCost,
        paymentMethod: 'Online'
      });

      const rental = rentalRes.data;

      // Step 2: Create Razorpay Order
      const orderRes = await api.post('/payments/razorpay-order', {
        rentalId: rental._id
      });

      const order = orderRes.data;

      // Step 3: Configure Razorpay Options
      const options = {
        key: "rzp_test_SdDxqYUcvtM9li", // This is the public test key
        amount: order.amount,
        currency: order.currency,
        name: "Antigravity Car Rentals",
        description: `Booking for ${car.make} ${car.model}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            // Step 4: Verify Payment on Backend
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              rentalId: rental._id
            });

            if (verifyRes.data.rental) {
              setCapturedPaymentMethod(verifyRes.data.rental.paymentMethod);
              setStep(4); // Success Screen
              setTimeout(() => {
                onSuccess();
              }, 4000);
            }
          } catch (err) {
            console.error("Verification Error:", err);
            alert("Payment verification failed. Please contact support.");
            setStep(1);
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: formData.phone || ""
        },
        theme: {
          color: "#007bff"
        },
        modal: {
          ondismiss: async function() {
            try {
              setIsProcessing(false);
              await api.post(`/rentals/cancel-pending/${rental._id}`);
            } catch (err) {
              console.error("Error cancelling pending rental:", err);
            }
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("Payment Initiation Error:", err);
      alert(err.response?.data?.message || 'Error initiating payment.');
      setIsProcessing(false);
    }
  };

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
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000
    }}>
      <div className="animate-fade-in" style={{
        maxWidth: '850px', width: '95%', maxHeight: '90vh', overflowY: 'auto', position: 'relative',
        background: 'var(--surface)', border: '1px solid var(--glass-border)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', borderRadius: '32px', padding: '3rem'
      }}>
        {step !== 4 && (
          <button
            onClick={onClose}
            style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FaArrowLeft /> Back
          </button>
        )}

        {/* Step 1: Trip Details */}
        {step === 1 && (
          <div>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', marginTop: '1rem', textAlign: 'center' }}>Book {car.make} {car.model}</h2>
            <form onSubmit={handleCalculate}>

              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><FaMapMarkerAlt /> Routing</h4>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label>Pickup Location</label>
                  <input type="text" className="form-control" name="sourceLocation" value={formData.sourceLocation} onChange={handleInputChange} required placeholder="Enter pickup address" />
                </div>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label>Destination Address</label>
                  <input type="text" className="form-control" name="destinationLocation" value={formData.destinationLocation} onChange={handleInputChange} required placeholder="Enter drop-off address" />
                </div>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label>Contact Phone Number</label>
                  <input type="tel" className="form-control" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="e.g. +91 98765 43210" />
                </div>
              </div>

              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', marginBottom: '1rem' }}><FaCalendarAlt /> Dates & Time</h4>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label>Start Date</label>
                  <input type="date" className="form-control" name="checkOutDate" value={formData.checkOutDate} onChange={handleInputChange} min={new Date().toLocaleDateString('en-CA')} required />
                </div>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label>Pick-up Time</label>
                  <input type="time" className="form-control" name="pickupTime" value={formData.pickupTime} onChange={handleInputChange} required />
                </div>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label>Expected Return</label>
                  <input type="date" className="form-control" name="checkInDate" value={formData.checkInDate} onChange={handleInputChange} min={formData.checkOutDate || new Date().toLocaleDateString('en-CA')} required />
                </div>
              </div>

              {bookedDates.length > 0 && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,193,7,0.1)', borderLeft: '4px solid #ffc107', borderRadius: '4px' }}>
                  <h5 style={{ margin: 0, color: '#ffc107', marginBottom: '0.5rem' }}>Currently Booked Dates:</h5>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-color)', fontSize: '0.9rem' }}>
                    {bookedDates.map((date, idx) => (
                      <li key={idx}>
                        {new Date(date.checkOutDate).toLocaleDateString()} to {new Date(date.checkInDate).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                  <small className="text-muted" style={{ display: 'block', marginTop: '0.5rem' }}>Please select dates that do not overlap with the above.</small>
                </div>
              )}

              <div className="text-center mt-4">
                <button type="submit" className="btn primary-btn" style={{ background: 'var(--primary)', color: '#000', border: 'none', borderRadius: '8px', width: '100%', fontSize: '1.1rem', padding: '1rem', cursor: 'pointer', fontWeight: 'bold' }}>Calculate Rental Cost</button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Invoice & Payment */}
        {step === 2 && (
          <div>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', marginTop: '1rem', textAlign: 'center' }}>Booking Summary</h2>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Pickup Point:</span> <strong>{formData.sourceLocation}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Car:</span> <strong>{car.make} {car.model}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Days:</span> <strong>{calculateDays()} Days</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Base Rent (₹{car.rentPerDay}/day):</span> <strong>₹{car.rentPerDay * calculateDays()}</strong>
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
              <button className="btn btn-secondary" style={{ flex: 2, background: 'var(--secondary)', color: '#fff', border: 'none', borderRadius: '8px', padding: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }} onClick={handleRazorpayPayment} disabled={isProcessing}>
                {isProcessing ? (
                  <><FaSpinner className="animate-spin" /> Processing...</>
                ) : (
                  <><FaCreditCard /> Proceed to Secure Payment</>
                )}
              </button>
            </div>
          </div>
        )}


        {/* Step 4: Success Screen */}
        {step === 4 && (
          <div className="text-center animate-fade-in" style={{ padding: '2rem 1rem' }}>
            <FaCheckCircle style={{ fontSize: '5rem', color: 'var(--success)', marginBottom: '1.5rem', display: 'block', margin: '0 auto' }} />
            <h2 style={{ color: 'var(--success)', marginBottom: '1rem' }}>Transaction Successful!</h2>
            <p className="text-muted" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Paid via {capturedPaymentMethod}</p>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Payment of ₹{totalCost} received.</p>
            <p style={{ fontWeight: '500' }}>Your {car.make} {car.model} is successfully booked! Navigating back...</p>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
};

export default RentalBookingModal;
