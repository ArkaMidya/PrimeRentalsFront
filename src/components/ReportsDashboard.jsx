import React, { useState, useMemo } from 'react';
import { FaFilePdf, FaFileExcel, FaFilter, FaTable, FaChartLine, FaCar, FaMoneyBillWave, FaWrench, FaCheckCircle } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const ReportsDashboard = ({ cars = [], rentals = [] }) => {
  const [reportType, setReportType] = useState('CAR_HISTORY');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Computations for KPIs
  const globalKPIs = useMemo(() => {
    return {
      totalCars: cars.length,
      revenue: rentals.reduce((sum, r) => sum + parseFloat(r.totalCost || 0), 0),
      totalRentals: rentals.length,
      servicing: cars.filter(c => c.status === 'Servicing').length
    };
  }, [cars, rentals]);

  // Computation for Monthly Trends
  const monthlyData = useMemo(() => {
    const m = {};
    rentals.forEach(r => {
      if (r.createdAt) {
        const d = new Date(r.createdAt);
        const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        if (!m[key]) m[key] = { month: key, revenue: 0, rentals: 0, sort: d.getFullYear() * 100 + d.getMonth() };
        m[key].revenue += parseFloat(r.totalCost || 0);
        m[key].rentals += 1;
      }
    });
    return Object.values(m).sort((a,b) => a.sort - b.sort);
  }, [rentals]);

  // Generate the flat data based on selected report type
  const rawData = useMemo(() => {
    switch (reportType) {
      case 'CAR_HISTORY':
        return cars.map(car => ({
          _id: car._id,
          makeModel: `${car.make} ${car.model}`,
          year: car.year,
          mileage: car.mileage,
          serviceCount: car.serviceHistory ? car.serviceHistory.length : 0,
          status: car.status,
          dateJoined: new Date(car.createdAt).toLocaleDateString()
        }));

      case 'CHECK_IN_OUT':
        return rentals.map(r => ({
          _id: r._id,
          makeModel: r.carId ? `${r.carId.make} ${r.carId.model}` : (r.carName || 'Deleted Vehicle'),
          customer: r.userId?.name || 'Unknown',
          checkOutDate: new Date(r.checkOutDate).toLocaleDateString(),
          pickupTime: r.pickupTime || 'N/A', // Added pickupTime
          checkInDate: new Date(r.checkInDate).toLocaleDateString(),
          rawDate: new Date(r.checkOutDate).getTime(),
          status: r.rentalStatus
        }));

      case 'SERVICING':
        const servicingLogs = [];
        cars.forEach(car => {
          if (car.serviceHistory && car.serviceHistory.length > 0) {
            car.serviceHistory.forEach(s => {
              servicingLogs.push({
                _id: s._id,
                makeModel: `${car.make} ${car.model}`,
                serviceDate: new Date(s.serviceDate).toLocaleDateString(),
                rawDate: new Date(s.serviceDate).getTime(),
                serviceCenter: s.serviceCenter,
                description: s.description,
                cost: `$${s.cost}`
              });
            });
          }
        });
        return servicingLogs;

      case 'PAYMENTS':
        return rentals.map(r => ({
          _id: r._id,
          makeModel: r.carId ? `${r.carId.make} ${r.carId.model}` : (r.carName || 'Deleted Vehicle'),
          customer: r.userId?.name || 'Unknown',
          transactionDate: new Date(r.createdAt).toLocaleDateString(),
          rawDate: new Date(r.createdAt).getTime(),
          cost: `$${r.totalCost || 0}`,
          method: r.paymentMethod || 'N/A',
          paymentStatus: r.rentalStatus === 'Completed' ? 'Cleared' : 'Pending'
        }));

      default:
        return [];
    }
  }, [reportType, cars, rentals]);

  // Apply User Filters
  const processedData = useMemo(() => {
    return rawData.filter(item => {
      // 1. Text Search Filter (applies to makeModel predominantly)
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const mmMatch = item.makeModel && item.makeModel.toLowerCase().includes(q);
        const cMatch = item.customer && item.customer.toLowerCase().includes(q);
        if (!mmMatch && !cMatch) return false;
      }

      // 2. Date Filter
      if (startDate || endDate) {
        let itemDate = item.rawDate; 
        if (!itemDate && reportType === 'CAR_HISTORY') {
          // fallback to date joined parsing if not provided as rawDate
          itemDate = new Date(item.dateJoined).getTime();
        }
        
        if (itemDate) {
          const sDate = startDate ? new Date(startDate).getTime() : 0;
          const eDate = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : Infinity;
          if (itemDate < sDate || itemDate > eDate) return false;
        }
      }

      return true;
    });
  }, [rawData, searchQuery, startDate, endDate, reportType]);


  // Headers mapped by report type
  const getHeaders = () => {
    switch (reportType) {
      case 'CAR_HISTORY': return ['Make / Model', 'Year', 'Mileage', 'Services count', 'Status', 'Date Joined'];
      case 'CHECK_IN_OUT': return ['Vehicle', 'Customer', 'Check-Out Date', 'Pick-up Time', 'Return expected', 'Rental Status'];
      case 'SERVICING': return ['Vehicle', 'Service Date', 'Service Center', 'Description', 'Cost'];
      case 'PAYMENTS': return ['Transaction Date', 'Customer', 'Vehicle', 'Cost', 'Payment Mode', 'Status'];
      default: return [];
    }
  };

  // Maps filtered objects to arrays for export APIs
  const extractRowData = (item) => {
    switch (reportType) {
      case 'CAR_HISTORY': return [item.makeModel, item.year, item.mileage, item.serviceCount, item.status, item.dateJoined];
      case 'CHECK_IN_OUT': return [item.makeModel, item.customer, item.checkOutDate, item.pickupTime, item.checkInDate, item.status];
      case 'SERVICING': return [item.makeModel, item.serviceDate, item.serviceCenter, item.description, item.cost];
      case 'PAYMENTS': return [item.transactionDate, item.customer, item.makeModel, item.cost, item.method, item.paymentStatus];
      default: return [];
    }
  };


  // Action: Export PDF
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.text(`System Report: ${reportType.replace(/_/g, ' ')}`, 14, 22);
      
      // Sub-title / Date info
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
      if (startDate || endDate) {
        doc.text(`Filtered From: ${startDate || 'beginning'} To: ${endDate || 'now'}`, 14, 36);
      }

      const tableBody = processedData.map(item => extractRowData(item));

      autoTable(doc, {
        startY: 45,
        head: [getHeaders()],
        body: tableBody,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [15, 23, 42] }
      });

      doc.save(`Report_${reportType}_${new Date().getTime()}.pdf`);
    } catch (err) {
      console.error("PDF Export failed: ", err);
      alert("Failed to export PDF! Check console for details.");
    }
  };

  // Action: Export Excel
  const handleExportExcel = () => {
    const headerParams = getHeaders();
    
    // Creating worksheet JSON manually matching headers
    const wsData = [headerParams];
    processedData.forEach(item => {
      wsData.push(extractRowData(item));
    });

    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report Data");
    
    XLSX.writeFile(workbook, `Report_${reportType}_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 0 2rem 0' }}>
      
      {/* 1. TOP KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Total Fleet', value: globalKPIs.totalCars, icon: <FaCar size={24}/>, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
          { label: 'Total Revenue', value: `₹${globalKPIs.revenue.toLocaleString()}`, icon: <FaMoneyBillWave size={24}/>, color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
          { label: 'Completed Rentals', value: globalKPIs.totalRentals, icon: <FaCheckCircle size={24}/>, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
          { label: 'In Servicing', value: globalKPIs.servicing, icon: <FaWrench size={24}/>, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' }
        ].map((kpi, i) => (
          <div key={i} className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
            <div style={{ padding: '1rem', background: kpi.bg, color: kpi.color, borderRadius: '12px' }}>
              {kpi.icon}
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>{kpi.label}</p>
              <h2 style={{ margin: 0, color: 'var(--text-color)' }}>{kpi.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* 2. CHARTS OVERVIEW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ height: '350px' }}>
          <h3 style={{ marginLeft: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaChartLine color="#16a34a"/> Monthly Revenue Growth</h3>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <ChartTooltip contentStyle={{ backgroundColor: 'rgb(15,23,42)', borderColor: 'rgba(255,255,255,0.1)' }} />
              <Area type="monotone" dataKey="revenue" stroke="#16a34a" fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel" style={{ height: '350px' }}>
          <h3 style={{ marginLeft: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaCar color="#8b5cf6"/> Rental Booking Volume</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" allowDecimals={false} />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <ChartTooltip contentStyle={{ backgroundColor: 'rgb(15,23,42)', borderColor: 'rgba(255,255,255,0.1)' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
              <Bar dataKey="rentals" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaTable /> Automated Reporting Engine
        </h2>

      {/* Control Panel */}
      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Row 1: Report Type & Text Search */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Report Category</label>
            <select className="form-control" value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="CAR_HISTORY">Car History & Status</option>
              <option value="CHECK_IN_OUT">Check-In / Check-Out Log</option>
              <option value="SERVICING">Servicing & Maintenance Records</option>
              <option value="PAYMENTS">Payment Transactions</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Search by Make/Model or Customer</label>
            <input type="text" className="form-control" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        {/* Row 2: Deep Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}><FaFilter /> Date Range (From)</label>
            <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Date Range (To)</label>
            <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

      </div>

      {/* Export Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h4 style={{ margin: 0 }}>Showing {processedData.length} Results</h4>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', borderColor: '#dc2626' }} onClick={handleExportPDF} disabled={processedData.length === 0}>
            <FaFilePdf /> Export to PDF
          </button>
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', borderColor: '#16a34a' }} onClick={handleExportExcel} disabled={processedData.length === 0}>
            <FaFileExcel /> Export to Excel
          </button>
        </div>
      </div>

      {/* Preview Table */}
      <div style={{ overflowX: 'auto', marginTop: '1.5rem', background: 'rgba(255,255,255,0.01)', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
              {getHeaders().map((h, i) => (
                <th key={i} style={{ padding: '1rem', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processedData.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', transition: '0.2s', ':hover': { background: 'rgba(255,255,255,0.02)' } }}>
                {extractRowData(item).map((val, colIdx) => (
                  <td key={colIdx} style={{ padding: '0.85rem 1rem' }}>{val}</td>
                ))}
              </tr>
            ))}
            {processedData.length === 0 && (
              <tr>
                <td colSpan={getHeaders().length} className="text-center text-muted" style={{ padding: '2rem' }}>
                  No matching records found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
    </div>
  );
};

export default ReportsDashboard;
