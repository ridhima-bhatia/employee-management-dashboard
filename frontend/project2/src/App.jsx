import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const API_URL = 'http://localhost:5001/api/employees';

const Icon = ({ classes }) => <i className={`bi ${classes}`}></i>;

function App() {
  // --- STATE MANAGEMENT (Authentication state removed) ---
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ id: '', name: '', email: '', position: '', department: '', gender: '', dateOfJoining: '', photo: '', resume: '', resumeName: '' });
  const [filters, setFilters] = useState({ department: '', gender: '', startDate: '', endDate: '' });
  
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [formError, setFormError] = useState('');

  // --- EFFECTS ---
  // Modified: This effect now runs on component mount and when filters change.
  useEffect(() => {
    fetchEmployees();
  }, [filters]);

  // This effect for saving the dark mode preference remains.
  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);
  
  // --- HANDLERS ---
  const fetchEmployees = () => {
    axios.get(API_URL, { params: filters })
      .then(response => {
        if (Array.isArray(response.data)) {
          setEmployees(response.data);
        } else {
          console.error("Data received from API is not an array:", response.data);
          setEmployees([]);
        }
      })
      .catch(error => {
        console.error("Error fetching employees:", error);
        setEmployees([]);
      });
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const clearFilters = () => setFilters({ department: '', gender: '', startDate: '', endDate: '' });

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setForm((prevForm) => ({ ...prevForm, [fileType]: reader.result, [`${fileType}Name`]: file.name })); };
    reader.readAsDataURL(file);
  };

  const clearForm = () => {
    setForm({ id: '', name: '', email: '', position: '', department: '', gender: '', dateOfJoining: '', photo: '', resume: '', resumeName: '' });
    setIsEditing(false);
    setFormError('');
  };

  const handleAddOrUpdate = () => {
    setFormError('');
    if (!form.id || !form.name || !form.email || !form.position || !form.department || !form.gender || !form.dateOfJoining) {
      setFormError('All fields (except files) are required.');
      return;
    }
    const apiCall = isEditing ? axios.post(`${API_URL}/update/${form.id}`, form) : axios.post(`${API_URL}/add`, form);
    apiCall
      .then(() => { fetchEmployees(); clearForm(); })
      .catch(error => {
        console.error('Error submitting form:', error);
        const errorMessage = error.response?.data?.includes('E11000') ? 'An employee with this ID already exists.' : 'An error occurred while saving.';
        setFormError(errorMessage);
      });
  };

  const handleEdit = (emp) => {
    const { _id, __v, createdAt, updatedAt, ...formData } = emp;
    setForm(formData);
    setIsEditing(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      axios.delete(`${API_URL}/${id}`)
        .then(() => { fetchEmployees(); if (form.id === id) clearForm(); })
        .catch(error => { console.error("There was an error deleting the employee:", error); });
    }
  };

  const handleSort = (key) => {
    if (['photo', 'resume', 'actions'].includes(key)) return;
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  // --- DATA DERIVATION & STYLING ---
  const departmentCounts = employees.reduce((acc, emp) => { acc[emp.department] = (acc[emp.department] || 0) + 1; return acc; }, {});
  const departmentColorMap = Object.keys(departmentCounts).reduce((acc, dept, index) => {
      const colors = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1', '#0dcaf0'];
      acc[dept] = colors[index % colors.length]; return acc;
  }, {});
  const pieData = { labels: Object.keys(departmentCounts), datasets: [{ data: Object.values(departmentCounts), backgroundColor: Object.keys(departmentCounts).map(dept => departmentColorMap[dept]), borderColor: darkMode ? '#212529' : '#fff', borderWidth: 4, }], };
  const pieOptions = { plugins: { legend: { display: false } } };
  const filteredEmployees = employees.filter(emp => emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || emp.id.toLowerCase().includes(searchQuery.toLowerCase()) || emp.email.toLowerCase().includes(searchQuery.toLowerCase()));
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const valA = a[sortConfig.key]?.toString().toLowerCase() || ''; const valB = b[sortConfig.key]?.toString().toLowerCase() || '';
    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1; if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });
  const themeClass = darkMode ? 'dark-mode' : 'light-mode';
  
  // --- RENDER LOGIC (Login system removed) ---
  return (
    <div className={`app-container ${themeClass}`}>
      <style>{`
        .app-container { min-height: 100vh; transition: background-color 0.3s, color 0.3s; }
        .light-mode { background-color: #f8f9fa; color: #212529; }
        .dark-mode { background-color: #121212; color: #e0e0e0; }
        .card { border: 1px solid; transition: background-color 0.3s, border-color 0.3s; }
        .light-mode .card { background-color: #ffffff; border-color: #dee2e6; }
        .dark-mode .card { background-color: #1e1e1e; border-color: #424242; }
        .dark-mode .form-control, .dark-mode .form-select { background-color: #333; color: #e0e0e0; border-color: #555; }
        .dark-mode .form-control::placeholder { color: #888; }
        .dark-mode .form-control:focus, .dark-mode .form-select:focus { background-color: #444; border-color: #86b7fe; box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25); }
        .table { color: inherit; }
        .dark-mode .table { --bs-table-striped-bg: rgba(255, 255, 255, 0.05); --bs-table-hover-bg: rgba(255, 255, 255, 0.1); border-color: #424242; }
        .dark-mode .list-group-item { background-color: transparent !important; color: #e0e0e0 !important; }
        .dark-mode .card h5 { color: #ffffff; }
        .dark-mode .form-label { color: #e0e0e0; }
        .dark-mode th { color: #000000; }
      `}</style>
      <div className="container-fluid py-4">
        <header className="d-flex justify-content-between align-items-center mb-4 px-3">
            <h1 className="fw-bold fs-2"><Icon classes="bi-people-fill me-2"/> Employee Dashboard</h1>
            <div className="d-flex align-items-center gap-3">
                <div className="form-check form-switch fs-5">
                    <input className="form-check-input" type="checkbox" role="switch" id="darkModeSwitch" checked={darkMode} onChange={()=>setDarkMode(!darkMode)} />
                    <label className="form-check-label" htmlFor="darkModeSwitch">{darkMode ? <Icon classes="bi-moon-stars-fill"/> : <Icon classes="bi-sun-fill"/>}</label>
                </div>
            </div>
        </header>
        <main className="row g-4">
            <div className="col-lg-3">
                <div className="card p-3 h-100">
                    <h5 className="text-center fw-bold mb-3"><Icon classes="bi-pie-chart-fill me-2"/>Department Stats</h5>
                    <div className="px-4"><Pie data={pieData} options={pieOptions}/></div>
                    <ul className="list-group list-group-flush mt-3">{Object.entries(departmentCounts).map(([dept,count])=>(<li key={dept} className="list-group-item d-flex justify-content-between align-items-center border-0"><span className='d-flex align-items-center'><span className="d-inline-block me-2 rounded-circle" style={{width:'15px',height:'15px',backgroundColor:departmentColorMap[dept]}}></span>{dept}</span><span className="fw-bold">{count}</span></li>))}</ul>
                </div>
            </div>
            <div className="col-lg-9">
                <div className="card p-4 mb-4">
                    <h5 className="fw-bold mb-3">{isEditing ? <><Icon classes="bi-pencil-square me-2"/>Edit Employee</> : <><Icon classes="bi-person-plus-fill me-2"/>Add New Employee</>}</h5>
                    <div className="row g-3">
                        <div className="col-md-4"><input type="text" className="form-control" name="id" value={form.id} onChange={handleChange} placeholder="Employee ID" disabled={isEditing}/></div>
                        <div className="col-md-4"><input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="Full Name"/></div>
                        <div className="col-md-4"><input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} placeholder="Email Address"/></div>
                        <div className="col-md-6"><input type="text" className="form-control" name="position" value={form.position} onChange={handleChange} placeholder="Position / Role"/></div>
                        <div className="col-md-6"><select className="form-select" name="department" value={form.department} onChange={handleChange}><option value="">Select Department</option>{['Product','Marketing','Design','HR','Developer'].map(d=><option key={d} value={d}>{d}</option>)}</select></div>
                        <div className="col-md-6"><select className="form-select" name="gender" value={form.gender} onChange={handleChange}><option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
                        <div className="col-md-6"><input type="date" className="form-control" name="dateOfJoining" value={form.dateOfJoining?form.dateOfJoining.substring(0,10):''} onChange={handleChange} title="Date of Joining"/></div>
                        <div className="col-md-6"><label htmlFor="photo-upload" className="btn btn-outline-secondary w-100 text-start"><Icon classes="bi-camera-fill me-2"/> {form.photoName||'Upload Photo'}</label><input type="file" id="photo-upload" accept="image/*" className="d-none" onChange={(e)=>handleFileChange(e,'photo')}/></div>
                        <div className="col-md-6"><label htmlFor="resume-upload" className="btn btn-outline-secondary w-100 text-start"><Icon classes="bi-file-earmark-text-fill me-2"/> {form.resumeName||'Upload Resume'}</label><input type="file" id="resume-upload" accept=".pdf,.doc,.docx" className="d-none" onChange={(e)=>handleFileChange(e,'resume')}/></div>
                    </div>
                    {formError&&<div className="alert alert-danger mt-3 p-2 text-center">{formError}</div>}
                    <div className="d-flex justify-content-end gap-2 mt-3"><button className="btn btn-secondary" onClick={clearForm}>Cancel</button><button className={`btn btn-${isEditing?'warning':'success'}`} onClick={handleAddOrUpdate}>{isEditing?<><Icon classes="bi-check-circle-fill me-1"/> Update</>:<><Icon classes="bi-plus-circle-fill me-1"/> Add</>}</button></div>
                </div>
                <div className="card">
                    <div className="card-header bg-transparent p-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold mb-0"><Icon classes="bi-list-ul me-2"/>Employee List</h5>
                            <div className="w-50"><input type="text" className="form-control" placeholder="Search..." value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)}/></div>
                        </div>
                        <div className="d-flex align-items-end gap-3 mt-3">
                            <select className="form-select" name="department" value={filters.department} onChange={handleFilterChange}><option value="">Filter by Department</option>{['Product','Marketing','Design','HR','Developer'].map(d=><option key={d} value={d}>{d}</option>)}</select>
                            <select className="form-select" name="gender" value={filters.gender} onChange={handleFilterChange}><option value="">Filter by Gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select>
                            <div className="flex-grow-1">
                                <label htmlFor="startDate" className="form-label small mb-0">Start Date</label>
                                <input type="date" id="startDate" className="form-control" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                            </div>
                            <div className="flex-grow-1">
                                <label htmlFor="endDate" className="form-label small mb-0">End Date</label>
                                <input type="date" id="endDate" className="form-control" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                            </div>
                            <button className="btn btn-outline-secondary" onClick={clearFilters}>Clear</button>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead><tr>{['photo','id','name','email','position','department','gender','dateOfJoining','resume','actions'].map((col)=>(<th key={col} onClick={()=>handleSort(col)} className="text-nowrap" style={{cursor:'pointer'}}>{col.charAt(0).toUpperCase()+col.slice(1)}{sortConfig.key===col&&!['photo','resume','actions'].includes(col)&&<span className="ms-2">{sortConfig.direction==='asc'?<Icon classes="bi-arrow-up-short"/>:<Icon classes="bi-arrow-down-short"/>}</span>}</th>))}</tr></thead>
                                <tbody>
                                    {sortedEmployees.map(emp=>(<tr key={emp.id}><td>{emp.photo?(<img src={emp.photo} alt={emp.name} className="rounded-circle" style={{width:'45px',height:'45px',objectFit:'cover'}}/>):(<div className="rounded-circle bg-secondary d-flex justify-content-center align-items-center text-white fw-bold" style={{width:'45px',height:'45px'}}>{emp.name.charAt(0)}</div>)}</td><td><span className="badge text-bg-secondary">{emp.id}</span></td><td>{emp.name}</td><td>{emp.email}</td><td>{emp.position}</td><td><span className="badge rounded-pill text-white fw-semibold" style={{backgroundColor:departmentColorMap[emp.department],padding:'0.5em 0.75em'}}>{emp.department}</span></td><td>{emp.gender}</td><td>{new Date(emp.dateOfJoining).toLocaleDateString()}</td><td>{emp.resume?(<a href={emp.resume} download={emp.resumeName||`Resume_${emp.name}.pdf`} className="btn btn-sm btn-outline-success"><Icon classes="bi-download"/></a>):(<span className="text-muted small">N/A</span>)}</td><td className="text-nowrap"><button className="btn btn-sm btn-outline-primary me-2" onClick={()=>handleEdit(emp)}><Icon classes="bi-pencil-fill"/></button><button className="btn btn-sm btn-outline-danger" onClick={()=>handleDelete(emp.id)}><Icon classes="bi-trash3-fill"/></button></td></tr>))}
                                    {sortedEmployees.length===0&&<tr><td colSpan="10" className="text-center p-4 text-muted">No employees found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </main>
      </div>
    </div>
  );
}

