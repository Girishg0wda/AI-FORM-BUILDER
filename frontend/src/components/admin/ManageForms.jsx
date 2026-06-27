import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageForms = () => {
  const [forms, setForms] = useState([]);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/forms');
      setForms(response.data);
    } catch (error) {
      console.error('Error fetching forms:', error);
    }
  };

  const deleteForm = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/forms/${id}`);
      fetchForms();
    } catch (error) {
      console.error('Error deleting form:', error);
    }
  };

  return (
    <div>
      <h2>Manage Forms</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {forms.map(form => (
            <tr key={form.id}>
              <td>{form.name || 'Untitled Form'}</td>
              <td>
                <button onClick={() => deleteForm(form.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageForms;