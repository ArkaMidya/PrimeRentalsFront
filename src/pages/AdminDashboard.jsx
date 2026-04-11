import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { FaPlus, FaCar, FaList, FaTrash, FaEdit, FaInfoCircle, FaSave, FaTimes, FaWrench, FaChartBar, FaCheckCircle } from 'react-icons/fa';
import CarDetailsModal from '../components/CarDetailsModal';
import ServiceHistoryModal from '../components/ServiceHistoryModal';
import ReportsDashboard from '../components/ReportsDashboard'; // IMPORT REPORTS

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('FLEET'); // High-level navigation state

  const [cars, setCars] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [manageServiceCar, setManageServiceCar] = useState(null); // Service History Modal

  // Filter state
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState(''); // Search bar state

  // New & Update Car Form State
  const [showCarForm, setShowCarForm] = useState(false);
  const [editModeId, setEditModeId] = useState(null);

  const [formData, setFormData] = useState({
    make: '', model: '', year: '', description: '', mileage: '',
    engineType: '', engineCapacity: '', engineHp: '',
    servicingDetails: '',
    insuranceReg: '', insuranceExp: '', insuranceProv: ''
  });

  const [parts, setParts] = useState([]);

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
      setRentals(rentalsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddPart = () => {
    setParts([...parts, { partName: '', condition: '' }]);
  };

  const updatePart = (index, field, value) => {
    const updated = [...parts];
    updated[index][field] = value;
    setParts(updated);
  };

  const removePart = (index) => {
    const updated = [...parts];
    updated.splice(index, 1);
    setParts(updated);
  };

  const resetForm = () => {
    setFormData({
      make: '', model: '', year: '', description: '', mileage: '',
      engineType: '', engineCapacity: '', engineHp: '',
      servicingDetails: '',
      insuranceReg: '', insuranceExp: '', insuranceProv: ''
    });
    setParts([]);
    setEditModeId(null);
    setShowCarForm(false);
  };

  const handleOpenEdit = (car) => {
    setFormData({
      make: car.make || '', model: car.model || '', year: car.year || '',
      description: car.description || '', mileage: car.mileage || '',
      engineType: car.engineDetails?.type || '',
      engineCapacity: car.engineDetails?.capacity || '',
      engineHp: car.engineDetails?.hp || '',
      servicingDetails: car.servicingDetails || '',
      insuranceReg: car.insurance?.registrationNumber || '',
      insuranceExp: car.insurance?.expirationDate ? new Date(car.insurance.expirationDate).toISOString().split('T')[0] : '',
      insuranceProv: car.insurance?.provider || ''
    });
    setParts(car.partsDetails || []);
    setEditModeId(car._id);
    setShowCarForm(true);
  };

  const handleSubmitCar = async (e) => {
    e.preventDefault();
    const payload = {
      make: formData.make,
      model: formData.model,
      year: Number(formData.year),
      description: formData.description,
      mileage: Number(formData.mileage) || 0,
      servicingDetails: formData.servicingDetails,
      engineDetails: {
        type: formData.engineType,
        capacity: formData.engineCapacity,
        hp: Number(formData.engineHp) || 0
      },
      insurance: {
        registrationNumber: formData.insuranceReg,
        expirationDate: formData.insuranceExp || null,
        provider: formData.insuranceProv
      },
      partsDetails: parts.filter(p => p.partName.trim() !== '')
    };

    try {
      if (editModeId) {
        await api.put(`/cars/${editModeId}`, payload);
        alert('Car successfully updated!');
      } else {
        await api.post('/cars', payload);
        alert('Car successfully added to fleet!');
      }
      resetForm();
      fetchData();
    } catch (err) {
      alert('Error saving car: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteCar = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this car?")) {
      try {
        await api.delete(`/cars/${id}`);
        fetchData();
      } catch (err) {
        alert("Failed to delete car.");
      }
    }
  };

  const handleCompleteRental = async (rentalId) => {
    const mileageStr = window.prompt("Enter the total mileage (km) driven during this rental (or 0):", "0");
    if (mileageStr === null) return; // Cancelled

    try {
      await api.put(`/rentals/${rentalId}`, {
        rentalStatus: 'Completed',
        totalMileage: Number(mileageStr)
      });
      alert('Rental marked as Completed and mileage updated!');
      fetchData();
    } catch (err) {
      alert('Error updating rental: ' + (err.response?.data?.message || err.message));
    }
  };

  // derived state for cars
  const filteredCars = cars.filter(car => {
    // 1. Text Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const makeMatch = car.make && car.make.toLowerCase().includes(q);
      const modelMatch = car.model && car.model.toLowerCase().includes(q);
      if (!makeMatch && !modelMatch) return false;
    }

    if (serviceFilter === 'ALL') return true;
    
    // Status filters
    const todayStatus = new Date();
    // Resetting time to accurately compare dates.
    todayStatus.setHours(0, 0, 0, 0);

    const activeCarRentals = rentals.filter(r => (r.carId?._id || r.carId) === car._id && r.rentalStatus === 'Active');
    
    const isCurrentlyRented = activeCarRentals.some(r => {
      const checkOut = new Date(r.checkOutDate);
      const checkIn = new Date(r.checkInDate);
      checkOut.setHours(0, 0, 0, 0);
      checkIn.setHours(23, 59, 59, 999);
      return checkOut <= todayStatus && todayStatus <= checkIn;
    });

    const hasUpcoming = activeCarRentals.some(r => {
      const checkOut = new Date(r.checkOutDate);
      checkOut.setHours(0,0,0,0);
      return checkOut > todayStatus;
    });

    if (serviceFilter === 'AVAILABLE') return !isCurrentlyRented;
    if (serviceFilter === 'RENTED') return isCurrentlyRented;
    if (serviceFilter === 'UPCOMING') return hasUpcoming;

    // Rental frequency
    if (serviceFilter === 'FREQUENT' || serviceFilter === 'LESS_USED') {
      const carRentals = rentals.filter(r => (r.carId?._id || r.carId) === car._id);
      if (serviceFilter === 'FREQUENT') return carRentals.length >= 3;
      if (serviceFilter === 'LESS_USED') return carRentals.length < 3;
    }

    // Insurance filters
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expDate = car.insurance?.expirationDate ? new Date(car.insurance.expirationDate) : null;

    if (serviceFilter === 'INSURANCE_EXPIRED') return expDate && expDate < today;
    if (serviceFilter === 'INSURANCE_EXPIRING_SOON') return expDate && expDate >= today && expDate <= thirtyDaysFromNow;
    if (serviceFilter === 'INSURANCE_VALID') return expDate && expDate > today;

    // Service History logic
    const history = car.serviceHistory || [];
    let latestServiceDate = null;
    if (history.length > 0) {
      const dates = history.map(s => new Date(s.serviceDate).getTime());
      latestServiceDate = new Date(Math.max(...dates));
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    if (serviceFilter === 'RECENT') {
      return latestServiceDate && latestServiceDate >= thirtyDaysAgo;
    }
    if (serviceFilter === 'OVERDUE') {
      return !latestServiceDate || latestServiceDate < sixMonthsAgo;
    }
    return true;
  });

  const onServiceUpdate = (carId, updatedHistory) => {
    setCars(prev => prev.map(c => c._id === carId ? { ...c, serviceHistory: updatedHistory } : c));
  };


  if (loading) return <div className="text-center mt-4">Loading Admin Dashboard...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className="btn" 
          style={{ padding: '0.8rem 2rem', border: activeTab === 'FLEET' ? '2px solid var(--primary)' : '2px solid transparent', background: activeTab === 'FLEET' ? 'rgba(255,183,3,0.1)' : 'transparent', color: activeTab === 'FLEET' ? 'var(--primary)' : 'var(--text-muted)' }}
          onClick={() => setActiveTab('FLEET')}
        >
          <FaCar /> Fleet Management
        </button>
        <button 
          className="btn" 
          style={{ padding: '0.8rem 2rem', border: activeTab === 'REPORTS' ? '2px solid var(--primary)' : '2px solid transparent', background: activeTab === 'REPORTS' ? 'rgba(255,183,3,0.1)' : 'transparent', color: activeTab === 'REPORTS' ? 'var(--primary)' : 'var(--text-muted)' }}
          onClick={() => setActiveTab('REPORTS')}
        >
          <FaChartBar /> Analytics & Reports
        </button>
      </div>

      {activeTab === 'REPORTS' ? (
        <ReportsDashboard cars={cars} rentals={rentals} />
      ) : (
      <>
        <h1 className="mb-4 text-center" style={{ color: 'var(--primary)' }}>Admin Command Center</h1>
        
        {!showCarForm && (
          <div className="text-center mb-4">
            <button className="btn btn-primary" onClick={() => setShowCarForm(true)}>
              <FaPlus /> Register New Vehicle
            </button>
          </div>
        )}

        {showCarForm && (
        <div className="glass-panel animate-fade-in" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>{editModeId ? 'Update Vehicle' : 'Register New Vehicle'}</h2>
            <button className="btn btn-outline" onClick={resetForm}><FaTimes /> Cancel</button>
          </div>
          <form onSubmit={handleSubmitCar} style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              
              {/* Basic Info */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
                <h4>Basic Info</h4>
                <div className="form-group mt-4">
                  <label>Make</label>
                  <input type="text" name="make" className="form-control" value={formData.make} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Model</label>
                  <input type="text" name="model" className="form-control" value={formData.model} onChange={handleInputChange} required />
                </div>
                <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label>Year</label>
                    <input type="number" name="year" className="form-control" value={formData.year} onChange={handleInputChange} required />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Mileage (km/L)</label>
                    <input type="number" name="mileage" className="form-control" value={formData.mileage} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" className="form-control" value={formData.description} onChange={handleInputChange} rows="3" />
                </div>
              </div>

              {/* Engine & Servicing */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
                <h4>Engine Details</h4>
                <div className="form-group mt-4">
                  <label>Engine Type (e.g. V6, V8, Electric)</label>
                  <input type="text" name="engineType" className="form-control" value={formData.engineType} onChange={handleInputChange} />
                </div>
                <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label>Capacity</label>
                    <input type="text" name="engineCapacity" className="form-control" value={formData.engineCapacity} onChange={handleInputChange} placeholder="e.g. 2.0L" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Horsepower</label>
                    <input type="number" name="engineHp" className="form-control" value={formData.engineHp} onChange={handleInputChange} />
                  </div>
                </div>

                <h4 style={{ marginTop: '1.5rem' }}>Servicing Info</h4>
                <div className="form-group mt-4">
                  <label>Initial Servicing Details & Notes</label>
                  <textarea name="servicingDetails" className="form-control" value={formData.servicingDetails} onChange={handleInputChange} rows="3" />
                </div>
              </div>

              {/* Insurance & Parts */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
                <h4>Insurance</h4>
                <div className="form-group mt-4">
                  <label>Registration Number</label>
                  <input type="text" name="insuranceReg" className="form-control" value={formData.insuranceReg} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Expiration Date</label>
                  <input type="date" name="insuranceExp" className="form-control" value={formData.insuranceExp} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Provider</label>
                  <input type="text" name="insuranceProv" className="form-control" value={formData.insuranceProv} onChange={handleInputChange} />
                </div>

                <h4 style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                  Parts Info 
                  <button type="button" className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={handleAddPart}>+ Add Part</button>
                </h4>
                {parts.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <input type="text" placeholder="Part Name" className="form-control" value={p.partName} onChange={e => updatePart(idx, 'partName', e.target.value)} style={{ flex: 1 }} />
                    <input type="text" placeholder="Condition" className="form-control" value={p.condition} onChange={e => updatePart(idx, 'condition', e.target.value)} style={{ flex: 1 }} />
                    <button type="button" className="btn btn-danger" onClick={() => removePart(idx)}><FaTimes /></button>
                  </div>
                ))}
              </div>

            </div>
            <div className="text-center mt-4">
              <button type="submit" className="btn btn-secondary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                <FaSave /> {editModeId ? 'Save Changes' : 'Submit New Vehicle Info'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        
        {/* Fleet Overview */}
        <div className="glass-panel" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h3><FaCar /> Fleet Overview</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search by Make..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: 'var(--bg-color)', color: 'var(--text-color)', maxWidth: '200px' }}
              />
              <select 
                className="form-control" 
                style={{ width: 'auto', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
              >
                <optgroup label="General">
                  <option value="ALL">All Cars</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="RENTED">Currently Rented</option>
                  <option value="UPCOMING">Upcoming Bookings</option>
                </optgroup>
                <optgroup label="Utilization">
                  <option value="FREQUENT">Frequently Rented (3+)</option>
                  <option value="LESS_USED">Less Used (&lt;3)</option>
                </optgroup>
                <optgroup label="Maintenance">
                  <option value="RECENT">Recently Serviced (Last 30 Days)</option>
                  <option value="OVERDUE">Overdue for Service (&gt;6 Months or None)</option>
                </optgroup>
                <optgroup label="Insurance">
                  <option value="INSURANCE_VALID">Valid Insurance</option>
                  <option value="INSURANCE_EXPIRING_SOON">Expiring Soon (&lt;1 Month)</option>
                  <option value="INSURANCE_EXPIRED">Expired Insurance</option>
                </optgroup>
              </select>
            </div>
          </div>
          
          <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Vehicle</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Efficiency (km/L)</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCars.map(car => {
                const todayStatus = new Date();
                todayStatus.setHours(0, 0, 0, 0);
                const activeCarRentals = rentals.filter(r => (r.carId?._id || r.carId) === car._id && r.rentalStatus === 'Active');
                const isCurrentlyRented = activeCarRentals.some(r => {
                  const checkOut = new Date(r.checkOutDate);
                  const checkIn = new Date(r.checkInDate);
                  checkOut.setHours(0, 0, 0, 0);
                  checkIn.setHours(23, 59, 59, 999);
                  return checkOut <= todayStatus && todayStatus <= checkIn;
                });
                const displayStatus = isCurrentlyRented ? 'Rented' : 'Available';

                return (
                <tr key={car._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>
                    <strong>{car.make} {car.model}</strong> ({car.year})
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge badge-${displayStatus === 'Available' ? 'success' : 'warning'}`}>{displayStatus}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>{car.mileage} km/L</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button className="btn btn-outline" style={{ border: 'none', color: '#ffb703' }} title="Manage Service History" onClick={() => setManageServiceCar(car)}>
                      <FaWrench />
                    </button>
                    <button className="btn btn-outline" style={{ border: 'none', color: 'var(--secondary)' }} title="View Details" onClick={() => setSelectedCar(car)}>
                      <FaInfoCircle />
                    </button>
                    <button className="btn btn-outline" style={{ border: 'none', color: 'var(--primary)' }} title="Edit Car" onClick={() => handleOpenEdit(car)}>
                      <FaEdit />
                    </button>
                    <button className="btn btn-outline" style={{ border: 'none', color: 'var(--danger)' }} title="Delete Car" onClick={() => handleDeleteCar(car._id)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              );})}
            </tbody>
          </table>
          {filteredCars.length === 0 && <p className="text-muted text-center mt-4">No cars matched the filter.</p>}
        </div>

        {/* Recent Rentals */}
        <div className="glass-panel" style={{ gridColumn: '1 / -1' }}>
          <h3><FaList /> System-wide Active & Past Rentals</h3>
          <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Order ID</th>
                <th style={{ padding: '1rem' }}>Car</th>
                <th style={{ padding: '1rem' }}>Customer</th>
                <th style={{ padding: '1rem' }}>Check Out Date</th>
                <th style={{ padding: '1rem' }}>Pick-up Time</th>
                <th style={{ padding: '1rem' }}>Payment Mode</th>
                <th style={{ padding: '1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map(rental => (
                <tr key={rental._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--primary)' }}>{rental.bookingId || 'N/A'}</td>
                  <td style={{ padding: '1rem' }}>{rental.carId ? `${rental.carId.make} ${rental.carId.model}` : rental.carName || 'Deleted Vehicle'}</td>
                  <td style={{ padding: '1rem' }}>{rental.userId?.name}</td>
                  <td style={{ padding: '1rem' }}>{new Date(rental.checkOutDate).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}>{rental.pickupTime || 'N/A'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>
                      {rental.paymentMethod || 'N/A'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <span className={`badge badge-${rental.rentalStatus === 'Completed' ? 'success' : 'primary'}`}>{rental.rentalStatus}</span>
                      {rental.rentalStatus === 'Active' && new Date() >= new Date(rental.checkInDate) && (
                        <button 
                          className="btn btn-outline" 
                          style={{ border: 'none', color: 'var(--success)', padding: 0, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }} 
                          onClick={() => handleCompleteRental(rental._id)}
                          title="Mark as Completed"
                        >
                          <FaCheckCircle /> Check-In
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rentals.length === 0 && <p className="text-center mt-4 text-muted">No rentals recorded.</p>}
        </div>
      </div>

      {selectedCar && <CarDetailsModal car={selectedCar} onClose={() => setSelectedCar(null)} />}
      
      {manageServiceCar && (
        <ServiceHistoryModal 
          car={manageServiceCar} 
          onClose={() => setManageServiceCar(null)} 
          onUpdate={onServiceUpdate}
        />
      )}
      
      </>
      )} {/* <-- Closing the activeTab ternary block */}
    </div>
  );
};

export default AdminDashboard;
