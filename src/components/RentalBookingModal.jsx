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
  const [isCalculating, setIsCalculating] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [tripDistanceKm, setTripDistanceKm] = useState(0);
  const [capturedPaymentMethod, setCapturedPaymentMethod] = useState(''); // Stores method from Razorpay
  const [bookedDates, setBookedDates] = useState([]);
  const [loadingBookedDates, setLoadingBookedDates] = useState(false);

  // --- Static fallback coordinates for major Indian cities ---
  const CITY_COORDS = {
    'kolkata': { lat: 22.5726, lon: 88.3639 },
    'delhi': { lat: 28.6139, lon: 77.2090 },
    'new delhi': { lat: 28.6139, lon: 77.2090 },
    'mumbai': { lat: 19.0760, lon: 72.8777 },
    'bengaluru': { lat: 12.9716, lon: 77.5946 },
    'bangalore': { lat: 12.9716, lon: 77.5946 },
    'chennai': { lat: 13.0827, lon: 80.2707 },
    'hyderabad': { lat: 17.3850, lon: 78.4867 },
    'ahmedabad': { lat: 23.0225, lon: 72.5714 },
    'pune': { lat: 18.5204, lon: 73.8567 },
    'jaipur': { lat: 26.9124, lon: 75.7873 },
    'lucknow': { lat: 26.8467, lon: 80.9462 },
    'surat': { lat: 21.1702, lon: 72.8311 },
    'kanpur': { lat: 26.4499, lon: 80.3319 },
    'nagpur': { lat: 21.1458, lon: 79.0882 },
    'patna': { lat: 25.5941, lon: 85.1376 },
    'indore': { lat: 22.7196, lon: 75.8577 },
    'thane': { lat: 19.2183, lon: 72.9781 },
    'bhopal': { lat: 23.2599, lon: 77.4126 },
    'visakhapatnam': { lat: 17.6868, lon: 83.2185 },
    'pimpri-chinchwad': { lat: 18.6278, lon: 73.7985 },
    'vadodara': { lat: 22.3072, lon: 73.1812 },
    'ghaziabad': { lat: 28.6692, lon: 77.4538 },
    'ludhiana': { lat: 30.9010, lon: 75.8573 },
    'agra': { lat: 27.1767, lon: 78.0081 },
    'nashik': { lat: 19.9975, lon: 73.7898 },
    'faridabad': { lat: 28.4089, lon: 77.3178 },
    'meerut': { lat: 28.9845, lon: 77.7064 },
    'rajkot': { lat: 22.3039, lon: 70.8022 },
    'varanasi': { lat: 25.3176, lon: 82.9739 },
    'srinagar': { lat: 34.0837, lon: 74.7973 },
    'aurangabad': { lat: 19.8762, lon: 75.3433 },
    'dhanbad': { lat: 23.7957, lon: 86.4304 },
    'amritsar': { lat: 31.6340, lon: 74.8723 },
    'navi mumbai': { lat: 19.0330, lon: 73.0297 },
    'allahabad': { lat: 25.4358, lon: 81.8463 },
    'prayagraj': { lat: 25.4358, lon: 81.8463 },
    'ranchi': { lat: 23.3441, lon: 85.3096 },
    'guwahati': { lat: 26.1445, lon: 91.7362 },
    'coimbatore': { lat: 11.0168, lon: 76.9558 },
    'jabalpur': { lat: 23.1815, lon: 79.9864 },
    'vijayawada': { lat: 16.5062, lon: 80.6480 },
    'jodhpur': { lat: 26.2389, lon: 73.0243 },
    'madurai': { lat: 9.9252, lon: 78.1198 },
    'raipur': { lat: 21.2514, lon: 81.6296 },
    'kochi': { lat: 9.9312, lon: 76.2673 },
    'cochin': { lat: 9.9312, lon: 76.2673 },
    'bhubaneswar': { lat: 20.2961, lon: 85.8245 },
    'chandigarh': { lat: 30.7333, lon: 76.7794 },
    'thiruvananthapuram': { lat: 8.5241, lon: 76.9366 },
    'trivandrum': { lat: 8.5241, lon: 76.9366 },
  };

  // --- Geocode a city name via Nominatim, with static fallback ---
  const geocodeLocation = async (location) => {
    const key = location.trim().toLowerCase();
    // 1. Try Nominatim
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1&countrycodes=in`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      }
    } catch (_) {
      console.warn('Nominatim lookup failed, using fallback dataset.');
    }
    // 2. Fallback to static dataset
    for (const city in CITY_COORDS) {
      if (key.includes(city) || city.includes(key)) {
        return CITY_COORDS[city];
      }
    }
    return null; // not found
  };

  // --- Haversine formula: returns distance in km ---
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

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

  const handleCalculate = async (e) => {
    e.preventDefault();
    if (!validateTrip()) return;

    setIsCalculating(true);
    try {
      const [srcCoords, dstCoords] = await Promise.all([
        geocodeLocation(formData.sourceLocation),
        geocodeLocation(formData.destinationLocation),
      ]);

      if (!srcCoords) {
        alert(`Could not find location: "${formData.sourceLocation}". Please enter a valid Indian city name.`);
        return;
      }
      if (!dstCoords) {
        alert(`Could not find location: "${formData.destinationLocation}". Please enter a valid Indian city name.`);
        return;
      }

      const dist = haversineDistance(srcCoords.lat, srcCoords.lon, dstCoords.lat, dstCoords.lon);
      const days = calculateDays();
      const distanceCost = dist * 5;
      const cost = (car.rentPerDay * days) + (70 * days) + distanceCost;

      setTripDistanceKm(dist);
      setTotalCost(cost);
      setStep(2);
    } finally {
      setIsCalculating(false);
    }
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
        tripDistanceKm: tripDistanceKm,
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
                <button type="submit" className="btn primary-btn" disabled={isCalculating} style={{ background: 'var(--primary)', color: '#000', border: 'none', borderRadius: '8px', width: '100%', fontSize: '1.1rem', padding: '1rem', cursor: isCalculating ? 'not-allowed' : 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: isCalculating ? 0.8 : 1 }}>
                  {isCalculating ? (<><FaSpinner className="animate-spin" /> Calculating Distance...</>) : 'Calculate Rental Cost'}
                </button>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Servicing Charge (₹70/day):</span> <strong>₹{70 * calculateDays()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Trip Distance:</span> <strong>{tripDistanceKm} km</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span>Distance Charge (₹5/km):</span> <strong>₹{tripDistanceKm * 5}</strong>
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