export default App;



/*
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const API_URL = 'http://localhost:5001/api/employees';

const Icon = ({ classes }) => <i className={`bi ${classes}`}></i>;

function App() {
  // --- STATE MANAGEMENT ---
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ id: '', name: '', email: '', position: '', department: '', gender: '', dateOfJoining: '', photo: '', resume: '', resumeName: '' });
  const [filters, setFilters] = useState({ department: '', gender: '', startDate: '', endDate: '' });
  
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('isAuthenticated') === 'true');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [formError, setFormError] = useState('');

  // --- EFFECTS ---
  useEffect(() => {
    if (isAuthenticated) {
      fetchEmployees();
    }
  }, [isAuthenticated, filters]);

  useEffect(() => { localStorage.setItem('theme', darkMode ? 'dark' : 'light'); }, [darkMode]);
  useEffect(() => { localStorage.setItem('isAuthenticated', String(isAuthenticated)); }, [isAuthenticated]);
  
  // --- HANDLERS ---
  const fetchEmployees = () => {
    axios.get(API_URL, { params: filters })
      .then(response => {
        if (Array.isArray(response.data)) {
          setEmployees(response.data);
        } else {
          console.error("Data received from API is not an array:", response.data);
          setEmployees([]);
        }
      })
      .catch(error => {
        console.error("Error fetching employees:", error);
        setEmployees([]);
      });
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const clearFilters = () => setFilters({ department: '', gender: '', startDate: '', endDate: '' });
  
  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm(prev => ({ ...prev, [fileType]: file, [`${fileType}Name`]: file.name }));
  };
  
  //const handleFileChange = (e, fileType) => {
  //  const file = e.target.files[0];
  //  if (!file) return;
  //  const reader = new FileReader();
  //  reader.onloadend = () => { setForm((prevForm) => ({ ...prevForm, [fileType]: reader.result, [`${fileType}Name`]: file.name })); };
  //  reader.readAsDataURL(file);
  //};
  

  const clearForm = () => {
    setForm({ id: '', name: '', email: '', position: '', department: '', gender: '', dateOfJoining: '', photo: '', resume: '', resumeName: '' });
    setIsEditing(false);
    setFormError('');
  };

  const handleAddOrUpdate = () => {
  setFormError('');
  const required = ['id', 'name', 'email', 'position', 'department', 'gender', 'dateOfJoining'];
  const missing = required.filter(key => !form[key]);
  if (missing.length > 0) {
    setFormError('All fields (except files) are required.');
    return;
  }

  const formData = new FormData();
  for (let key in form) {
    if (form[key] && key !== 'resumeName' && key !== 'photoName') {
      if (form[key] instanceof File) {
        formData.append(key, form[key]); // photo/resume
      } else {
        formData.append(key, form[key]); // text fields
      }
    }
  }

  const config = { headers: { 'Content-Type': 'multipart/form-data' } };
  const apiCall = isEditing
    ? axios.post(`${API_URL}/update/${form.id}`, formData, config)
    : axios.post(`${API_URL}/add`, formData, config);

  apiCall
    .then(() => { fetchEmployees(); clearForm(); })
    .catch(error => {
      console.error('Error submitting form:', error);
      const msg = error.response?.data?.includes('E11000') ? 'Employee ID already exists.' : 'Submission failed.';
      setFormError(msg);
    });
};





   //old 
  //const handleAddOrUpdate = () => {
    setFormError('');
    if (!form.id || !form.name || !form.email || !form.position || !form.department || !form.gender || !form.dateOfJoining) {
      setFormError('All fields (except files) are required.');
      return;
    }
    const apiCall = isEditing ? axios.post(`${API_URL}/update/${form.id}`, form) : axios.post(`${API_URL}/add`, form);
    apiCall
      .then(() => { fetchEmployees(); clearForm(); })
      .catch(error => {
        console.error('Error submitting form:', error);
        const errorMessage = error.response?.data?.includes('E11000') ? 'An employee with this ID already exists.' : 'An error occurred while saving.';
        setFormError(errorMessage);
      });
  //};



  const handleEdit = (emp) => {
    const { _id, __v, createdAt, updatedAt, ...formData } = emp;
    setForm(formData);
    setIsEditing(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      axios.delete(`${API_URL}/${id}`)
        .then(() => { fetchEmployees(); if (form.id === id) clearForm(); })
        .catch(error => { console.error("There was an error deleting the employee:", error); });
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (e.target.username.value === 'admin' && e.target.password.value === '1234') { setIsAuthenticated(true); } else { alert('Invalid credentials!'); }
  };

  const handleLogout = () => setIsAuthenticated(false);

  const handleSort = (key) => {
    if (['photo', 'resume', 'actions'].includes(key)) return;
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  // --- DATA DERIVATION & STYLING ---
  const departmentCounts = employees.reduce((acc, emp) => { acc[emp.department] = (acc[emp.department] || 0) + 1; return acc; }, {});
  const departmentColorMap = Object.keys(departmentCounts).reduce((acc, dept, index) => {
      const colors = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1', '#0dcaf0'];
      acc[dept] = colors[index % colors.length]; return acc;
  }, {});
  const pieData = { labels: Object.keys(departmentCounts), datasets: [{ data: Object.values(departmentCounts), backgroundColor: Object.keys(departmentCounts).map(dept => departmentColorMap[dept]), borderColor: darkMode ? '#212529' : '#fff', borderWidth: 4, }], };
  const pieOptions = { plugins: { legend: { display: false } } };
  const filteredEmployees = employees.filter(emp => emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || emp.id.toLowerCase().includes(searchQuery.toLowerCase()) || emp.email.toLowerCase().includes(searchQuery.toLowerCase()));
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const valA = a[sortConfig.key]?.toString().toLowerCase() || ''; const valB = b[sortConfig.key]?.toString().toLowerCase() || '';
    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1; if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });
  const themeClass = darkMode ? 'dark-mode' : 'light-mode';
  
  // --- RENDER LOGIC ---
  return (
    <div className={`app-container ${themeClass}`}>
      
      <style>{`
        .app-container { min-height: 100vh; transition: background-color 0.3s, color 0.3s; }
        .light-mode { background-color: #f8f9fa; color: #212529; }
        .dark-mode { background-color: #121212; color: #e0e0e0; }
        .card { border: 1px solid; transition: background-color 0.3s, border-color 0.3s; }
        .light-mode .card { background-color: #ffffff; border-color: #dee2e6; }
        .dark-mode .card { background-color: #1e1e1e; border-color: #424242; }
        .dark-mode .form-control, .dark-mode .form-select { background-color: #333; color: #e0e0e0; border-color: #555; }
        .dark-mode .form-control::placeholder { color: #888; }
        .dark-mode .form-control:focus, .dark-mode .form-select:focus { background-color: #444; border-color: #86b7fe; box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25); }
        .table { color: inherit; }
        .dark-mode .table { --bs-table-striped-bg: rgba(255, 255, 255, 0.05); --bs-table-hover-bg: rgba(255, 255, 255, 0.1); border-color: #424242; }
        .dark-mode .list-group-item { background-color: transparent !important; color: #e0e0e0 !important; }
        .login-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; }

        
        .dark-mode .card h5 { color: #ffffff; }
        
        .dark-mode .form-label { color: #e0e0e0; }
       
        .dark-mode th { color: #000000; }
      `}</style>
      {!isAuthenticated ? (
        <div className="login-container"><div className="card p-4 p-md-5 shadow-lg" style={{minWidth:'380px'}}><h2 className="text-center fw-bold mb-4">Admin Login</h2><form onSubmit={handleLogin}><div className="mb-3"><label className="form-label">Username</label><input type="text" name="username" className="form-control form-control-lg" defaultValue="admin" required/></div><div className="mb-4"><label className="form-label">Password</label><input type="password" name="password" className="form-control form-control-lg" defaultValue="1234" required/></div><button type="submit" className="btn btn-primary w-100 btn-lg">Login</button></form></div></div>
      ) : (
        <div className="container-fluid py-4">
          <header className="d-flex justify-content-between align-items-center mb-4 px-3"><h1 className="fw-bold fs-2"><Icon classes="bi-people-fill me-2"/> Employee Dashboard</h1><div className="d-flex align-items-center gap-3"><div className="form-check form-switch fs-5"><input className="form-check-input" type="checkbox" role="switch" id="darkModeSwitch" checked={darkMode} onChange={()=>setDarkMode(!darkMode)}/><label className="form-check-label" htmlFor="darkModeSwitch">{darkMode?<Icon classes="bi-moon-stars-fill"/>:<Icon classes="bi-sun-fill"/>}</label></div><button className="btn btn-outline-danger" onClick={handleLogout}><Icon classes="bi-box-arrow-right me-1"/> Logout</button></div></header>
          <main className="row g-4">
            <div className="col-lg-3"><div className="card p-3 h-100"><h5 className="text-center fw-bold mb-3"><Icon classes="bi-pie-chart-fill me-2"/>Department Stats</h5><div className="px-4"><Pie data={pieData} options={pieOptions}/></div><ul className="list-group list-group-flush mt-3">{Object.entries(departmentCounts).map(([dept,count])=>(<li key={dept} className="list-group-item d-flex justify-content-between align-items-center border-0"><span className='d-flex align-items-center'><span className="d-inline-block me-2 rounded-circle" style={{width:'15px',height:'15px',backgroundColor:departmentColorMap[dept]}}></span>{dept}</span><span className="fw-bold">{count}</span></li>))}</ul></div></div>
            <div className="col-lg-9">
              <div className="card p-4 mb-4">
                <h5 className="fw-bold mb-3">{isEditing?<><Icon classes="bi-pencil-square me-2"/>Edit Employee</>:<><Icon classes="bi-person-plus-fill me-2"/>Add New Employee</>}</h5>
                <div className="row g-3">
                  <div className="col-md-4"><input type="text" className="form-control" name="id" value={form.id} onChange={handleChange} placeholder="Employee ID" disabled={isEditing}/></div>
                  <div className="col-md-4"><input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="Full Name"/></div>
                  <div className="col-md-4"><input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} placeholder="Email Address"/></div>
                  <div className="col-md-6"><input type="text" className="form-control" name="position" value={form.position} onChange={handleChange} placeholder="Position / Role"/></div>
                  <div className="col-md-6"><select className="form-select" name="department" value={form.department} onChange={handleChange}><option value="">Select Department</option>{['Product','Marketing','Design','HR','Developer'].map(d=><option key={d} value={d}>{d}</option>)}</select></div>
                  <div className="col-md-6"><select className="form-select" name="gender" value={form.gender} onChange={handleChange}><option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
                  <div className="col-md-6"><input type="date" className="form-control" name="dateOfJoining" value={form.dateOfJoining?form.dateOfJoining.substring(0,10):''} onChange={handleChange} title="Date of Joining"/></div>
                  <div className="col-md-6"><label htmlFor="photo-upload" className="btn btn-outline-secondary w-100 text-start"><Icon classes="bi-camera-fill me-2"/> {form.photoName||'Upload Photo'}</label><input type="file" id="photo-upload" accept="image/*" className="d-none" onChange={(e)=>handleFileChange(e,'photo')}/></div>
                  <div className="col-md-6"><label htmlFor="resume-upload" className="btn btn-outline-secondary w-100 text-start"><Icon classes="bi-file-earmark-text-fill me-2"/> {form.resumeName||'Upload Resume'}</label><input type="file" id="resume-upload" accept=".pdf,.doc,.docx" className="d-none" onChange={(e)=>handleFileChange(e,'resume')}/></div>
                </div>
                {formError&&<div className="alert alert-danger mt-3 p-2 text-center">{formError}</div>}
                <div className="d-flex justify-content-end gap-2 mt-3"><button className="btn btn-secondary" onClick={clearForm}>Cancel</button><button className={`btn btn-${isEditing?'warning':'success'}`} onClick={handleAddOrUpdate}>{isEditing?<><Icon classes="bi-check-circle-fill me-1"/> Update</>:<><Icon classes="bi-plus-circle-fill me-1"/> Add</>}</button></div>
              </div>
              <div className="card">
                <div className="card-header bg-transparent p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0"><Icon classes="bi-list-ul me-2"/>Employee List</h5>
                    <div className="w-50"><input type="text" className="form-control" placeholder="Search..." value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)}/></div>
                  </div>
                  <div className="d-flex align-items-end gap-3 mt-3">
                    <select className="form-select" name="department" value={filters.department} onChange={handleFilterChange}><option value="">Filter by Department</option>{['Product','Marketing','Design','HR','Developer'].map(d=><option key={d} value={d}>{d}</option>)}</select>
                    <select className="form-select" name="gender" value={filters.gender} onChange={handleFilterChange}><option value="">Filter by Gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select>
                    <div className="flex-grow-1">
                      <label htmlFor="startDate" className="form-label small mb-0">Start Date</label>
                      <input type="date" id="startDate" className="form-control" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                    </div>
                    <div className="flex-grow-1">
                      <label htmlFor="endDate" className="form-label small mb-0">End Date</label>
                      <input type="date" id="endDate" className="form-control" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                    </div>
                    <button className="btn btn-outline-secondary" onClick={clearFilters}>Clear</button>
                  </div>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead><tr>{['photo','id','name','email','position','department','gender','dateOfJoining','resume','actions'].map((col)=>(<th key={col} onClick={()=>handleSort(col)} className="text-nowrap" style={{cursor:'pointer'}}>{col.charAt(0).toUpperCase()+col.slice(1)}{sortConfig.key===col&&!['photo','resume','actions'].includes(col)&&<span className="ms-2">{sortConfig.direction==='asc'?<Icon classes="bi-arrow-up-short"/>:<Icon classes="bi-arrow-down-short"/>}</span>}</th>))}</tr></thead>
                      <tbody>
                        {sortedEmployees.map(emp=>(<tr key={emp.id}><td>{emp.photo?(<img src={emp.photo} alt={emp.name} className="rounded-circle" style={{width:'45px',height:'45px',objectFit:'cover'}}/>):(<div className="rounded-circle bg-secondary d-flex justify-content-center align-items-center text-white fw-bold" style={{width:'45px',height:'45px'}}>{emp.name.charAt(0)}</div>)}</td><td><span className="badge text-bg-secondary">{emp.id}</span></td><td>{emp.name}</td><td>{emp.email}</td><td>{emp.position}</td><td><span className="badge rounded-pill text-white fw-semibold" style={{backgroundColor:departmentColorMap[emp.department],padding:'0.5em 0.75em'}}>{emp.department}</span></td><td>{emp.gender}</td><td>{new Date(emp.dateOfJoining).toLocaleDateString()}</td><td>{emp.resume?(<a href={emp.resume} download={emp.resumeName||`Resume_${emp.name}.pdf`} className="btn btn-sm btn-outline-success"><Icon classes="bi-download"/></a>):(<span className="text-muted small">N/A</span>)}</td><td className="text-nowrap"><button className="btn btn-sm btn-outline-primary me-2" onClick={()=>handleEdit(emp)}><Icon classes="bi-pencil-fill"/></button><button className="btn btn-sm btn-outline-danger" onClick={()=>handleDelete(emp.id)}><Icon classes="bi-trash3-fill"/></button></td></tr>))}
                        {sortedEmployees.length===0&&<tr><td colSpan="10" className="text-center p-4 text-muted">No employees found.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;


/*




/* 2ND CODE WITH FILTERS 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// We are using the full URL since the proxy method was causing issues.
const API_URL = 'http://localhost:5001/api/employees';

const Icon = ({ classes }) => <i className={`bi ${classes}`}></i>;

function App() {
  // --- STATE MANAGEMENT ---
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ id: '', name: '', email: '', position: '', department: '', gender: '', dateOfJoining: '', photo: '', resume: '', resumeName: '' });
  const [filters, setFilters] = useState({ department: '', gender: '', startDate: '', endDate: '' });
  
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('isAuthenticated') === 'true');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [formError, setFormError] = useState('');

  // --- EFFECTS ---
  useEffect(() => {
    if (isAuthenticated) {
      fetchEmployees();
    }
  }, [isAuthenticated, filters]);

  useEffect(() => { localStorage.setItem('theme', darkMode ? 'dark' : 'light'); }, [darkMode]);
  useEffect(() => { localStorage.setItem('isAuthenticated', String(isAuthenticated)); }, [isAuthenticated]);
  
  // --- HANDLERS ---
  const fetchEmployees = () => {
    axios.get(API_URL, { params: filters })
      .then(response => {
        if (Array.isArray(response.data)) {
          setEmployees(response.data);
        } else {
          console.error("Data received from API is not an array:", response.data);
          setEmployees([]);
        }
      })
      .catch(error => {
        console.error("Error fetching employees:", error);
        setEmployees([]);
      });
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const clearFilters = () => setFilters({ department: '', gender: '', startDate: '', endDate: '' });

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setForm((prevForm) => ({ ...prevForm, [fileType]: reader.result, [`${fileType}Name`]: file.name })); };
    reader.readAsDataURL(file);
  };

  const clearForm = () => {
    setForm({ id: '', name: '', email: '', position: '', department: '', gender: '', dateOfJoining: '', photo: '', resume: '', resumeName: '' });
    setIsEditing(false);
    setFormError('');
  };

  const handleAddOrUpdate = () => {
    setFormError('');
    if (!form.id || !form.name || !form.email || !form.position || !form.department || !form.gender || !form.dateOfJoining) {
      setFormError('All fields (except files) are required.');
      return;
    }
    const apiCall = isEditing ? axios.post(`${API_URL}/update/${form.id}`, form) : axios.post(`${API_URL}/add`, form);
    apiCall
      .then(() => { fetchEmployees(); clearForm(); })
      .catch(error => {
        console.error('Error submitting form:', error);
        const errorMessage = error.response?.data?.includes('E11000') ? 'An employee with this ID already exists.' : 'An error occurred while saving.';
        setFormError(errorMessage);
      });
  };

  const handleEdit = (emp) => {
    const { _id, __v, createdAt, updatedAt, ...formData } = emp;
    setForm(formData);
    setIsEditing(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      axios.delete(`${API_URL}/${id}`)
        .then(() => { fetchEmployees(); if (form.id === id) clearForm(); })
        .catch(error => { console.error("There was an error deleting the employee:", error); });
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (e.target.username.value === 'admin' && e.target.password.value === '1234') { setIsAuthenticated(true); } else { alert('Invalid credentials!'); }
  };

  const handleLogout = () => setIsAuthenticated(false);

  const handleSort = (key) => {
    if (['photo', 'resume', 'actions'].includes(key)) return;
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  // --- DATA DERIVATION & STYLING ---
  const departmentCounts = employees.reduce((acc, emp) => { acc[emp.department] = (acc[emp.department] || 0) + 1; return acc; }, {});
  const departmentColorMap = Object.keys(departmentCounts).reduce((acc, dept, index) => {
      const colors = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1', '#0dcaf0'];
      acc[dept] = colors[index % colors.length]; return acc;
  }, {});
  const pieData = { labels: Object.keys(departmentCounts), datasets: [{ data: Object.values(departmentCounts), backgroundColor: Object.keys(departmentCounts).map(dept => departmentColorMap[dept]), borderColor: darkMode ? '#212529' : '#fff', borderWidth: 4, }], };
  const pieOptions = { plugins: { legend: { display: false } } };
  const filteredEmployees = employees.filter(emp => emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || emp.id.toLowerCase().includes(searchQuery.toLowerCase()) || emp.email.toLowerCase().includes(searchQuery.toLowerCase()));
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const valA = a[sortConfig.key]?.toString().toLowerCase() || ''; const valB = b[sortConfig.key]?.toString().toLowerCase() || '';
    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1; if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });
  const themeClass = darkMode ? 'dark-mode' : 'light-mode';
  
  // --- RENDER LOGIC ---
  return (
    <div className={`app-container ${themeClass}`}>
      <style>{`.app-container{min-height:100vh;transition:background-color .3s,color .3s}.light-mode{background-color:#f8f9fa;color:#212529}.dark-mode{background-color:#121212;color:#e0e0e0}.card{border:1px solid;transition:background-color .3s,border-color .3s}.light-mode .card{background-color:#fff;border-color:#dee2e6}.dark-mode .card{background-color:#1e1e1e;border-color:#424242}.dark-mode .form-control,.dark-mode .form-select{background-color:#333;color:#e0e0e0;border-color:#555}.dark-mode .form-control::placeholder{color:#888}.dark-mode .form-control:focus,.dark-mode .form-select:focus{background-color:#444;border-color:#86b7fe;box-shadow:0 0 0 .25rem rgba(13,110,253,.25)}.table{color:inherit}.dark-mode .table{--bs-table-striped-bg:rgba(255,255,255,.05);--bs-table-hover-bg:rgba(255,255,255,.1);border-color:#424242}.dark-mode th{color:#fff}.dark-mode .list-group-item{background-color:transparent!important;color:#e0e0e0!important}.login-container{display:flex;justify-content:center;align-items:center;min-height:100vh}`}</style>
      {!isAuthenticated ? (
        <div className="login-container"><div className="card p-4 p-md-5 shadow-lg" style={{minWidth:'380px'}}><h2 className="text-center fw-bold mb-4">Admin Login</h2><form onSubmit={handleLogin}><div className="mb-3"><label className="form-label">Username</label><input type="text" name="username" className="form-control form-control-lg" defaultValue="admin" required/></div><div className="mb-4"><label className="form-label">Password</label><input type="password" name="password" className="form-control form-control-lg" defaultValue="1234" required/></div><button type="submit" className="btn btn-primary w-100 btn-lg">Login</button></form></div></div>
      ) : (
        <div className="container-fluid py-4">
          <header className="d-flex justify-content-between align-items-center mb-4 px-3"><h1 className="fw-bold fs-2"><Icon classes="bi-people-fill me-2"/> Employee Dashboard</h1><div className="d-flex align-items-center gap-3"><div className="form-check form-switch fs-5"><input className="form-check-input" type="checkbox" role="switch" id="darkModeSwitch" checked={darkMode} onChange={()=>setDarkMode(!darkMode)}/><label className="form-check-label" htmlFor="darkModeSwitch">{darkMode?<Icon classes="bi-moon-stars-fill"/>:<Icon classes="bi-sun-fill"/>}</label></div><button className="btn btn-outline-danger" onClick={handleLogout}><Icon classes="bi-box-arrow-right me-1"/> Logout</button></div></header>
          <main className="row g-4">
            <div className="col-lg-3"><div className="card p-3 h-100"><h5 className="text-center fw-bold mb-3"><Icon classes="bi-pie-chart-fill me-2"/>Department Stats</h5><div className="px-4"><Pie data={pieData} options={pieOptions}/></div><ul className="list-group list-group-flush mt-3">{Object.entries(departmentCounts).map(([dept,count])=>(<li key={dept} className="list-group-item d-flex justify-content-between align-items-center border-0"><span className='d-flex align-items-center'><span className="d-inline-block me-2 rounded-circle" style={{width:'15px',height:'15px',backgroundColor:departmentColorMap[dept]}}></span>{dept}</span><span className="fw-bold">{count}</span></li>))}</ul></div></div>
            <div className="col-lg-9">
              <div className="card p-4 mb-4">
                <h5 className="fw-bold mb-3">{isEditing?<><Icon classes="bi-pencil-square me-2"/>Edit Employee</>:<><Icon classes="bi-person-plus-fill me-2"/>Add New Employee</>}</h5>
                <div className="row g-3">
                  <div className="col-md-4"><input type="text" className="form-control" name="id" value={form.id} onChange={handleChange} placeholder="Employee ID" disabled={isEditing}/></div>
                  <div className="col-md-4"><input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="Full Name"/></div>
                  <div className="col-md-4"><input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} placeholder="Email Address"/></div>
                  <div className="col-md-6"><input type="text" className="form-control" name="position" value={form.position} onChange={handleChange} placeholder="Position / Role"/></div>
                  <div className="col-md-6"><select className="form-select" name="department" value={form.department} onChange={handleChange}><option value="">Select Department</option>{['Product','Marketing','Design','HR','Developer'].map(d=><option key={d} value={d}>{d}</option>)}</select></div>
                  <div className="col-md-6"><select className="form-select" name="gender" value={form.gender} onChange={handleChange}><option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
                  <div className="col-md-6"><input type="date" className="form-control" name="dateOfJoining" value={form.dateOfJoining?form.dateOfJoining.substring(0,10):''} onChange={handleChange} title="Date of Joining"/></div>
                  <div className="col-md-6"><label htmlFor="photo-upload" className="btn btn-outline-secondary w-100 text-start"><Icon classes="bi-camera-fill me-2"/> {form.photoName||'Upload Photo'}</label><input type="file" id="photo-upload" accept="image/*" className="d-none" onChange={(e)=>handleFileChange(e,'photo')}/></div>
                  <div className="col-md-6"><label htmlFor="resume-upload" className="btn btn-outline-secondary w-100 text-start"><Icon classes="bi-file-earmark-text-fill me-2"/> {form.resumeName||'Upload Resume'}</label><input type="file" id="resume-upload" accept=".pdf,.doc,.docx" className="d-none" onChange={(e)=>handleFileChange(e,'resume')}/></div>
                </div>
                {formError&&<div className="alert alert-danger mt-3 p-2 text-center">{formError}</div>}
                <div className="d-flex justify-content-end gap-2 mt-3"><button className="btn btn-secondary" onClick={clearForm}>Cancel</button><button className={`btn btn-${isEditing?'warning':'success'}`} onClick={handleAddOrUpdate}>{isEditing?<><Icon classes="bi-check-circle-fill me-1"/> Update</>:<><Icon classes="bi-plus-circle-fill me-1"/> Add</>}</button></div>
              </div>
              <div className="card">
                <div className="card-header bg-transparent p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0"><Icon classes="bi-list-ul me-2"/>Employee List</h5>
                    <div className="w-50"><input type="text" className="form-control" placeholder="Search..." value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)}/></div>
                  </div>
                  
                  <div className="d-flex align-items-end gap-3 mt-3">
                    <select className="form-select" name="department" value={filters.department} onChange={handleFilterChange}><option value="">Filter by Department</option>{['Product','Marketing','Design','HR','Developer'].map(d=><option key={d} value={d}>{d}</option>)}</select>
                    <select className="form-select" name="gender" value={filters.gender} onChange={handleFilterChange}><option value="">Filter by Gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select>
                    <div className="flex-grow-1">
                      <label htmlFor="startDate" className="form-label small mb-0">Start Date</label>
                      <input type="date" id="startDate" className="form-control" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                    </div>
                    <div className="flex-grow-1">
                      <label htmlFor="endDate" className="form-label small mb-0">End Date</label>
                      <input type="date" id="endDate" className="form-control" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                    </div>
                    <button className="btn btn-outline-secondary" onClick={clearFilters}>Clear</button>
                  </div>
                  
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead><tr>{['photo','id','name','email','position','department','gender','dateOfJoining','resume','actions'].map((col)=>(<th key={col} onClick={()=>handleSort(col)} className="text-nowrap" style={{cursor:'pointer'}}>{col.charAt(0).toUpperCase()+col.slice(1)}{sortConfig.key===col&&!['photo','resume','actions'].includes(col)&&<span className="ms-2">{sortConfig.direction==='asc'?<Icon classes="bi-arrow-up-short"/>:<Icon classes="bi-arrow-down-short"/>}</span>}</th>))}</tr></thead>
                      <tbody>
                        {sortedEmployees.map(emp=>(<tr key={emp.id}><td>{emp.photo?(<img src={emp.photo} alt={emp.name} className="rounded-circle" style={{width:'45px',height:'45px',objectFit:'cover'}}/>):(<div className="rounded-circle bg-secondary d-flex justify-content-center align-items-center text-white fw-bold" style={{width:'45px',height:'45px'}}>{emp.name.charAt(0)}</div>)}</td><td><span className="badge text-bg-secondary">{emp.id}</span></td><td>{emp.name}</td><td>{emp.email}</td><td>{emp.position}</td><td><span className="badge rounded-pill text-white fw-semibold" style={{backgroundColor:departmentColorMap[emp.department],padding:'0.5em 0.75em'}}>{emp.department}</span></td><td>{emp.gender}</td><td>{new Date(emp.dateOfJoining).toLocaleDateString()}</td><td>{emp.resume?(<a href={emp.resume} download={emp.resumeName||`Resume_${emp.name}.pdf`} className="btn btn-sm btn-outline-success"><Icon classes="bi-download"/></a>):(<span className="text-muted small">N/A</span>)}</td><td className="text-nowrap"><button className="btn btn-sm btn-outline-primary me-2" onClick={()=>handleEdit(emp)}><Icon classes="bi-pencil-fill"/></button><button className="btn btn-sm btn-outline-danger" onClick={()=>handleDelete(emp.id)}><Icon classes="bi-trash3-fill"/></button></td></tr>))}
                        {sortedEmployees.length===0&&<tr><td colSpan="10" className="text-center p-4 text-muted">No employees found.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;

*/




