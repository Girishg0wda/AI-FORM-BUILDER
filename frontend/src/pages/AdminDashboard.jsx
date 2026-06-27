import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminForm from '../components/AdminForm';

const AdminDashboard = () => {
  const [forms, setForms] = useState([]);

  useEffect(() => {
    // Fetch forms from localStorage or backend
    const savedForms = JSON.parse(localStorage.getItem('adminForms') || '[]');
    setForms(savedForms);
  }, []);

  const handleDelete = (id) => {
    const updatedForms = forms.filter(form => form.id !== id);
    setForms(updatedForms);
    localStorage.setItem('adminForms', JSON.stringify(updatedForms));
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <nav>
        <Link to="/admin/forms">Manage Forms</Link>
        <Link to="/admin/users">Manage Users</Link>
        <Link to="/admin/documents">Document Logs</Link>
      </nav>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Forms</h3>
          <p>{forms.length}</p>
        </div>
        <div className="stat-card">
          <h3>Active Users</h3>
          <p>2</p>
        </div>
        <div className="stat-card">
          <h3>Documents Processed</h3>
          <p>5</p>
        </div>
      </div>

      <section>
        <h2>Recent Forms</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {forms.map(form => (
              <AdminForm key={form.id} form={form} onDelete={handleDelete} />
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminDashboard;