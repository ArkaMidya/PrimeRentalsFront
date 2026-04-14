import React, { useState } from 'react';
import { FaTimes, FaPlus, FaSave, FaEdit, FaTrash } from 'react-icons/fa';
import api from '../api/axios';

const ServiceHistoryModal = ({ car, onClose, onUpdate }) => {
  const [history, setHistory] = useState(car.serviceHistory || []);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    serviceDate: '',
    description: '',
    cost: '',
    serviceCenter: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddClick = () => {
    setEditId(null);
    setFormData({ serviceDate: '', description: '', cost: '', serviceCenter: '' });
  };

  const handleEditClick = (record) => {
    setEditId(record._id);
    setFormData({
      serviceDate: new Date(record.serviceDate).toISOString().split('T')[0],
      description: record.description,
      cost: record.cost,
      serviceCenter: record.serviceCenter
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editId) {
        res = await api.put(`/cars/${car._id}/services/${editId}`, formData);
      } else {
        res = await api.post(`/cars/${car._id}/services`, formData);
      }
      setHistory(res.data);
      onUpdate && onUpdate(car._id, res.data);
      handleAddClick(); // Reset form
    } catch (err) {
      alert('Failed to save service record: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this service record?')) return;
    try {
      const res = await api.delete(`/cars/${car._id}/services/${recordId}`);
      setHistory(res.data);
      onUpdate && onUpdate(car._id, res.data);
    } catch (err) {
      alert('Failed to delete service record: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto',
        position: 'relative', padding: '2rem'
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem' }}
        >
          <FaTimes />
        </button>

        <h2 style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }}>
          Service History - {car.make} {car.model}
        </h2>

        {/* Existing Service Table */}
        <div style={{ marginBottom: '2rem' }}>
          <h4>Past Service Records</h4>
          <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '0.75rem' }}>Date</th>
                <th style={{ padding: '0.75rem' }}>Description</th>
                <th style={{ padding: '0.75rem' }}>Service Center</th>
                <th style={{ padding: '0.75rem' }}>Cost</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map(record => (
                <tr key={record._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem' }}>{new Date(record.serviceDate).toLocaleDateString()}</td>
                  <td style={{ padding: '0.75rem' }}>{record.description}</td>
                  <td style={{ padding: '0.75rem' }}>{record.serviceCenter}</td>
                  <td style={{ padding: '0.75rem' }}>₹{record.cost}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <button className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', marginRight: '0.5rem', borderColor: 'var(--primary)', color: 'var(--primary)' }} onClick={() => handleEditClick(record)}>
                      <FaEdit />
                    </button>
                    <button className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => handleDelete(record._id)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-muted" style={{ padding: '1rem' }}>No service history found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Form */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '8px' }}>
          <h4>{editId ? 'Edit Service Record' : 'Add New Service Record'}</h4>
          <form onSubmit={handleSave} style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label>Service Date</label>
              <input type="date" name="serviceDate" className="form-control" value={formData.serviceDate} onChange={handleInputChange} required />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label>Service Center</label>
              <input type="text" name="serviceCenter" className="form-control" value={formData.serviceCenter} onChange={handleInputChange} required />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label>Cost (₹)</label>
              <input type="number" name="cost" className="form-control" value={formData.cost} onChange={handleInputChange} required min="0" />
            </div>
            <div style={{ flex: '1 1 100%' }}>
              <label>Description</label>
              <input type="text" name="description" className="form-control" value={formData.description} onChange={handleInputChange} required />
            </div>
            <div style={{ flex: '1 1 100%', textAlign: 'right', marginTop: '0.5rem' }}>
              {editId && (
                <button type="button" className="btn btn-outline" style={{ marginRight: '1rem' }} onClick={handleAddClick}>
                  Cancel Edit
                </button>
              )}
              <button type="submit" className="btn btn-secondary">
                <FaSave /> {editId ? 'Update Record' : 'Save New Record'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ServiceHistoryModal;