/* 1ST CODE WITH NO FILTERS 


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// IMPORTANT: We are using the full URL because the proxy was causing issues.
// Make sure your backend server.js has the cors({ origin: '...' }) configuration.
const API_URL = 'http://localhost:5001/api/employees';

const Icon = ({ classes }) => <i className={`bi ${classes}`}></i>;

function App() {
  // --- Original State Management (No Filters) ---
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ id: '', name: '', email: '', position: '', department: '', photo: '', resume: '', resumeName: '' });
  
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('isAuthenticated') === 'true');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [formError, setFormError] = useState('');

  // --- Original Effects ---
  useEffect(() => {
    if (isAuthenticated) {
      fetchEmployees();
    }
  }, [isAuthenticated]); // Only depends on authentication status

  useEffect(() => { localStorage.setItem('theme', darkMode ? 'dark' : 'light'); }, [darkMode]);
  useEffect(() => { localStorage.setItem('isAuthenticated', String(isAuthenticated)); }, [isAuthenticated]);
  
  // --- Original Handlers ---
  const fetchEmployees = () => {
    axios.get(API_URL) // Simple GET request with no params
      .then(response => { setEmployees(response.data); })
      .catch(error => { console.error("Error fetching employees:", error); });
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setForm((prevForm) => ({ ...prevForm, [fileType]: reader.result, [`${fileType}Name`]: file.name })); };
    reader.readAsDataURL(file);
  };

  const clearForm = () => {
    setForm({ id: '', name: '', email: '', position: '', department: '', photo: '', resume: '', resumeName: '' });
    setIsEditing(false);
    setFormError('');
  };

  const handleAddOrUpdate = () => {
    setFormError('');
    if (!form.id || !form.name || !form.email || !form.position || !form.department) {
      setFormError('All fields (except files) are required.');
      return;
    }
    const apiCall = isEditing ? axios.post(`${API_URL}/update/${form.id}`, form) : axios.post(`${API_URL}/add`, form);
    apiCall
      .then(() => { fetchEmployees(); clearForm(); })
      .catch(error => {
        const errorMessage = error.response?.data?.includes('E11000') ? 'An employee with this ID already exists.' : 'An error occurred while saving.';
        setFormError(errorMessage);
      });
  };

  const handleEdit = (emp) => {
    const { _id, __v, createdAt, updatedAt, ...formData } = emp;
    setForm(formData);
    setIsEditing(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      axios.delete(`${API_URL}/${id}`)
        .then(() => { fetchEmployees(); if (form.id === id) clearForm(); })
        .catch(error => { console.error("There was an error deleting the employee:", error); });
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (e.target.username.value === 'admin' && e.target.password.value === '1234') { setIsAuthenticated(true); } else { alert('Invalid credentials!'); }
  };

  const handleLogout = () => setIsAuthenticated(false);

  const handleSort = (key) => {
    if (['photo', 'resume', 'actions'].includes(key)) return;
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  // --- DATA DERIVATION & STYLING (Unchanged) ---
  const departmentCounts = employees.reduce((acc, emp) => { acc[emp.department] = (acc[emp.department] || 0) + 1; return acc; }, {});
  const departmentColorMap = Object.keys(departmentCounts).reduce((acc, dept, index) => {
      const colors = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1', '#0dcaf0'];
      acc[dept] = colors[index % colors.length]; return acc;
  }, {});
  const pieData = { labels: Object.keys(departmentCounts), datasets: [{ data: Object.values(departmentCounts), backgroundColor: Object.keys(departmentCounts).map(dept => departmentColorMap[dept]), borderColor: darkMode ? '#212529' : '#fff', borderWidth: 4, }], };
  const pieOptions = { plugins: { legend: { display: false } } };
  const filteredEmployees = employees.filter(emp => emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || emp.id.toLowerCase().includes(searchQuery.toLowerCase()) || emp.email.toLowerCase().includes(searchQuery.toLowerCase()));
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const valA = a[sortConfig.key]?.toString().toLowerCase() || ''; const valB = b[sortConfig.key]?.toString().toLowerCase() || '';
    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1; if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });
  const themeClass = darkMode ? 'dark-mode' : 'light-mode';
  
  // --- RENDER LOGIC (Original version, no filter UI) ---
  return (
    <div className={`app-container ${themeClass}`}>
      <style>{`.app-container{min-height:100vh;transition:background-color .3s,color .3s}.light-mode{background-color:#f8f9fa;color:#212529}.dark-mode{background-color:#121212;color:#e0e0e0}.card{border:1px solid;transition:background-color .3s,border-color .3s}.light-mode .card{background-color:#fff;border-color:#dee2e6}.dark-mode .card{background-color:#1e1e1e;border-color:#424242}.dark-mode .form-control,.dark-mode .form-select{background-color:#333;color:#e0e0e0;border-color:#555}.dark-mode .form-control::placeholder{color:#888}.dark-mode .form-control:focus,.dark-mode .form-select:focus{background-color:#444;border-color:#86b7fe;box-shadow:0 0 0 .25rem rgba(13,110,253,.25)}.table{color:inherit}.dark-mode .table{--bs-table-striped-bg:rgba(255,255,255,.05);--bs-table-hover-bg:rgba(255,255,255,.1);border-color:#424242}.dark-mode th{color:#fff}.dark-mode .list-group-item{background-color:transparent!important;color:#e0e0e0!important}.login-container{display:flex;justify-content:center;align-items:center;min-height:100vh}`}</style>
      {!isAuthenticated ? (
        <div className="login-container"><div className="card p-4 p-md-5 shadow-lg" style={{minWidth:'380px'}}><h2 className="text-center fw-bold mb-4">Admin Login</h2><form onSubmit={handleLogin}><div className="mb-3"><label className="form-label">Username</label><input type="text" name="username" className="form-control form-control-lg" defaultValue="admin" required/></div><div className="mb-4"><label className="form-label">Password</label><input type="password" name="password" className="form-control form-control-lg" defaultValue="1234" required/></div><button type="submit" className="btn btn-primary w-100 btn-lg">Login</button></form></div></div>
      ) : (
        <div className="container-fluid py-4">
          <header className="d-flex justify-content-between align-items-center mb-4 px-3"><h1 className="fw-bold fs-2"><Icon classes="bi-people-fill me-2"/> Employee Dashboard</h1><div className="d-flex align-items-center gap-3"><div className="form-check form-switch fs-5"><input className="form-check-input" type="checkbox" role="switch" id="darkModeSwitch" checked={darkMode} onChange={()=>setDarkMode(!darkMode)}/><label className="form-check-label" htmlFor="darkModeSwitch">{darkMode?<Icon classes="bi-moon-stars-fill"/>:<Icon classes="bi-sun-fill"/>}</label></div><button className="btn btn-outline-danger" onClick={handleLogout}><Icon classes="bi-box-arrow-right me-1"/> Logout</button></div></header>
          <main className="row g-4">
            <div className="col-lg-3"><div className="card p-3 h-100"><h5 className="text-center fw-bold mb-3"><Icon classes="bi-pie-chart-fill me-2"/>Department Stats</h5><div className="px-4"><Pie data={pieData} options={pieOptions}/></div><ul className="list-group list-group-flush mt-3">{Object.entries(departmentCounts).map(([dept,count])=>(<li key={dept} className="list-group-item d-flex justify-content-between align-items-center border-0"><span className='d-flex align-items-center'><span className="d-inline-block me-2 rounded-circle" style={{width:'15px',height:'15px',backgroundColor:departmentColorMap[dept]}}></span>{dept}</span><span className="fw-bold">{count}</span></li>))}</ul></div></div>
            <div className="col-lg-9">
              <div className="card p-4 mb-4">
                <h5 className="fw-bold mb-3">{isEditing?<><Icon classes="bi-pencil-square me-2"/>Edit Employee</>:<><Icon classes="bi-person-plus-fill me-2"/>Add New Employee</>}</h5>
                <div className="row g-3">
                  <div className="col-md-4"><input type="text" className="form-control" name="id" value={form.id} onChange={handleChange} placeholder="Employee ID" disabled={isEditing}/></div>
                  <div className="col-md-4"><input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="Full Name"/></div>
                  <div className="col-md-4"><input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} placeholder="Email Address"/></div>
                  <div className="col-md-6"><input type="text" className="form-control" name="position" value={form.position} onChange={handleChange} placeholder="Position / Role"/></div>
                  <div className="col-md-6"><select className="form-select" name="department" value={form.department} onChange={handleChange}><option value="">Select Department</option>{['Product','Marketing','Design','HR','Developer'].map(d=><option key={d} value={d}>{d}</option>)}</select></div>
                  <div className="col-md-6"><label htmlFor="photo-upload" className="btn btn-outline-secondary w-100 text-start"><Icon classes="bi-camera-fill me-2"/> {form.photoName||'Upload Photo'}</label><input type="file" id="photo-upload" accept="image/*" className="d-none" onChange={(e)=>handleFileChange(e,'photo')}/></div>
                  <div className="col-md-6"><label htmlFor="resume-upload" className="btn btn-outline-secondary w-100 text-start"><Icon classes="bi-file-earmark-text-fill me-2"/> {form.resumeName||'Upload Resume'}</label><input type="file" id="resume-upload" accept=".pdf,.doc,.docx" className="d-none" onChange={(e)=>handleFileChange(e,'resume')}/></div>
                </div>
                {formError&&<div className="alert alert-danger mt-3 p-2 text-center">{formError}</div>}
                <div className="d-flex justify-content-end gap-2 mt-3"><button className="btn btn-secondary" onClick={clearForm}>Cancel</button><button className={`btn btn-${isEditing?'warning':'success'}`} onClick={handleAddOrUpdate}>{isEditing?<><Icon classes="bi-check-circle-fill me-1"/> Update</>:<><Icon classes="bi-plus-circle-fill me-1"/> Add</>}</button></div>
              </div>
              <div className="card">
                 <div className="card-header bg-transparent p-3 d-flex justify-content-between align-items-center">
                     <h5 className="fw-bold mb-0"><Icon classes="bi-list-ul me-2"/>Employee List</h5>
                     <div className="w-50"><input type="text" className="form-control" placeholder="Search..." value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)}/></div>
                 </div>
                 <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead><tr>{['photo','id','name','email','position','department','resume','actions'].map((col)=>(<th key={col} onClick={()=>handleSort(col)} className="text-nowrap" style={{cursor:'pointer'}}>{col.charAt(0).toUpperCase()+col.slice(1)}{sortConfig.key===col&&!['photo','resume','actions'].includes(col)&&<span className="ms-2">{sortConfig.direction==='asc'?<Icon classes="bi-arrow-up-short"/>:<Icon classes="bi-arrow-down-short"/>}</span>}</th>))}</tr></thead>
                            <tbody>
                                {sortedEmployees.map(emp=>(<tr key={emp.id}><td>{emp.photo?(<img src={emp.photo} alt={emp.name} className="rounded-circle" style={{width:'45px',height:'45px',objectFit:'cover'}}/>):(<div className="rounded-circle bg-secondary d-flex justify-content-center align-items-center text-white fw-bold" style={{width:'45px',height:'45px'}}>{emp.name.charAt(0)}</div>)}</td><td><span className="badge text-bg-secondary">{emp.id}</span></td><td>{emp.name}</td><td>{emp.email}</td><td>{emp.position}</td><td><span className="badge rounded-pill text-white fw-semibold" style={{backgroundColor:departmentColorMap[emp.department],padding:'0.5em 0.75em'}}>{emp.department}</span></td><td>{emp.resume?(<a href={emp.resume} download={emp.resumeName||`Resume_${emp.name}.pdf`} className="btn btn-sm btn-outline-success"><Icon classes="bi-download"/></a>):(<span className="text-muted small">N/A</span>)}</td><td className="text-nowrap"><button className="btn btn-sm btn-outline-primary me-2" onClick={()=>handleEdit(emp)}><Icon classes="bi-pencil-fill"/></button><button className="btn btn-sm btn-outline-danger" onClick={()=>handleDelete(emp.id)}><Icon classes="bi-trash3-fill"/></button></td></tr>))}
                                {sortedEmployees.length===0&&<tr><td colSpan="8" className="text-center p-4 text-muted">No employees found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                 </div>
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;

*/
